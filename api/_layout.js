// الإطار المشترك لصفحات البلدان: الرأس، الألوان، قائمة اللغات، التذييل
const T = require("./_i18n.js");
const THEME_JS = require("./_theme.js");
const FLAGS = require("./_flags.js");
const INFO = require("./_info.js");
const NAV = require("./_nav.js");
const { LANGS, SITE } = require("./_core.js");

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const flagSrc = l => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(FLAGS[l] || "");
// إقليم كردستان: صفحة خاصة بالعلم الكردي (رمزها KRD) تضم مدن الإقليم، إلى جانب صفحة العراق
const REGIONS = {
  KRD: {
    slugs:["erbil","sulaymaniyah","duhok","sinah","soran","zakho","chamchamal","halabja","koya","amedi","ranya","kalar","shaqlawa","simele","baynjiwayn","batifa","akre"],
    names:{ ar:"إقليم كردستان", ku:"هەرێما کوردستانێ", en:"Kurdistan Region", de:"Region Kurdistan", tr:"Kürdistan Bölgesi",
      fa:"اقلیم کردستان", ur:"اقلیمِ کردستان", fr:"Région du Kurdistan", es:"Región del Kurdistán", it:"Regione del Kurdistan",
      nl:"Koerdistan-regio", da:"Kurdistan-regionen", sv:"Kurdistanregionen", ru:"Регион Курдистан", bs:"Regija Kurdistan",
      id:"Wilayah Kurdistan", ms:"Wilayah Kurdistan", bn:"কুর্দিস্তান অঞ্চল", ps:"د کردستان سیمه", ha:"Yankin Kurdistan", sw:"Eneo la Kurdistan" }
  }
};
// لا يُعرض علم إسرائيل (يبقى الاسم والروابط كما هي)
const NO_FLAG = ["IL"];
const countryFlag = cc => NO_FLAG.includes(cc) ? "" : REGIONS[cc] ? flagSrc("ku") : `https://cdn.jsdelivr.net/npm/flag-icons@7.6.0/flags/4x3/${cc.toLowerCase()}.svg`;

// اسم المدينة والبلد بلغة الصفحة برقم GeoNames الثابت
async function getJSON(u){
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 2500);
  try{ const r = await fetch(u, { signal:ctl.signal }); return r.ok ? await r.json() : null; }
  catch(e){ return null; } finally { clearTimeout(tm); }
}
const hasAr = s => /[\u0600-\u06FF]/.test(s || "");
async function nameIn(city, lg){
  if(!city.gid) return null;
  const j = await getJSON(`https://geocoding-api.open-meteo.com/v1/get?id=${city.gid}&language=${lg}`);
  return j && j.name ? { name:j.name, country:j.country || "" } : null;
}
// أسماء ثابتة لمدن لا تعطيها قاعدة الأسماء بالحروف العربية (أو ليس لها رقم فيها)
const AR_SCRIPT = ["ar","ku","fa","ur","ps"];
const FIXED_NAMES = {
  zakho:{ ar:"زاخو", ku:"زاخۆ" }, amedi:{ ar:"العمادية", ku:"ئامێدی" }, ranya:{ ar:"رانية", ku:"ڕانیە" },
  kalar:{ ar:"كلار", ku:"کەلار" }, shaqlawa:{ ar:"شقلاوة", ku:"شەقڵاوە" }, simele:{ ar:"سميل", ku:"سێمێل" }
};
function fixedName(city, lang){
  const f = FIXED_NAMES[city.slug]; if(!f) return null;
  const n = f[lang] || (AR_SCRIPT.includes(lang) ? f.ar : null);
  return n ? { name:n, country:"" } : null;
}
async function localName(city, lang){
  const f = fixedName(city, lang); if(f) return f;
  if(lang === "ku"){
    for(const lg of ["ku","ckb","ar"]){ const r = await nameIn(city, lg); if(r && hasAr(r.name)) return r; }
    return null;
  }
  const r = await nameIn(city, lang);
  // الفارسية والأردية والبشتو: الاسم العربي أقرب من اللاتيني
  if(lang !== "ar" && AR_SCRIPT.includes(lang) && !(r && hasAr(r.name))){ const a = await nameIn(city, "ar"); if(a && hasAr(a.name)) return a; }
  return r;
}
// فلسطين باسمها في كل اللغات (بدل «الأراضي الفلسطينية» الذي تعطيه المتصفحات وقواعد الأسماء)
const PS_NAMES = { ar:"فلسطين", ku:"فەلەستین", en:"Palestine", de:"Palästina", tr:"Filistin", fa:"فلسطین", ur:"فلسطین",
  fr:"Palestine", es:"Palestina", it:"Palestina", nl:"Palestina", da:"Palæstina", sv:"Palestina", ru:"Палестина",
  bs:"Palestina", id:"Palestina", ms:"Palestin", bn:"ফিলিস্তিন", ps:"فلسطین", ha:"Falasdinu", sw:"Palestina" };

