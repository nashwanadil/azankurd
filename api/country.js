// صفحة البلد: /ar/country/iq      وصفحة كل البلدان: /ar/countries
const { LANGS, SITE, CITIES, cityAt, autoMethod, dayTimes, todayIn, KEYS } = require("./_core.js");
const { T, esc, fill, countryFlag, localName, countryName, page, send } = require("./_layout.js");

const NAMEKEY = { fajr:"Fajr", sunrise:"Sunrise", dhuhr:"Dhuhr", asr:"Asr", maghrib:"Maghrib", isha:"Isha" };
const IC = {
 fajr:'<svg viewBox="0 0 24 24"><path d="M14 4a6.5 6.5 0 1 0 6 9 5 5 0 0 1-6-9z"/><path d="M19 3v3M17.5 4.5h3"/></svg>',
 sunrise:'<svg viewBox="0 0 24 24"><path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 4v4M9.5 6.5L12 4l2.5 2.5M4.6 11.6l1.4 1.4M19.4 11.6L18 13"/></svg>',
 dhuhr:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
 asr:'<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="3.5"/><path d="M3 20h18M12 5v2M5.6 7.6L7 9M18.4 7.6L17 9M3 13h2M19 13h2"/></svg>',
 maghrib:'<svg viewBox="0 0 24 24"><path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 9V5M9.5 6.5L12 9l2.5-2.5M4.6 11.6l1.4 1.4M19.4 11.6L18 13"/></svg>',
 isha:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
};
const SEARCH_IC = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';

// عدد المدن في كل بلد
const COUNT = {};
CITIES.forEach(c => COUNT[c[2]] = (COUNT[c[2]] || 0) + 1);

const CSS_COUNTRY = `
.chead{display:flex;align-items:center;gap:16px;margin-bottom:6px}
.chead img{width:56px;height:42px;border-radius:6px;box-shadow:0 0 0 1px var(--line)}
.big{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin:14px 0 16px}
.tt{background:var(--inner);border:1px solid var(--line);border-radius:14px;padding:12px 4px;text-align:center}
.tt svg{width:22px;height:22px;stroke:var(--gold);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.tt span{display:block;font-size:.75rem;color:var(--muted)}
.tt b{font-size:1.1rem;font-variant-numeric:tabular-nums;direction:ltr;display:inline-block}
.sub2{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.sub2 h2{font-size:1.05rem;color:var(--gold);font-weight:600}
.count{color:var(--muted);font-size:.85rem}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.grid a{background:var(--inner);border:1px solid var(--line);border-radius:12px;padding:9px 12px;font-size:.92rem;display:flex;justify-content:space-between;align-items:center;gap:8px;transition:border-color .15s}
.grid a:hover{border-color:var(--gold)}
.grid a.top{font-weight:600}
.grid a small{color:var(--muted);font-size:.72rem;font-weight:400;white-space:nowrap}
@media (max-width:760px){ .big{grid-template-columns:repeat(3,1fr)} .grid{grid-template-columns:repeat(2,1fr)} }`;

const CSS_ALL = `
.cgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.cgrid a{display:flex;align-items:center;gap:12px;background:var(--inner);border:1px solid var(--line);border-radius:14px;padding:10px 14px;transition:border-color .15s}
.cgrid a:hover{border-color:var(--gold)}
.cgrid img{width:32px;height:24px;border-radius:4px;box-shadow:0 0 0 1px var(--line);flex:none}
.cgrid b{font-weight:600;font-size:.95rem;line-height:1.3}
.cgrid small{display:block;color:var(--muted);font-size:.75rem}
@media (max-width:760px){ .cgrid{grid-template-columns:repeat(2,1fr)} }
@media (max-width:420px){ .cgrid{grid-template-columns:1fr} }`;

