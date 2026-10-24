// بحث احتياطي بالحروف العربية عن المدن التي ليس لها اسم عربي في قاعدة البحث
// مثال: «انغولشتات» أو «انجولشتاد» → Ingolstadt
// الفكرة: نحوّل الاسم العربي والأسماء اللاتينية إلى «هيكل» من الحروف الساكنة ونطابق بينهما
const { SITE } = require("./_core.js");
const DATA = require("./_cities.json");

function latSk(s){
  s = s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/ß/g, "ss").replace(/[^a-z]/g, "");
  s = s.replace(/sch|sh/g, "S").replace(/ch|kh|gh/g, "K").replace(/th/g, "T").replace(/ph/g, "f")
       .replace(/ck/g, "k").replace(/tz/g, "S").replace(/dzh|dj|zh/g, "K");
  const m = { b:"B", p:"B", t:"T", d:"T", k:"K", g:"K", q:"K", c:"K", j:"K", x:"KS", s:"S", z:"S", S:"S", K:"K", T:"T",
              f:"F", v:"F", w:"F", r:"R", l:"L", m:"M", n:"N" };
  let o = ""; for(const ch of s){ const v = m[ch]; if(v) o += v; }
  return o.replace(/TS/g, "S").replace(/(.)\1+/g, "$1");
}
const AR = { "ب":"B","پ":"B","ت":"T","د":"T","ط":"T","ض":"T","ث":"T","ذ":"T","ظ":"T",
  "ك":"K","ک":"K","ق":"K","غ":"K","ج":"K","گ":"K","خ":"K","چ":"K",
  "س":"S","ص":"S","ز":"S","ش":"S","ژ":"S","ف":"F","ڤ":"F","ر":"R","ڕ":"R","ل":"L","ڵ":"L","م":"M","ن":"N" };
function arSk(s){
  let o = ""; for(const ch of s){ const v = AR[ch]; if(v) o += v; }
  return o.replace(/TS/g, "S").replace(/(.)\1+/g, "$1");
}

let IDX = null;
const idx = () => IDX || (IDX = DATA.c.map(c => [latSk(c[1]), c]));
const R = Math.PI / 180;
const dist = (a, b, c, d) => {
  const h = Math.sin((c - a) * R / 2) ** 2 + Math.cos(a * R) * Math.cos(c * R) * Math.sin((d - b) * R / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

// «هل تقصد…؟» لاسم لاتيني مكتوب بخطأ (Dohuk ← Duhok): أقرب الأسماء كتابةً، ثم الأقرب صوتًا والأكبر سكانًا
const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
let NIDX = null;
const nidx = () => NIDX || (NIDX = DATA.c.map(c => [norm(c[1]), latSk(c[1]), c]));
function lev(a, b, max){
  if(Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length:b.length + 1 }, (_, j) => j);
  for(let i = 1; i <= a.length; i++){
    const cur = [i]; let best = i;
    for(let j = 1; j <= b.length; j++){
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if(cur[j] < best) best = cur[j];
    }
    if(best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
async function nameIn(gid, lg){
  if(!gid) return null;
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 2000);
  try{ const r = await fetch(`https://geocoding-api.open-meteo.com/v1/get?id=${gid}&language=${lg}`, { signal:ctl.signal }); const j = r.ok ? await r.json() : null; return j && j.name ? j.name : null; }
  catch(e){ return null; } finally { clearTimeout(tm); }
}
async function suggest(req, res, u){
  const q = norm(String(u.searchParams.get("q") || "").slice(0, 60));
  const lg = String(u.searchParams.get("lang") || "en").slice(0, 3);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if(q.length < 3) return res.end("[]");
  const q2 = q.replace(/x/g, "kh"), max = q.length <= 4 ? 1 : 2, sk = latSk(q), tzi = DATA.tz.indexOf(String(u.searchParams.get("tz") || ""));
  const hits = [];
  for(const [n, s, c] of nidx()){
    if(n === q) continue;
    // في الكردية اللاتينية x = kh (Zaxo ← Zakho)
    const d = Math.min(lev(q, n, max), q2 !== q ? lev(q2, n, max) : max + 1);
    if(d <= max) hits.push({ c, d: d - (s === sk ? .6 : 0) });
  }
  hits.sort((a, b) => (a.d - b.d) || (b.c[6] * (tzi >= 0 && b.c[5] === tzi ? 50 : 1) - a.c[6] * (tzi >= 0 && a.c[5] === tzi ? 50 : 1)));
  const top = hits.slice(0, 3);
  const local = lg === "en" ? [] : await Promise.all(top.map(h => nameIn(h.c[7], lg === "ku" ? "ar" : lg)));
  res.setHeader("Cache-Control", "public, s-maxage=2592000");
  res.end(JSON.stringify(top.map((h, i) => ({ slug:h.c[0], name:h.c[1], local:local[i] && local[i] !== h.c[1] ? local[i] : "", cc:h.c[2], lat:h.c[3], lng:h.c[4] }))));
}

module.exports = (req, res) => {
  const u = new URL(req.url, SITE);
  if(u.searchParams.get("fz")) return suggest(req, res, u);
  const q = String(u.searchParams.get("q") || "").slice(0, 60);
  const lat = parseFloat(u.searchParams.get("lat")), lng = parseFloat(u.searchParams.get("lng"));
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const k = arSk(q);
  if(k.length < 2){ return res.end("[]"); }
  const near = isFinite(lat) && isFinite(lng);
  // إن لم نعرف موقع الزائر، نفضّل المدن التي في منطقته الزمنية (من متصفحه)
  const tzi = DATA.tz.indexOf(String(u.searchParams.get("tz") || ""));
  const hits = [];
  for(const [s, c] of idx()){
    const exact = s === k;
    if(exact || (k.length >= 3 && s.startsWith(k))) hits.push({ c, exact });
  }
  // الأقرب إلى الزائر أولًا (أو الأكبر سكانًا إن لم نعرف موقعه)، مع أفضلية للتطابق الكامل
  const score = h => near ? dist(lat, lng, h.c[3], h.c[4]) / (h.exact ? 3 : 1) : -h.c[6] * (h.exact ? 3 : 1) * (tzi >= 0 && h.c[5] === tzi ? 50 : 1);
  hits.sort((a, b) => score(a) - score(b));
  res.setHeader("Cache-Control", near ? "public, s-maxage=86400" : "public, s-maxage=2592000");
  res.end(JSON.stringify(hits.slice(0, 6).map(h => ({
    slug:h.c[0], name:h.c[1], cc:h.c[2], lat:h.c[3], lng:h.c[4], exact:h.exact
  }))));
};
