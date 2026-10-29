// أقرب مدينة لإحداثيات معينة (يستخدمها الرابط "الجدول الشهري" في الصفحة الرئيسية)
// ومع lang: اسم المدينة والبلد بلغة الزائر، لتظهر «دهوك» بدل Duhok
const { nearest, nearby, qibla, LANGS, SITE } = require("./_core.js");
const { T, localName, countryName } = require("./_layout.js");
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
    // info=1: «عن المواقيت» و«مدن قريبة» و«أسئلة شائعة» للصفحة الرئيسية (تُملأ هناك بمواقيت اليوم)
    if(u.searchParams.get("info") === "1"){
      const t = T[lang], near = nearby(c);
      const names = await Promise.all(near.map(n => localName(n, lang).catch(() => null)));
      out.info = {
        tz:c.tz, qibla:qibla(c),
        coords:`${Math.abs(c.lat).toFixed(2)}°${c.lat >= 0 ? "N" : "S"}, ${Math.abs(c.lng).toFixed(2)}°${c.lng >= 0 ? "E" : "W"}`,
        nearby:near.map((n, i) => ({ slug:n.slug, name:(names[i] && names[i].name) || n.name })),
        labels:{ aboutCity:t.aboutCity, coords:t.coords, tzLbl:t.tzLbl, methodLabel:t.methodLabel, qibla:t.qibla, qiblaVal:t.qiblaVal, nearby:t.nearby, faq:t.faq },
        faq:[[t.q1, t.a1], [t.q2, t.a2], [t.q3, t.a3]]
      };
    }
  }
  res.setHeader("Cache-Control", "public, s-maxage=2592000");
  res.end(JSON.stringify(out));
};