// عدد المدن بصيغة الجمع الصحيحة لكل لغة (مدينة واحدة، مدينتان، 3 مدن، 11 مدينة…)
const CITY_FORMS = {
  ar:{ one:"مدينة واحدة", two:"مدينتان", few:"{n} مدن", many:"{n} مدينة", other:"{n} مدينة", zero:"{n} مدينة" },
  en:{ one:"{n} city", other:"{n} cities" }, de:{ one:"{n} Stadt", other:"{n} Städte" },
  fr:{ one:"{n} ville", other:"{n} villes" }, es:{ one:"{n} ciudad", other:"{n} ciudades" },
  it:{ one:"{n} città", other:"{n} città" }, nl:{ one:"{n} stad", other:"{n} steden" },
  da:{ one:"{n} by", other:"{n} byer" }, sv:{ one:"{n} stad", other:"{n} städer" },
  ru:{ one:"{n} город", few:"{n} города", many:"{n} городов", other:"{n} города" },
  bs:{ one:"{n} grad", few:"{n} grada", other:"{n} gradova" },
  ps:{ one:"{n} ښار", other:"{n} ښارونه" }, ha:{ one:"gari {n}", other:"garuruwa {n}" }, sw:{ one:"mji {n}", other:"miji {n}" }
};
function nCitiesText(lang, n){
  const f = CITY_FORMS[lang], num = n.toLocaleString("en");
  if(!f) return fill(T[lang].nCities, { n:num });
  let c = "other"; try{ c = new Intl.PluralRules(lang).select(n); }catch(e){}
  return (f[c] || f.other).replace("{n}", num);
}

function countryName(cc, lang){
  if(REGIONS[cc]) return REGIONS[cc].names[lang] || REGIONS[cc].names.en;
  if(cc === "PS" && PS_NAMES[lang]) return PS_NAMES[lang];
  for(const l of [lang === "ku" ? "ckb" : lang, lang === "ku" ? "ar" : "en"]){
    try{ const n = new Intl.DisplayNames([l], { type:"region" }).of(cc); if(n && n !== cc) return n; }catch(e){}
  }
  return cc;
}

