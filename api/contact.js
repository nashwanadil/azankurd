// نموذج «اتصل بنا»: POST /api/contact ← يرسل الرسالة إلى بريد صاحب الموقع عبر Resend
// المفاتيح في Vercel: RESEND_API_KEY، وCONTACT_TO (البريد الذي تصل إليه الرسائل)، وRESEND_FROM (اختياري)
// البريد لا يُكتب في الكود، لأن المستودع عام
const { redis, ready } = require("./_redis.js");

const str = (v, n) => typeof v === "string" ? v.trim().slice(0, n) : "";
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function out(res, code, obj){
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}
async function body(req){
  if(req.body && typeof req.body === "object") return req.body;
  if(typeof req.body === "string") return JSON.parse(req.body);
  let raw = "";
  for await (const ch of req){ raw += ch; if(raw.length > 20000) throw new Error("too big"); }
  return JSON.parse(raw || "{}");
}

module.exports = async (req, res) => {
  if(req.method !== "POST") return out(res, 405, { ok:false });
  const KEY = process.env.RESEND_API_KEY, TO = process.env.CONTACT_TO;
  if(!KEY || !TO) return out(res, 503, { ok:false, error:"config" });
  let b; try{ b = await body(req); }catch(e){ return out(res, 400, { ok:false }); }

  // حماية بسيطة من الرسائل الآلية: حقل خفي، وزمن كتابة أدنى
  if(b.website || Number(b.ms) < 3000) return out(res, 200, { ok:true });
  const name = str(b.name, 80), email = str(b.email, 120), msg = str(b.message, 4000), lang = str(b.lang, 5);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || msg.length < 2) return out(res, 400, { ok:false });

  // خمس رسائل في الساعة لكل عنوان على الأكثر
  if(ready()){
    try{
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
      const k = "c:" + ip, n = await redis(["INCR", k]);
      if(n === 1) await redis(["EXPIRE", k, "3600"]);
      if(n > 5) return out(res, 429, { ok:false });
    }catch(e){}
  }

  const r = await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{ Authorization:`Bearer ${KEY}`, "Content-Type":"application/json" },
    body:JSON.stringify({
      from:process.env.RESEND_FROM || "AzanKurd <onboarding@resend.dev>",
      to:[TO], reply_to:email,
      subject:`أذان كورد · رسالة من ${name || email}`,
      html:`<div dir="auto" style="font-family:sans-serif;line-height:1.8"><p><b>${esc(name || "—")}</b> &lt;${esc(email)}&gt; · ${esc(lang)}</p><p style="white-space:pre-wrap">${esc(msg)}</p></div>`,
      text:`${name} <${email}> (${lang})\n\n${msg}`
    })
  });
  if(!r.ok) return out(res, 502, { ok:false });
  out(res, 200, { ok:true });
};
