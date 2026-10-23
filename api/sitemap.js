// خريطة صفحات المدن لمحركات البحث: /sitemap-cities.xml و /sitemap-cities-1.xml ...
const { LANGS, SITE, CITIES } = require("./_core.js");
const PER = 40000;
const BIG = CITIES.filter(c => c[6] >= 50000).map(c => c[0]);   // المدن التي يزيد سكانها على 50 ألفًا
const URLS = [];
const CCS = [...new Set(CITIES.map(c => c[2]))].concat("KRD");   // ومعها صفحة إقليم كردستان
for(const l of LANGS){ URLS.push(`${SITE}/${l}/countries`, `${SITE}/${l}/about`, `${SITE}/${l}/privacy`, `${SITE}/${l}/contact`); for(const cc of CCS) URLS.push(`${SITE}/${l}/country/${cc.toLowerCase()}`); }
for(const slug of BIG) for(const l of LANGS) URLS.push(`${SITE}/${l}/${slug}`);
const PARTS = Math.ceil(URLS.length / PER);

module.exports = (req, res) => {
  const part = parseInt(new URL(req.url, SITE).searchParams.get("part") || "0", 10);
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  if(!part){
    const items = Array.from({ length:PARTS }, (_, i) => `<sitemap><loc>${SITE}/sitemap-cities-${i + 1}.xml</loc></sitemap>`).join("");
    return res.end(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`);
  }
  const slice = URLS.slice((part - 1) * PER, part * PER);
  if(!slice.length){ res.statusCode = 404; return res.end(""); }
  res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${slice.map(u => `<url><loc>${u}</loc><changefreq>monthly</changefreq></url>`).join("")}</urlset>`);
};