function page({ lang, title, desc, path, ld, body, css = "", js = "" }){
  const t = T[lang];
  const alts = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${SITE}/${l}${path}">`).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${SITE}/en${path}">`;
  const langMenu = LANGS.map(l => `<a href="/${l}${path}" hreflang="${l}" ${l === lang ? 'aria-current="true"' : ""}><img class="flag" alt="" src="${flagSrc(l)}"><span dir="${T[l].dir}">${esc(T[l].label)}</span><svg class="chk" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></a>`).join("");
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${t.dir}" translate="no">
<head>
<meta charset="UTF-8">
<meta name="google" content="notranslate">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/${lang}${path}">
${alts}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}/${lang}${path}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#2a1d17">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Noto+Kufi+Arabic:wght@400;600;700&family=Noto+Sans:wght@400;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Noto+Kufi+Arabic:wght@400;600;700&family=Noto+Sans:wght@400;600;700&display=swap"></noscript>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>` : ""}
<script>${THEME_JS}</script>
<style>
:root{--bg:#f5efea;--card:#fdfbf9;--line:#e3d8cf;--inner:#f0e9e3;--hover:#e9dfd7;--text:#2a1c17;--muted:#6b5a50;--gold:#946512;--green:#8f2a39;--glow:#efe0d5;--title:#2a1c17}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);background-image:radial-gradient(circle at 50% 0%,var(--glow) 0%,transparent 55%);color:var(--text);font-family:'Noto Kufi Arabic','Noto Sans',sans-serif;line-height:1.7;min-height:100vh}
html[dir=ltr] body{font-family:'Noto Sans','Noto Kufi Arabic',sans-serif}
a{color:inherit;text-decoration:none}
.wrap{max-width:980px;margin:0 auto;padding:0 16px}
svg.ic{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
.top{display:flex;justify-content:space-between;align-items:center;padding:16px 0}
.brandmini{display:flex;align-items:center;gap:10px;font-family:'Amiri',serif;font-size:1.6rem;font-weight:700;color:var(--title);word-spacing:-.32em}
html[dir=ltr] .brandmini{font-family:'Noto Sans',sans-serif;font-size:1.25rem}
.brandmini img{width:38px;height:38px;border-radius:10px}
.flag{width:22px;height:16px;border-radius:3px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(0,0,0,.18)}
.langs{position:relative}
.langs summary{list-style:none;display:inline-flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:.88rem;cursor:pointer}
.langs summary::-webkit-details-marker{display:none}
.langs[open] summary{border-color:var(--gold)}
.langs .chev{width:14px;height:14px;opacity:.7;transition:transform .2s}
.langs[open] .chev{transform:rotate(180deg)}
.langs .menu{position:absolute;inset-inline-end:0;top:calc(100% + 8px);z-index:20;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px;width:220px;max-height:60vh;overflow:auto;box-shadow:0 14px 40px rgba(0,0,0,.2)}
.langs .menu a{display:flex;align-items:center;gap:10px;padding:7px 12px;border-radius:9px;font-size:.92rem}
.langs .menu a:hover{background:var(--hover)}
.langs .menu a[aria-current]{color:var(--gold);font-weight:600}
.langs .chk{margin-inline-start:auto;width:16px;height:16px;stroke:var(--gold);fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;visibility:hidden}
.langs .menu a[aria-current] .chk{visibility:visible}
.crumbs{font-size:.82rem;color:var(--muted);display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px}
.crumbs span{opacity:.5}
.crumbs a:hover{color:var(--gold)}
.hcard{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:24px;margin-bottom:22px}
h1{font-size:1.9rem;line-height:1.35;font-weight:700;margin-bottom:6px;color:var(--title)}
h1 em{font-style:normal;color:var(--green)}
html[data-mode=dark] h1 em{color:var(--gold)}
.lead{color:var(--muted);font-size:.95rem;margin-bottom:4px}
.btn{display:inline-flex;align-items:center;gap:8px;border-radius:12px;padding:9px 16px;font-family:inherit;font-size:.9rem;cursor:pointer;border:1px solid var(--green);background:var(--green);color:#fff}
.search{display:flex;align-items:center;gap:10px;background:var(--inner);border:1px solid var(--line);border-radius:14px;padding:4px 14px;margin-bottom:16px}
.search:focus-within{border-color:var(--gold)}
.search input{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--text);font-family:inherit;font-size:1rem;padding:8px 0}
.search svg{width:20px;height:20px;stroke:var(--muted);fill:none;stroke-width:1.8;stroke-linecap:round}
.empty{color:var(--muted);text-align:center;padding:18px;display:none}
footer{text-align:center;color:var(--muted);font-size:.8rem;padding:10px 0 32px}
footer a{color:var(--gold)}
@media (max-width:760px){ h1{font-size:1.5rem} .hcard{padding:18px} }
${NAV.css}
${css}
</style>
<!-- إحصاءات Vercel للزوار (بلا ملفات تعريف ارتباط) -->
<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
<script defer src="/_vercel/insights/script.js"></script>
<script type="speculationrules">${JSON.stringify({ prerender:[{ source:"list", urls:[`/?lang=${lang}&settings=1`], eagerness:"moderate" }] })}</script>
</head>
<body>
<div class="wrap">
  <div class="top">
    <a class="brandmini" href="/?lang=${lang}"><img src="/icon-192.png" alt="" width="38" height="38">${esc(t.logo)}</a>
    <div class="tr"><details class="langs"><summary aria-label="${esc(t.label)}"><img class="flag" alt="" src="${flagSrc(lang)}"><span class="lname">${esc(t.label)}</span><svg class="ic chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></summary><div class="menu">${langMenu}</div></details></div>
    ${NAV.bar(lang, (path || "").split("/")[1] || "")}
  </div>
${body}
  <footer>© ${new Date().getUTCFullYear()} <a href="/?lang=${lang}">azankurd.com</a> · <a href="/${lang}/countries">${esc(t.allCountries)}</a> · <a href="/${lang}/about">${esc(INFO[lang].cAbout)}</a> · <a href="/${lang}/privacy">${esc(INFO[lang].cPrivacy)}</a> · <a href="/${lang}/contact">${esc(INFO[lang].cContact)}</a></footer>
</div>
<script>
(function(){
  var dl=document.querySelector(".langs");
  document.addEventListener("click",function(e){ if(dl.open && !dl.contains(e.target)) dl.open=false; });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape" && dl.open){ dl.open=false; dl.querySelector("summary").focus(); } });
  var q=document.getElementById("q");
  if(q){
    var items=[].slice.call(document.querySelectorAll("[data-n]")), empty=document.getElementById("empty");
    var norm=function(s){ return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,""); };
    q.addEventListener("input",function(){
      var v=norm(q.value.trim()), n=0;
      items.forEach(function(el){ var ok=!v || norm(el.getAttribute("data-n")).indexOf(v)>=0; el.style.display=ok?"":"none"; if(ok) n++; });
      if(empty) empty.style.display = n ? "none" : "block";
    });
  }
})();
${NAV.js(lang)}
${js}
</script>
<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "bfceae96a7da49f1a6906ba6c7586176"}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>`;
}

function send(res, html, status = 200){
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=21600, stale-while-revalidate=604800");
  res.end(html);
}

module.exports = { T, esc, fill, flagSrc, countryFlag, localName, fixedName, AR_SCRIPT, countryName, PS_NAMES, REGIONS, nCitiesText, page, send };
