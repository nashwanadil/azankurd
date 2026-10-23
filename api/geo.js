// هل الزائر في إقليم كوردستان؟ يستعمله الموقع ليُفتح بالكوردية هناك
// المعلومة من Vercel نفسه (من عنوان الاتصال تقريبيًا)، ولا يُحفظ منها شيء
// محافظات الإقليم: أربيل AR، دهوك DA، السليمانية SU (وحلبجة تُحسب معها)، والإقليم كله KR
const KRD = ["AR", "DA", "SU", "KR"];
module.exports = (req, res) => {
  const cc = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  const r = String(req.headers["x-vercel-ip-country-region"] || "").toUpperCase();
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.end(JSON.stringify({ krd: cc === "IQ" && KRD.includes(r) }));
};