async function countryPage(res, lang, cc){
  const t = T[lang];
  const list = [];
  CITIES.forEach((c, i) => { if(c[2] === cc) list.push(cityAt(i)); });
  if(!list.length){ res.statusCode = 404; return send(res, page({ lang, title:t.notFound, desc:"", path:`/country/${cc.toLowerCase()}`, body:`<div class="hcard" style="text-align:center"><p>${esc(t.notFound)}</p><p><a href="/${lang}/countries" style="color:var(--gold)">${esc(t.allCountries)}</a></p></div>` }), 404); }
  list.sort((a, b) => b.pop - a.pop);
  const country = countryName(cc, lang);
  // أسماء أكبر المدن بلغة الصفحة
  const TOPN = 30;
  const local = await Promise.all(list.slice(0, TOPN).map(c => localName(c, lang).then(r => r?.name || null)));
  const nm = (c, i) => (i < TOPN && local[i]) || c.name;
  const big = list[0], bigName = nm(big, 0);
  const td = todayIn(big.tz), times = dayTimes(big, td.y, td.m, td.d, autoMethod(big.tz));
  const path = `/country/${cc.toLowerCase()}`;
  const V = { country, city:country };
  const title = `${fill(t.title, V)} | ${t.logo}`;
  const desc = fill(t.countryDesc, V);
  const ld = { "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[
    { "@type":"ListItem", position:1, name:t.home, item:`${SITE}/?lang=${lang}` },
    { "@type":"ListItem", position:2, name:t.allCountries, item:`${SITE}/${lang}/countries` },
    { "@type":"ListItem", position:3, name:country, item:`${SITE}/${lang}${path}` } ] };
  const cards = KEYS.map(k => `<div class="tt">${IC[k]}<span>${esc(t.names[NAMEKEY[k]])}</span><b>${times[k]}</b></div>`).join("");
  const links = list.map((c, i) => `<a href="/${lang}/${c.slug}" class="${i < 12 ? "top" : ""}" data-n="${esc(nm(c, i) + " " + c.name + " " + c.slug)}"><span>${esc(nm(c, i))}</span></a>`).join("");
  const body = `
  <nav class="crumbs"><a href="/?lang=${lang}">${esc(t.home)}</a><span>›</span><a href="/${lang}/countries">${esc(t.allCountries)}</a><span>›</span><b>${esc(country)}</b></nav>
  <section class="hcard">
    <div class="chead"><img src="${countryFlag(cc)}" alt=""><h1>${esc(fill(t.title, { city:"\u0000" })).replace("\u0000", `<em>${esc(country)}</em>`)}</h1></div>
    <p class="lead">${esc(desc)}</p>
    <div class="sub2" style="margin-top:14px"><h2>${esc(fill(t.todayIn, { city:bigName }))}</h2><a class="btn" href="/${lang}/${big.slug}">${esc(t.monthlyBtn)}</a></div>
    <div class="big">${cards}</div>
  </section>
  <section class="hcard">
    <div class="sub2" style="margin-bottom:12px"><h2>${esc(fill(t.citiesIn, V))}</h2><span class="count">${esc(fill(t.nCities, { n:list.length.toLocaleString("en") }))}</span></div>
    <label class="search">${SEARCH_IC}<input id="q" type="search" placeholder="${esc(t.filterPh)}" autocomplete="off"></label>
    <div class="grid">${links}</div>
    <p class="empty" id="empty">${esc(t.noMatch)}</p>
  </section>`;
  send(res, page({ lang, title, desc, path, ld, body, css:CSS_COUNTRY }));
}

function allPage(res, lang){
  const t = T[lang];
  const coll = new Intl.Collator(lang === "ku" ? "ckb" : lang);
  const list = Object.keys(COUNT).map(cc => ({ cc, name:countryName(cc, lang), en:countryName(cc, "en"), n:COUNT[cc] }))
    .sort((a, b) => coll.compare(a.name, b.name));
  const title = `${t.allTitle} | ${t.logo}`;
  const body = `
  <nav class="crumbs"><a href="/?lang=${lang}">${esc(t.home)}</a><span>›</span><b>${esc(t.allCountries)}</b></nav>
  <section class="hcard">
    <h1>${esc(t.allTitle)}</h1>
    <p class="lead" style="margin-bottom:16px">${esc(t.allDesc)}</p>
    <label class="search">${SEARCH_IC}<input id="q" type="search" placeholder="${esc(t.findCountry)}" autocomplete="off"></label>
    <div class="cgrid">${list.map(c => `<a href="/${lang}/country/${c.cc.toLowerCase()}" data-n="${esc(c.name + " " + c.en + " " + c.cc)}"><img src="${countryFlag(c.cc)}" alt="" loading="lazy"><span><b>${esc(c.name)}</b><small>${esc(fill(t.nCities, { n:c.n.toLocaleString("en") }))}</small></span></a>`).join("")}</div>
    <p class="empty" id="empty">${esc(t.noMatch)}</p>
  </section>`;
  send(res, page({ lang, title, desc:t.allDesc, path:"/countries", body, css:CSS_ALL }));
}

module.exports = async (req, res) => {
  const u = new URL(req.url, SITE);
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const cc = String(u.searchParams.get("cc") || "").toUpperCase();
  if(cc) return countryPage(res, lang, cc);
  return allPage(res, lang);
};
