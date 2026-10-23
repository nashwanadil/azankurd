// أقرب مدينة لإحداثيات معينة (يستخدمها الرابط "الجدول الشهري" في الصفحة الرئيسية)
const { nearest, SITE } = require("./_core.js");
module.exports = (req, res) => {
  const u = new URL(req.url, SITE), lat = parseFloat(u.searchParams.get("lat")), lng = parseFloat(u.searchParams.get("lng"));
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if(!isFinite(lat) || !isFinite(lng)){ res.statusCode = 400; return res.end("{}"); }
  const c = nearest(lat, lng);
  res.setHeader("Cache-Control", "public, s-maxage=2592000");
  res.end(JSON.stringify(c ? { slug:c.slug, name:c.name } : {}));
};
