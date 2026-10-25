// أقرب مدينة لإحداثيات معينة (يستخدمها الرابط "الجدول الشهري" في الصفحة الرئيسية)
// ومع lang: اسم المدينة والبلد بلغة الزائر، لتظهر «دهوك» بدل Duhok
const { nearest, LANGS, SITE } = require("./_core.js");
const { localName, countryName } = require("./_layout.js");
module.exports = async (req, res) => {
  const u = new URL(req.url, SITE), lat = parseFloat(u.searchParams.get("lat")), lng = parseFloat(u.searchParams.get("lng"));
  const lang = u.searchParams.get("lang");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if(!isFinite(lat) || !isFinite(lng)){ res.statusCode = 400; return res.end("{}"); }
  const c = nearest(lat, lng);
  if(!c) return res.end("{}");
  const out = { slug:c.slug, name:c.name, cc:c.cc };
  if(LANGS.includes(lang)){
    const k = Math.cos(lat * Math.PI / 180);
    out.km = Math.round(Math.hypot((c.lng - lng) * k, c.lat - lat) * 111);
    const ln = lang === "en" ? null : await localName(c, lang).catch(() => null);
    out.local = ln && ln.name ? ln.name : c.name;
    out.country = countryName(c.cc, lang);
  }
  res.setHeader("Cache-Control", "public, s-maxage=2592000");
  res.end(JSON.stringify(out));
};
