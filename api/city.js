// صفحة مواقيت مدينة: /ar/duhok  /en/duhok?m=2026-12
const QR = require("qrcode");
const T = require("./_i18n.js");
const THEME_JS = require("./_theme.js");
const FLAGS = require("./_flags.js");
const INFO = require("./_info.js");
const NAV = require("./_nav.js");
const flagSrc = l => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(FLAGS[l] || "");
const { LANGS, SITE, findCity, nearby, METHODS, autoMethod, dayTimes, todayIn, qibla, KEYS } = require("./_core.js");

// زخرفة اسم المسجد: شريط مزخرف تحت الاسم، وشمسة إسلامية مكان شعار الموقع
const FLOURISH = '<svg class="fl" viewBox="0 0 240 24" aria-hidden="true"><path d="M4 12H92M148 12h88" stroke-width="1.4"/><path d="M60 12h30M150 12h30" stroke-width="3" opacity=".35"/><path d="M96 12l5-5 5 5-5 5zM134 12l5-5 5 5-5 5z"/><path d="M120 2l3.4 6.6L130 12l-6.6 3.4L120 22l-3.4-6.6L110 12l6.6-3.4z"/><circle cx="120" cy="12" r="2.4" fill="#fff"/><circle cx="2" cy="12" r="1.6"/><circle cx="238" cy="12" r="1.6"/></svg>';
const ROSETTE = '<svg class="ro" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 10h28v28H10z" fill="#8f2a39"/><path d="M24 4l20 20-20 20L4 24z" fill="#8f2a39"/><path d="M10 10h28v28H10zM24 4l20 20-20 20L4 24z" fill="none" stroke="#c9a24e" stroke-width="1.6"/><circle cx="24" cy="24" r="9" fill="none" stroke="#c9a24e" stroke-width="1.4"/><path d="M24 17l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#c9a24e"/></svg>';
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const intlLoc = l => l === "ku" ? "ckb" : l;

// اسم المدينة والبلد بلغة الصفحة: نبحث برقم المدينة الثابت في GeoNames (عبر Open-Meteo)
async function getJSON(u){
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 2500);
  try{ const r = await fetch(u, { signal:ctl.signal }); return r.ok ? await r.json() : null; }
  catch(e){ return null; } finally { clearTimeout(tm); }
}
const OM = "https://geocoding-api.open-meteo.com/v1/";
const hasAr = s => /[؀-ۿ]/.test(s || "");
async function nameIn(city, lg){
  if(city.gid){
    const j = await getJSON(`${OM}get?id=${city.gid}&language=${lg}`);
    return j && j.name ? { name:j.name, country:j.country || "" } : null;
  }
  const j = await getJSON(`${OM}search?name=${encodeURIComponent(city.name)}&count=10&language=${lg}&format=json`);
  const hit = (j?.results || []).filter(x => Math.abs(x.latitude - city.lat) < .3 && Math.abs(x.longitude - city.lng) < .3)[0];
  return hit ? { name:hit.name, country:hit.country || "" } : null;
}
async function localName(city, lang){
  if(lang !== "ku") return nameIn(city, lang);
  // الكوردية: نفضّل الكتابة بالحروف العربية، ثم العربية إن لم تتوفر
  for(const lg of ["ku","ckb","ar"]){
    const r = await nameIn(city, lg);
    if(r && hasAr(r.name)) return r;
  }
  return null;
}
const { PS_NAMES } = require("./_layout.js");
function countryName(cc, lang){
  if(cc === "PS" && PS_NAMES[lang]) return PS_NAMES[lang];
  for(const l of [intlLoc(lang), lang === "ku" ? "ar" : "en"]){
    try{ const n = new Intl.DisplayNames([l], { type:"region" }).of(cc); if(n && n !== cc) return n; }catch(e){}
  }
  return cc;
}

const KU_WD = ["ئێکشەمب","دووشەمب","سێشەمب","چارشەمب","پێنجشەمب","ئەینی","شەمبی"];
function weekday(y, m, d, lang){
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  if(lang === "ku") return KU_WD[dt.getUTCDay()];
  return new Intl.DateTimeFormat(intlLoc(lang) + "-u-ca-gregory-nu-latn", { weekday:"long", timeZone:"UTC" }).format(dt);
}
function hijri(y, m, d, lang, opts){
  const loc = (["ar","ku","ps"].includes(lang) ? "ar" : intlLoc(lang)) + "-u-ca-islamic-umalqura-nu-latn";
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  try{ return new Intl.DateTimeFormat(loc, { timeZone:"UTC", ...opts }).format(dt); }
  catch(e){ return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { timeZone:"UTC", ...opts }).format(dt); }
}
// أسماء الأشهر الميلادية بالبهدينانية (Intl يعطيها بالسورانية)
const KU_MONTHS = ["کانوونا دووێ","شوبات","ئادار","نیسان","گولان","حزیران","تیرمەھ","تەباخ","ئەیلوول","چریا ئێکێ","چریا دووێ","کانوونا ئێکێ"];
const monthName = (y, m, lang) => lang === "ku" ? `${KU_MONTHS[m - 1]} ${y}` : new Intl.DateTimeFormat(intlLoc(lang) + "-u-ca-gregory-nu-latn", { month:"long", year:"numeric", timeZone:"UTC" }).format(new Date(Date.UTC(y, m - 1, 15)));
const longDate = (y, m, d, lang) => lang === "ku" ? `${d} ${KU_MONTHS[m - 1]} ${y}` : new Intl.DateTimeFormat(intlLoc(lang) + "-u-ca-gregory-nu-latn", { day:"numeric", month:"long", year:"numeric", timeZone:"UTC" }).format(new Date(Date.UTC(y, m - 1, d, 12)));

