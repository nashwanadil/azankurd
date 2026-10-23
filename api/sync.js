// مزامنة الإعدادات برمز خاص، دون حساب ولا بريد
// POST /api/sync        { data }          ← يُنشئ رمزًا جديدًا ويحفظ الإعدادات تحته، ويُعيده
// POST /api/sync        { code, data }    ← يحدّث الإعدادات تحت رمز موجود
// GET  /api/sync?code=  ← يعيد الإعدادات تحت الرمز
// لا يُحفظ إلا الإعدادات المسموحة، ولا يُحفظ أي بريد أو اسم أو موقع دقيق
const crypto = require("crypto");
const { redis, ready } = require("./_redis.js");

const ALLOWED = ["lang","theme","mode","fmt","asr","method","lastQuery","myPlace","notifyPrefs","recent"];
const CODE = /^[A-Za-z0-9]{12}$/;
const YEAR2 = 60 * 60 * 24 * 365 * 2;

function out(res, code, obj){
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}
async function body(req){
  if(req.body && typeof req.body === "object") return req.body;
  if(typeof req.body === "string") return JSON.parse(req.body);
  let raw = ""; for await (const ch of req){ raw += ch; if(raw.length > 20000) throw new Error("big"); }
  return JSON.parse(raw || "{}");
}
// رمز من 12 حرفًا وأرقامًا، بلا أحرف ملتبسة
const ALPH = "abcdefghjkmnpqrstuvwxyz23456789";
function newCode(){
  const b = crypto.randomBytes(12); let s = "";
  for(const x of b) s += ALPH[x % ALPH.length];
  return s;
}
function clean(d){
  const o = {};
  if(d && typeof d === "object") for(const k of ALLOWED) if(d[k] !== undefined) o[k] = d[k];
  return o;
}

module.exports = async (req, res) => {
  if(!ready()) return out(res, 503, { ok:false, error:"config" });
  try{
    if(req.method === "GET"){
      const u = new URL(req.url, "https://azankurd.com");
      const code = String(u.searchParams.get("code") || "");
      if(!CODE.test(code)) return out(res, 400, { ok:false });
      const raw = await redis(["GET", "sync:" + code]);
      if(!raw) return out(res, 404, { ok:false });
      await redis(["EXPIRE", "sync:" + code, String(YEAR2)]);
      return out(res, 200, { ok:true, data:JSON.parse(raw) });
    }
    if(req.method !== "POST") return out(res, 405, { ok:false });
    const b = await body(req);
    const data = clean(b.data);
    if(JSON.stringify(data).length > 8000) return out(res, 413, { ok:false });
    let code = String(b.code || "");
    if(code){
      if(!CODE.test(code)) return out(res, 400, { ok:false });
      if(!(await redis(["EXISTS", "sync:" + code]))) return out(res, 404, { ok:false });
    } else {
      // رمز جديد: نتأكد من أنه غير مستعمل
      do { code = newCode(); } while(await redis(["EXISTS", "sync:" + code]));
    }
    await redis(["SET", "sync:" + code, JSON.stringify(data), "EX", String(YEAR2)]);
    return out(res, 200, { ok:true, code });
  }catch(e){
    return out(res, 500, { ok:false });
  }
};
