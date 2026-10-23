// المنبّه: تطلبه خدمة cron-job.org كل دقيقة: /api/notify?key=NOTIFY_SECRET
// يسأل القاعدة سؤالًا واحدًا: من حان وقت صلاته الآن؟ فيرسل لهم الإشعار، ثم يحدد موعد صلاتهم التالية
const webpush = require("web-push");
const { nextEvent } = require("./_core.js");
const { redis, pipeline, ready } = require("./_redis.js");

const LATE = 15 * 60 * 1000;      // إن تأخر الإرسال أكثر من ربع ساعة (عطل مثلًا) نتجاوز هذه الصلاة ولا نرسل متأخرًا
const BATCH = 300;

function fmtTime(hm, fmt){
  if(fmt !== "12") return hm;
  const [h, m] = hm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

module.exports = async (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if(!process.env.NOTIFY_SECRET || u.searchParams.get("key") !== process.env.NOTIFY_SECRET){ res.statusCode = 401; return res.end("{}"); }
  if(!ready() || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY){ res.statusCode = 503; return res.end('{"error":"config"}'); }
  webpush.setVapidDetails("https://azankurd.com", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  const now = Date.now();
  const due = await redis(["ZRANGE", "due", "-inf", String(now), "BYSCORE", "WITHSCORES", "LIMIT", "0", String(BATCH)]);
  if(!due || !due.length) return res.end('{"sent":0}');
  const ids = [], at = {};
  for(let i = 0; i < due.length; i += 2){ ids.push(due[i]); at[due[i]] = Number(due[i + 1]); }
  const recs = await redis(["MGET", ...ids.map(id => "s:" + id)]);

  let sent = 0, skipped = 0, gone = 0;
  const writes = [];
  await Promise.all(ids.map(async (id, i) => {
    if(!recs[i]){ writes.push(["ZREM", "due", id]); return; }
    let r; try{ r = JSON.parse(recs[i]); }catch(e){ writes.push(["ZREM", "due", id]); return; }
    const t = at[id];
    // التنبيه الذي حان وقته لهذا المشترك، ثم التنبيه الذي بعده
    const prefs = r.prefs || null;
    const cur = nextEvent(r.lat, r.lng, r.tz, r.method, r.school, prefs, new Date(t - 1000));
    const nxt = nextEvent(r.lat, r.lng, r.tz, r.method, r.school, prefs, new Date(Math.max(t, now) + 1000));
    if(cur && Math.abs(cur.at - t) < 60000 && now - t <= LATE){
      const tpl = typeof r.tpl === "string" ? { adhan:r.tpl } : (r.tpl || {});
      const payload = JSON.stringify({
        title:(tpl[cur.type] || tpl.adhan || "{p}").replace("{p}", r.names[cur.key] || cur.key),
        body:[r.place, fmtTime(cur.hm, r.fmt)].filter(Boolean).join(" · "),
        tag:cur.type + "-" + cur.key, url:r.lang ? `/?lang=${r.lang}` : "/"
      });
      try{
        await webpush.sendNotification(r.sub, payload, { TTL:600, urgency:"high" });
        sent++;
      }catch(e){
        if(process.env.PUSH_DEBUG) console.log('push error', e.statusCode, e.message);
        // المتصفح ألغى الاشتراك أو انتهى: نحذفه من الدفتر
        if(e.statusCode === 404 || e.statusCode === 410){ writes.push(["DEL", "s:" + id], ["ZREM", "due", id]); gone++; return; }
      }
    } else skipped++;
    if(nxt) writes.push(["ZADD", "due", String(nxt.at.getTime()), id]);
    else writes.push(["ZREM", "due", id]);
  }));
  await pipeline(writes);
  res.end(JSON.stringify({ sent, skipped, gone }));
};