const IC = {
 fajr:'<svg viewBox="0 0 24 24"><path d="M14 4a6.5 6.5 0 1 0 6 9 5 5 0 0 1-6-9z"/><path d="M19 3v3M17.5 4.5h3"/></svg>',
 sunrise:'<svg viewBox="0 0 24 24"><path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 4v4M9.5 6.5L12 4l2.5 2.5M4.6 11.6l1.4 1.4M19.4 11.6L18 13"/></svg>',
 dhuhr:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
 asr:'<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="3.5"/><path d="M3 20h18M12 5v2M5.6 7.6L7 9M18.4 7.6L17 9M3 13h2M19 13h2"/></svg>',
 maghrib:'<svg viewBox="0 0 24 24"><path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 9V5M9.5 6.5L12 9l2.5-2.5M4.6 11.6l1.4 1.4M19.4 11.6L18 13"/></svg>',
 isha:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
};
const NAMEKEY = { fajr:"Fajr", sunrise:"Sunrise", dhuhr:"Dhuhr", asr:"Asr", maghrib:"Maghrib", isha:"Isha" };
const FLAG_LABEL = l => T[l].label;

function notFound(res, lang){
  const t = T[lang] || T.ar;
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><html lang="${lang}" dir="${t.dir}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(t.notFound)}</title><body style="font-family:sans-serif;text-align:center;padding:60px 16px;background:#f5efea;color:#2a1c17"><h1 style="font-size:1.4rem">${esc(t.notFound)}</h1><p><a href="/?lang=${lang}" style="color:#8f2a39">${esc(t.backHome)}</a></p></body></html>`);
}

