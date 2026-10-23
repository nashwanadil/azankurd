// الاشتراك في تنبيه وقت الصلاة أو إلغاؤه: POST /api/push
// يحفظ لكل مشترك: رمز الإشعار من المتصفح، وإحداثيات مدينته مقرّبة، وطريقة الحساب، ونصوص الإشعار بلغته
// ولا يحفظ أي اسم أو بريد أو موقع دقيق
const crypto = require("crypto");
const { METHODS, nextPrayer, NOTIFY_KEYS } = require("./_core.js");
const { redis, pipeline, ready } = require("./_redis.js");

const MAX_SUBS = 100000;
const str = (v, n) => typeof v === "string" ? v.slice(0, n) : "";

async function body(req){
  if(req.body && typeof req.body === "object") return req.body;
  if(typeof req.body === "string") return JSON.parse(req.body);
  let raw = "";
  for await (const ch of req){ raw += ch; if(raw.length > 20000) throw new Error("too big"); }
  return JSON.parse(raw || "{}");
}
function send(res, code, obj){
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}
const validTz = tz => { try{ new Intl.DateTimeFormat("en", { timeZone:tz }); return true; }catch(e){ return false; } };

module.exports = async (req, res) => {
  if(req.method !== "POST") return send(res, 405, { ok:false });
  if(!ready()) return send(res, 503, { ok:false, error:"storage" });
  let b;
  try{ b = await body(req); }catch(e){ return send(res, 400, { ok:false }); }
  const sub = b.sub || {};
  const endpoint = str(sub.endpoint, 1000);
  if(!/^https:\/\//.test(endpoint)) return send(res, 400, { ok:false });
  const id = crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 24);

  if(b.action === "unsubscribe"){
    await pipeline([["DEL", "s:" + id], ["ZREM", "due", id]]);
    return send(res, 200, { ok:true });
  }

  const lat = Math.round(Number(b.lat) * 100) / 100, lng = Math.round(Number(b.lng) * 100) / 100;
  const method = Number(b.method), school = Number(b.school) === 1 ? 1 : 0;
  const tz = str(b.tz, 60);
  if(!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || !METHODS[method] || !validTz(tz) ||
     !sub.keys || !str(sub.keys.p256dh, 200) || !str(sub.keys.auth, 100)) return send(res, 400, { ok:false });
  const names = {};
  for(const k of NOTIFY_KEYS) names[k] = str(b.names && b.names[k], 30) || k;
  const rec = {
    sub:{ endpoint, keys:{ p256dh:str(sub.keys.p256dh, 200), auth:str(sub.keys.auth, 100) } },
    lat, lng, tz, method, school, names,
    tpl:str(b.tpl, 80) || "{p}", place:str(b.place, 60), fmt:b.fmt === "12" ? "12" : "24", lang:str(b.lang, 5)
  };
  const exists = await redis(["EXISTS", "s:" + id]);
  if(!exists && await redis(["ZCARD", "due"]) >= MAX_SUBS) return send(res, 503, { ok:false, error:"full" });
  const next = nextPrayer(lat, lng, tz, method, school, new Date());
  if(!next) return send(res, 400, { ok:false });
  await pipeline([["SET", "s:" + id, JSON.stringify(rec)], ["ZADD", "due", String(next.at.getTime()), id]]);
  send(res, 200, { ok:true, next:next.key, at:next.hm });
};