module.exports = async (req, res) => {
  const url = new URL(req.url, SITE);
  const lang = LANGS.includes(url.searchParams.get("lang")) ? url.searchParams.get("lang") : "ar";
  const slug = String(url.searchParams.get("slug") || "").toLowerCase();
  const city = findCity(slug);
  if(!city) return notFound(res, lang);
  const t = T[lang];

  // الشهر المطلوب (افتراضيًا الشهر الحالي في منطقة المدينة)
  const today = todayIn(city.tz);
  let y = today.y, m = today.m;
  const mq = /^(\d{4})-(\d{2})$/.exec(url.searchParams.get("m") || "");
  if(mq){
    const yy = +mq[1], mm = +mq[2], diff = (yy - today.y) * 12 + (mm - today.m);
    if(mm >= 1 && mm <= 12 && Math.abs(diff) <= 24){ y = yy; m = mm; }
  }
  const isCurrent = y === today.y && m === today.m;
  const method = autoMethod(city.tz);
  const methodName = METHODS[method];
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const rows = [];
  for(let d = 1; d <= days; d++){
    const dt = new Date(Date.UTC(y, m - 1, d, 12));
    rows.push({ d, fri:dt.getUTCDay() === 5, wd:weekday(y, m, d, lang), hij:hijri(y, m, d, lang, { day:"numeric", month:"long" }), ...dayTimes(city, y, m, d, method) });
  }
  const tt = dayTimes(city, today.y, today.m, today.d, method);
  const tomorrow = new Date(Date.UTC(today.y, today.m - 1, today.d + 1));
  const tmFajr = dayTimes(city, tomorrow.getUTCFullYear(), tomorrow.getUTCMonth() + 1, tomorrow.getUTCDate(), method).fajr;

  const loc = await localName(city, lang);
  const cityName = loc?.name || city.name;
  const country = city.cc === "PS" ? countryName("PS", lang) : (loc?.country || countryName(city.cc, lang));
  const V = { city:cityName, country, method:methodName, ...tt };

  const hFirst = hijri(y, m, 1, lang, { month:"long" }), hLast = hijri(y, m, days, lang, { month:"long", year:"numeric" });
  const hijRange = hFirst === hijri(y, m, days, lang, { month:"long" }) ? hLast : `${hFirst} – ${hLast}`;
  const mTitle = monthName(y, m, lang);
  const pm = new Date(Date.UTC(y, m - 2, 1)), nm = new Date(Date.UTC(y, m, 1));
  const ym = d => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const path = `/${lang}/${city.slug}`;
  const canonical = SITE + path + (isCurrent ? "" : `?m=${y}-${String(m).padStart(2, "0")}`);
  const title = fill(t.title, V) + (isCurrent ? "" : ` – ${mTitle}`) + ` | ${t.logo}`;
  const desc = fill(t.desc, V);
  const asrName = method === 1 ? t.hanafi : t.standard;
  const qrSvg = await QR.toString(SITE + path, { type:"svg", margin:0, color:{ dark:"#2a1c17", light:"#0000" } });
  const near = nearby(city);
  const nearNames = await Promise.all(near.map(c => localName(c, lang).then(r => r?.name || c.name)));
  const sep = t.dir === "rtl" ? "، " : ", ";
  const coordTxt = `${Math.abs(city.lat).toFixed(2)}°${city.lat >= 0 ? "N" : "S"}, ${Math.abs(city.lng).toFixed(2)}°${city.lng >= 0 ? "E" : "W"}`;

  const faq = [[t.q1, t.a1], [t.q2, t.a2], [t.q3, t.a3]].map(([q, a]) => [fill(q, V), fill(a, V)]);
  const ld = [
    { "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement:[
      { "@type":"ListItem", position:1, name:t.home, item:`${SITE}/?lang=${lang}` },
      { "@type":"ListItem", position:2, name:country, item:`${SITE}/${lang}/country/${city.cc.toLowerCase()}` },
      { "@type":"ListItem", position:3, name:cityName, item:SITE + path } ] },
    { "@context":"https://schema.org", "@type":"FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type":"Question", name:q, acceptedAnswer:{ "@type":"Answer", text:a } })) }
  ];

  const th = `<th class="dcol">${esc(t.dayCol)}</th><th class="hijcol">${esc(t.hijriCol)}</th>` + KEYS.map(k => `<th>${IC[k]}${esc(t.names[NAMEKEY[k]])}</th>`).join("");
  // اليوم والشهر الميلاديان معًا (22/10) بصيغة لغة الصفحة، كما في جدول الأسبوع بالصفحة الرئيسية
  const dmFmt = (() => { try{ return new Intl.DateTimeFormat((lang === "ku" ? "ar" : lang) + "-u-ca-gregory-nu-latn", { day:"numeric", month:"numeric", timeZone:"UTC" }); }catch(e){ return null; } })();
  const dm = d => dmFmt ? dmFmt.format(new Date(Date.UTC(y, m - 1, d))) : `${d}/${m}`;
  const trs = rows.map(r => `<tr class="${r.fri ? "fri" : ""}" data-d="${r.d}"><td class="day"><b>${esc(dm(r.d))}</b> <i>${esc(r.wd)}</i><small>${esc(r.hij)}</small></td><td class="hij hijcol">${esc(r.hij)}</td>${KEYS.map(k => `<td data-t="${r[k]}">${r[k]}</td>`).join("")}</tr>`).join("");
  const ptrs = rows.map(r => `<tr class="${r.fri ? "fri" : ""}"><td class="d"><b>${esc(dm(r.d))}</b>${esc(r.wd)}</td><td class="h">${esc(r.hij)}</td>${KEYS.map(k => `<td class="${k === "fajr" || k === "maghrib" ? "em" : ""}" data-t="${r[k]}">${r[k]}</td>`).join("")}</tr>`).join("");
  const pth = `<th>${esc(t.dayCol)}</th><th>${esc(t.hijriCol)}</th>` + KEYS.map(k => `<th>${esc(t.names[NAMEKEY[k]])}</th>`).join("");
  const todayCards = KEYS.map(k => `<div class="tt" id="tt-${k}">${IC[k]}<span>${esc(t.names[NAMEKEY[k]])}</span><b data-t="${tt[k]}">${tt[k]}</b></div>`).join("");
  const langMenu = LANGS.map(l => `<a href="/${l}/${city.slug}${isCurrent ? "" : `?m=${y}-${String(m).padStart(2,"0")}`}" hreflang="${l}" ${l === lang ? 'aria-current="true"' : ""}><img class="flag" alt="" src="${flagSrc(l)}"><span dir="${T[l].dir}">${esc(FLAG_LABEL(l))}</span><svg class="chk" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></a>`).join("");
  const alts = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${SITE}/${l}/${city.slug}">`).join("\n") + `\n<link rel="alternate" hreflang="x-default" href="${SITE}/en/${city.slug}">`;

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${alts}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fill(t.title, V))}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE + path}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#2a1d17">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Aref+Ruqaa:wght@700&family=Reem+Kufi:wght@700&family=Noto+Kufi+Arabic:wght@400;600;700&family=Noto+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<script>${THEME_JS}</script>
<style>
:root{--bg:#f5efea;--card:#fdfbf9;--line:#e3d8cf;--inner:#f0e9e3;--hover:#e9dfd7;--text:#2a1c17;--muted:#6b5a50;--gold:#946512;--green:#8f2a39;--glow:#efe0d5;--title:#2a1c17}
html[data-mode=dark]{--fri:color-mix(in srgb,var(--gold) 14%,var(--card));--today:color-mix(in srgb,var(--green) 30%,var(--card))}
html:not([data-mode=dark]){--fri:color-mix(in srgb,var(--gold) 10%,var(--card));--today:color-mix(in srgb,var(--green) 9%,var(--card))}
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
${NAV.css}
.langs{position:relative}
.langs summary{list-style:none;display:inline-flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:.88rem;cursor:pointer}
.langs summary::-webkit-details-marker{display:none}
.langs .menu{position:absolute;inset-inline-end:0;top:calc(100% + 8px);z-index:20;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px;width:210px;max-height:60vh;overflow:auto;box-shadow:0 14px 40px rgba(0,0,0,.2)}
.langs .menu a{display:flex;align-items:center;gap:10px;padding:7px 12px;border-radius:9px;font-size:.92rem}
.flag{width:22px;height:16px;border-radius:3px;object-fit:cover;flex:none;box-shadow:0 0 0 1px rgba(0,0,0,.18)}
.langs .chk{margin-inline-start:auto;width:16px;height:16px;stroke:var(--gold);fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;visibility:hidden}
.langs .menu a[aria-current] .chk{visibility:visible}
.langs .chev{width:14px;height:14px;opacity:.7;transition:transform .2s}
.langs[open] .chev{transform:rotate(180deg)}
.langs[open] summary{border-color:var(--gold)}
.langs .menu a:hover{background:var(--hover)}
.langs .menu a[aria-current]{color:var(--gold);font-weight:600}
.crumbs{font-size:.82rem;color:var(--muted);display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px}
.crumbs span{opacity:.5}
.hero{display:grid;grid-template-columns:1.1fr 1fr;gap:20px;margin-bottom:22px}
.hcard{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:26px}
h1{font-size:1.9rem;line-height:1.35;font-weight:700;margin-bottom:6px;color:var(--title)}
h1 em{font-style:normal;color:var(--green)}
html[data-mode=dark] h1 em{color:var(--gold)}
.hero h1{text-align:center}
.meta{color:var(--muted);font-size:.9rem;display:flex;flex-wrap:wrap;justify-content:center;gap:4px 14px;margin-bottom:18px}
.meta b{color:var(--text);font-weight:600}
.next{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--green);color:#fff;border-radius:16px;padding:16px 20px}
.next small{opacity:.85;font-size:.8rem;display:block}
.next strong{font-size:1.3rem}
.next .cd{font-size:1.9rem;font-weight:600;font-variant-numeric:tabular-nums;direction:ltr;letter-spacing:1px}
.hcard h2{font-size:1rem;color:var(--gold);margin-bottom:12px;font-weight:600}
.today{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.tt{background:var(--inner);border:1px solid var(--line);border-radius:14px;padding:12px 6px;text-align:center}
.tt svg{width:24px;height:24px;stroke:var(--gold);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.tt span{display:block;font-size:.78rem;color:var(--muted)}
.tt b{font-size:1.2rem;font-variant-numeric:tabular-nums;direction:ltr;display:inline-block}
.tt.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}
.month{background:var(--card);border:1px solid var(--line);border-radius:22px;overflow:hidden;margin-bottom:22px}
.mbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.hacts{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:16px}
.hacts .btn{flex:1 1 150px;justify-content:center;font-size:.95rem;padding:11px 16px}
.btn.ghost{background:transparent;color:var(--green);border-color:var(--green)}
.mqedit{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:12px;margin-top:12px;border:1px solid var(--line);border-radius:14px;background:var(--inner)}
.mqedit[hidden]{display:none}
.mqedit input{flex:1 1 220px;min-width:0;font:inherit;font-size:.95rem;padding:9px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--text)}
.mqedit small{flex-basis:100%;color:var(--muted);font-size:.8rem}
.mqprev{flex-basis:100%;display:flex;align-items:center;justify-content:center;gap:12px;background:#fff;border:1px dashed var(--line);border-radius:10px;padding:12px 10px}
.mqprev[hidden]{display:none}
.mqprev .ro{width:46px;height:46px;flex:none}
.mqprev .mqt{text-align:center;min-width:0}
.mqprev .mqn{font-weight:700;font-size:1.6rem;color:#8f2a39;line-height:1.35;overflow-wrap:anywhere}
.mqprev .fl{display:block;width:170px;max-width:100%;height:16px;margin:2px auto 0;fill:#c9a24e;stroke:#c9a24e}
.f-naskh{font-family:'Amiri',serif}.f-ruqaa{font-family:'Aref Ruqaa','Amiri',serif}.f-kufi{font-family:'Reem Kufi','Noto Kufi Arabic',sans-serif}
.fonts{display:flex;gap:6px;flex-basis:100%;justify-content:center}
.fonts button{font-size:1.05rem;padding:6px 16px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--text);cursor:pointer;font-weight:700}
.fonts button[aria-pressed=true]{border-color:var(--green);background:var(--green);color:#fff}
.mnav{display:flex;align-items:center;gap:10px}
.mnav a{width:38px;height:38px;border:1px solid var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem}
.mnav a:hover{background:var(--hover)}
.mtitle{text-align:center;min-width:180px}
.mtitle b{font-size:1.15rem;display:block}
.mtitle small{color:var(--muted);font-size:.8rem}
.btn{display:inline-flex;align-items:center;gap:8px;border-radius:12px;padding:9px 16px;font-family:inherit;font-size:.9rem;cursor:pointer;border:1px solid var(--green);background:var(--green);color:#fff}
.tablebox{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
thead th{background:var(--inner);font-size:.78rem;font-weight:600;color:var(--muted);padding:10px 6px;text-align:center;border-bottom:1px solid var(--line)}
thead th svg{width:18px;height:18px;stroke:var(--gold);fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;display:block;margin:0 auto 3px}
th.dcol{text-align:start;padding-inline-start:20px}
tbody td{padding:9px 6px;text-align:center;border-bottom:1px solid var(--line);font-size:.95rem}
tbody td.day{text-align:start;padding-inline-start:20px;white-space:nowrap}
tbody td.day b{display:inline-block;min-width:44px;font-weight:600;font-variant-numeric:tabular-nums}
tbody td.day i{font-style:normal;color:var(--muted);font-size:.82rem}
tbody td.hij{color:var(--muted);font-size:.82rem;white-space:nowrap}
tbody tr.fri td{background:var(--fri)}
tbody tr.fri td.day i{color:var(--gold);font-weight:600}
tbody tr.now td{background:var(--today);font-weight:600}
tbody tr.now td.day{box-shadow:inset -4px 0 0 var(--green)}
html[dir=ltr] tbody tr.now td.day{box-shadow:inset 4px 0 0 var(--green)}
tbody tr:hover td{background:var(--hover)}
.legend{display:flex;gap:16px;flex-wrap:wrap;padding:12px 20px;font-size:.78rem;color:var(--muted)}
.legend i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-inline-end:6px;border:1px solid var(--line)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px}
.info h3{font-size:1rem;color:var(--gold);margin-bottom:10px}
.info p{font-size:.9rem;color:var(--muted)}
.info dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:.9rem}
.info dt{color:var(--muted)} .info dd{font-weight:600;direction:ltr;text-align:end}
html[dir=ltr] .info dd{text-align:start}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chips a{background:var(--inner);border:1px solid var(--line);border-radius:999px;padding:5px 14px;font-size:.85rem}
.chips a:hover{border-color:var(--gold)}
.faq details{border-top:1px solid var(--line);padding:10px 0}
.faq summary{cursor:pointer;font-weight:600;font-size:.92rem}
.faq p{margin-top:6px}
footer{text-align:center;color:var(--muted);font-size:.8rem;padding:10px 0 32px}
footer a{color:var(--gold)}
.crumbs a:hover{color:var(--gold)}
.sheet-print{display:none}
@media (max-width:760px){
  .hero,.grid2{grid-template-columns:1fr}
  h1{font-size:1.5rem}
  .mbar{justify-content:center}
  thead th{font-size:.66rem;padding:8px 2px}
  thead th svg{width:15px;height:15px}
  th.dcol{padding-inline-start:10px}
  tbody td{font-size:.8rem;padding:8px 2px}
  tbody td.day{padding-inline-start:10px}
  tbody td.day i{font-size:.72rem}
  .hijcol{display:none}
  tbody td.day small{display:block;color:var(--muted);font-size:.66rem;line-height:1.2}
}
@media (min-width:761px){ tbody td.day small{display:none} }
@page{size:A4 portrait;margin:11mm 12mm}
@media print{
  html,body{background:#fff!important;color:#1d1410}
  .wrap>*:not(.sheet-print){display:none!important}
  .sheet-print{display:block;font-size:10pt}
  .ph{display:flex;align-items:center;justify-content:space-between;border-bottom:2.2pt solid #8f2a39;padding-bottom:4mm;margin-bottom:4mm}
  .ph .b{display:flex;align-items:center;gap:3.5mm}
  .ph img{width:15mm;height:15mm;border-radius:3.5mm}
  .ph .bn{font-family:'Amiri',serif;font-size:22pt;font-weight:700;line-height:1;word-spacing:-.32em}
  html[dir=ltr] .ph .bn{font-family:'Noto Sans',sans-serif;font-size:17pt}
  .ph .bs{font-size:7.5pt;color:#7a6a60;letter-spacing:.3pt}
  .ph .city{text-align:end}
  .ph .city b{display:block;font-size:15pt;line-height:1.25}
  .ph .city span{font-size:11pt;color:#a8802f;font-weight:700}
  .ph .b[hidden]{display:none}
  .ph .mqb{gap:4mm;max-width:62%}
  .ph .mqb .ro{width:15mm;height:15mm;flex:none}
  .ph .mqt{text-align:center}
  .ph .mqn{font-weight:700;color:#8f2a39;line-height:1.12;font-size:24pt}
  .ph .mqt .fl{display:block;width:58mm;height:4.6mm;margin:.3mm auto .6mm;fill:#c9a24e;stroke:#c9a24e}
  .pm{display:flex;justify-content:space-between;align-items:center;background:#f6efe8;border-radius:2.5mm;padding:2.4mm 4mm;margin-bottom:3.5mm;font-size:9.5pt}
  .pm b{font-size:12pt;color:#8f2a39}
  table.pt{width:100%;border-collapse:collapse;font-size:9pt}
  .pt th{line-height:1.3;background:#2a1c17;color:#fff;font-weight:600;font-size:8.2pt;padding:1.8mm 1mm;text-align:center}
  .pt td{text-align:center;line-height:1.2;padding:.6mm 1mm;border-bottom:.4pt solid #e6dcd3;font-variant-numeric:tabular-nums}
  .pt td.d{text-align:start;padding-inline-start:3mm;white-space:nowrap}
  .pt td.d b{display:inline-block;min-width:11mm;font-variant-numeric:tabular-nums}
  .pt td.h{color:#7a6a60;font-size:8.2pt;white-space:nowrap}
  .pt tr:nth-child(even) td{background:#fbf8f5}
  .pt tr.fri td{background:#f6ead2!important;font-weight:600}
  .pt td.em{color:#8f2a39;font-weight:600}
  .pf{display:flex;justify-content:space-between;align-items:flex-end;margin-top:4mm;padding-top:3mm;border-top:.6pt solid #d9cdc3;font-size:7.6pt;color:#7a6a60;gap:6mm}
  .pf .q{display:flex;align-items:center;gap:3mm;text-align:end}
  .pf .q svg{width:17mm;height:17mm;flex:none}
  .pf .q b{display:block;color:#2a1c17;font-size:9pt;direction:ltr}
  .pf .dua{font-family:'Amiri',serif;font-size:11pt;color:#2a1c17;margin-bottom:1mm;direction:rtl}
  * {-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
</style>
<!-- إحصاءات Vercel للزوار (بلا ملفات تعريف ارتباط) -->
<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
<div class="wrap">
  <div class="top">
    <a class="brandmini" href="/?lang=${lang}"><img src="/icon-192.png" alt="" width="38" height="38">${esc(t.logo)}</a>
    <div class="tr">${NAV.settings(lang)}<details class="langs"><summary><img class="flag" alt="" src="${flagSrc(lang)}">${esc(t.label)}<svg class="ic chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></summary><div class="menu">${langMenu}</div></details></div>
  </div>
  <nav class="crumbs">${NAV.html(lang)}<span>›</span><a href="/${lang}/countries">${esc(t.allCountries)}</a><span>›</span><a href="/${lang}/country/${city.cc.toLowerCase()}">${esc(country)}</a><span>›</span><b>${esc(cityName)}</b></nav>

  <section class="hero">
    <div class="hcard">
      <h1>${esc(fill(t.title, { city:"\u0000" })).replace("\u0000", `<em>${esc(cityName)}</em>`)}</h1>
      <div class="meta"><span><b>${esc(country)}</b></span><span>${esc(weekday(today.y, today.m, today.d, lang))} ${esc(longDate(today.y, today.m, today.d, lang))}</span><span>${esc(hijri(today.y, today.m, today.d, lang, { day:"numeric", month:"long", year:"numeric" }))}</span></div>
      <div class="next"><div><small>${esc(t.nextPrayer)}</small><strong id="nextName">—</strong></div><div class="cd" id="cd">--:--:--</div></div>
      <div class="hacts">
        <button class="btn ghost" type="button" id="mqBtn" aria-expanded="false"><svg class="ic" viewBox="0 0 24 24"><path d="M5 21V11a7 7 0 0 1 14 0v10M3 21h18M12 4V2M9 21v-4a3 3 0 0 1 6 0v4"/></svg><span id="mqLbl">${esc(t.mosque)}</span></button>
        <button class="btn" type="button" onclick="print()"><svg class="ic" viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/></svg>${esc(t.print)}</button>
      </div>
      <div class="mqedit" id="mqEdit" hidden>
        <input id="mqIn" maxlength="60" autocomplete="off" placeholder="${esc(t.mosqueEx)}" aria-label="${esc(t.mosque)}">
        <button class="btn" type="button" id="mqSave">${esc(t.save)}</button>
        <button class="btn ghost" type="button" id="mqDel">${esc(t.remove)}</button>
        <small>${esc(t.mosquePh)}</small>
        <div class="fonts" id="mqFonts">${(t.dir === "rtl" ? ["نسخ","رقعة","كوفي"] : ["Naskh","Ruqʿa","Kufi"]).map((n, i) => { const f = ["naskh","ruqaa","kufi"][i]; return `<button type="button" class="f-${f}" data-f="${f}" aria-pressed="false">${n}</button>`; }).join("")}</div>
        <div class="mqprev" id="mqPrev" hidden aria-hidden="true">${ROSETTE}<div class="mqt"><div class="mqn" id="mqPrevName"></div>${FLOURISH}</div></div>
      </div>
    </div>
    <div class="hcard">
      <h2>${esc(t.todayTimes)}</h2>
      <div class="today">${todayCards}</div>
    </div>
  </section>

  <section class="month">
    <div class="mbar">
      <div class="mnav">
        <a href="${path}?m=${ym(pm)}" aria-label="${esc(t.prev)}" rel="prev">${t.dir === "rtl" ? "›" : "‹"}</a>
        <div class="mtitle"><b>${esc(mTitle)}</b><small>${esc(hijRange)}</small></div>
        <a href="${path}?m=${ym(nm)}" aria-label="${esc(t.next)}" rel="next">${t.dir === "rtl" ? "‹" : "›"}</a>
      </div>
      <button class="btn" type="button" onclick="print()"><svg class="ic" viewBox="0 0 24 24"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/></svg>${esc(t.print)}</button>
    </div>
    <div class="tablebox"><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>
    <div class="legend">${isCurrent ? `<span><i style="background:var(--today)"></i>${esc(t.todayLbl)}</span>` : ""}<span><i style="background:var(--fri)"></i>${esc(t.friday)}</span><span>${esc(t.methodLabel)}: ${esc(methodName)} · ${esc(t.asrLabel)}: ${esc(asrName)}</span></div>
  </section>

  <section class="grid2">
    <div class="hcard info">
      <h3>${esc(fill(t.aboutCity, V))}</h3>
      <dl><dt>${esc(t.coords)}</dt><dd>${coordTxt}</dd><dt>${esc(t.tzLbl)}</dt><dd>${esc(city.tz)}</dd><dt>${esc(t.methodLabel)}</dt><dd>${esc(methodName)}</dd><dt>${esc(t.qibla)}</dt><dd>${esc(fill(t.qiblaVal, { deg:qibla(city) }))}</dd></dl>
    </div>
    <div class="hcard info">
      <h3>${esc(t.nearby)}</h3>
      <div class="chips">${near.map((c, i) => `<a href="/${lang}/${c.slug}">${esc(nearNames[i])}</a>`).join("")}</div>
    </div>
  </section>

  <section class="hcard info faq" style="margin-bottom:22px">
    <h3>${esc(t.faq)}</h3>
    ${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
  </section>

  <footer>© ${today.y} <a href="/?lang=${lang}">azankurd.com</a> · <a href="/${lang}/countries">${esc(t.allCountries)}</a> · <a href="/${lang}/about">${esc(INFO[lang].cAbout)}</a> · <a href="/${lang}/privacy">${esc(INFO[lang].cPrivacy)}</a> · <a href="/${lang}/contact">${esc(INFO[lang].cContact)}</a></footer>

  <div class="sheet-print">
    <div class="ph">
      <div class="b" id="pBrand"><img src="/icon-192.png" alt=""><div><div class="bn">${esc(t.logo)}</div><div class="bs">AZANKURD.COM · ${esc(t.tagline)}</div></div></div>
      <div class="b mqb" id="pMq" hidden>${ROSETTE}<div class="mqt"><div class="mqn" id="pMosqueName"></div>${FLOURISH}<div class="bs">AZANKURD.COM · ${esc(t.tagline)}</div></div></div>
      <div class="city"><b>${esc(t.prayerTimes)}</b><span>${esc(country)} – ${esc(cityName)}</span></div>
    </div>
    <div class="pm"><span>${esc(t.printHead)}</span><b>${esc(mTitle)}</b><span>${esc(hijRange)}</span></div>
    <table class="pt"><thead><tr>${pth}</tr></thead><tbody>${ptrs}</tbody></table>
    <div class="pf">
      <div><div class="dua">﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾</div>${esc(t.methodLabel)}: ${esc(methodName)} · ${esc(t.asrLabel)}: ${esc(asrName)} · ${esc(city.tz)} · ${coordTxt}</div>
      <div class="q"><div><b>azankurd.com${path}</b>${esc(t.scan)}</div>${qrSvg}</div>
    </div>
  </div>
</div>
<script>
${NAV.js(lang)}
(function(){
  var dl=document.querySelector(".langs");
  document.addEventListener("click",function(e){ if(dl.open && !dl.contains(e.target)) dl.open=false; });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape" && dl.open){ dl.open=false; dl.querySelector("summary").focus(); } });
})();
(function(){
  var TZ=${JSON.stringify(city.tz)}, TODAY=${JSON.stringify(tt)}, TMFAJR=${JSON.stringify(tmFajr)}, CUR=${isCurrent ? today.d : 0};
  var NAMES=${JSON.stringify(t.names)}, NK=${JSON.stringify(NAMEKEY)}, ORDER=["fajr","dhuhr","asr","maghrib","isha"];
  var fmt="24"; try{ fmt = localStorage.getItem("fmt") || "24"; }catch(e){}
  if(fmt==="12"){
    var loc=${JSON.stringify(lang === "ku" ? "ar" : lang)};
    document.querySelectorAll("[data-t]").forEach(function(el){
      var v=el.getAttribute("data-t"); if(!/^\\d\\d:\\d\\d$/.test(v)) return;
      var p=v.split(":"), d=new Date(2000,0,1,+p[0],+p[1]);
      try{ el.textContent = new Intl.DateTimeFormat(loc+"-u-nu-latn",{hour:"numeric",minute:"2-digit",hour12:true}).format(d); }catch(e){}
    });
  }
  if(CUR){ var tr=document.querySelector('tbody tr[data-d="'+CUR+'"]'); if(tr) tr.classList.add("now"); }
  function now(){ return new Date(new Date().toLocaleString("en-US",{timeZone:TZ,hour12:false})); }
  function at(base,hhmm,add){ var p=hhmm.split(":"),d=new Date(base); d.setDate(d.getDate()+(add||0)); d.setHours(+p[0],+p[1],0,0); return d; }
  function tick(){
    var n=now(), nk=null, nd=null;
    for(var i=0;i<ORDER.length;i++){ var k=ORDER[i]; if(!/\\d/.test(TODAY[k])) continue; var d=at(n,TODAY[k]); if(d>n){ nk=k; nd=d; break; } }
    if(!nk){ nk="fajr"; nd=at(n,TMFAJR,1); }
    var s=Math.max(0,Math.floor((nd-n)/1000)), p=function(x){return String(x).padStart(2,"0");};
    document.getElementById("cd").textContent=p(Math.floor(s/3600))+":"+p(Math.floor(s%3600/60))+":"+p(s%60);
    var el=document.querySelector("#tt-"+nk+" b");
    document.getElementById("nextName").textContent=NAMES[NK[nk]]+" · "+(el?el.textContent:TODAY[nk]);
    document.querySelectorAll(".tt").forEach(function(x){ x.classList.toggle("on", x.id==="tt-"+nk); });
  }
  tick(); setInterval(tick,1000);
})();
(function(){
  var K="azk_mosque", KF="azk_mosque_font", btn=document.getElementById("mqBtn"), box=document.getElementById("mqEdit"), inp=document.getElementById("mqIn");
  var lbl=document.getElementById("mqLbl"), base=lbl.textContent;
  // اسم المسجد لا يُحفظ في المتصفح: يبقى لهذه الصفحة فقط، حتى لا يُطبع اسم قديم بالخطأ لاحقًا
  // (أما الخط المختار فيُحفظ). ونحذف أي اسم قديم محفوظ من النسخة السابقة
  var name="";
  try{ localStorage.removeItem(K); }catch(e){}
  function get(k){ if(!k || k===K) return name; try{ return localStorage.getItem(k) || ""; }catch(e){ return ""; } }
  function put(v,k){ if(!k || k===K){ name=v||""; return; } try{ if(v) localStorage.setItem(k,v); else localStorage.removeItem(k); }catch(e){} }
  var font=get(KF) || "ruqaa", pick=font;
  // حجم الخط في الطباعة حسب طول الاسم، حتى يبقى في سطر أو سطرين
  function pt(v){ var n=v.length; return n<=12 ? 25 : n<=20 ? 22 : n<=30 ? 18 : 15; }
  function setFont(el,f){ el.className=el.className.replace(/\\s*f-\\w+/g,"")+" f-"+f; }
  function show(){
    var v=get(), n=document.getElementById("pMosqueName");
    n.textContent=v; setFont(n,font); n.style.fontSize=pt(v)+"pt";
    document.getElementById("pMq").hidden=!v;
    document.getElementById("pBrand").hidden=!!v;
    lbl.textContent=v || base;
  }
  function prev(){
    var v=inp.value.trim(), n=document.getElementById("mqPrevName");
    n.textContent=v; setFont(n,pick); document.getElementById("mqPrev").hidden=!v;
    document.querySelectorAll("#mqFonts button").forEach(function(b){ b.setAttribute("aria-pressed", String(b.getAttribute("data-f")===pick)); });
  }
  document.querySelectorAll("#mqFonts button").forEach(function(b){ b.addEventListener("click",function(){ pick=b.getAttribute("data-f"); prev(); }); });
  inp.addEventListener("input",prev);
  btn.addEventListener("click",function(){ box.hidden=!box.hidden; btn.setAttribute("aria-expanded",String(!box.hidden)); if(!box.hidden){ inp.value=get(); pick=font; prev(); inp.focus(); } });
  document.getElementById("mqSave").addEventListener("click",function(){ put(inp.value.trim()); font=pick; put(font,KF); show(); box.hidden=true; btn.setAttribute("aria-expanded","false"); });
  inp.addEventListener("keydown",function(e){ if(e.key==="Enter") document.getElementById("mqSave").click(); });
  document.getElementById("mqDel").addEventListener("click",function(){ put(""); inp.value=""; show(); box.hidden=true; btn.setAttribute("aria-expanded","false"); });
  show();
})();
</script>
</body>
</html>`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=21600, stale-while-revalidate=604800");
  res.end(html);
};
