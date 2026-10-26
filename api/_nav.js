// زر القائمة (التنقل) في بداية شريط المسار تحت الشعار، وزر الإعدادات بجانب اللغات، في صفحات المدن والبلدان والصفحات الأخرى
// فيه: الرئيسية، كل البلدان، بلدك ومدينتك (من موقعك المحفوظ في المتصفح)، عن الموقع، الخصوصية، اتصل بنا
const T = require("./_i18n.js");
const INFO = require("./_info.js");

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const I = {
  menu:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  home:'<path d="M3 11l9-7 9 7M5 10v10h14V10"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  pin:'<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  privacy:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  contact:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  qibla:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  ramadan:'<path d="M15 4a8 8 0 1 0 5 12.5A6.5 6.5 0 0 1 15 4z"/><path d="M18 3l.6 1.4L20 5l-1.4.6L18 7l-.6-1.4L16 5l1.4-.6z"/>',
  occasions:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 12.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
  zakat:'<circle cx="12" cy="12" r="9"/><path d="M14.5 9a2.5 2.5 0 0 0-2.5-1.5c-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2a2.5 2.5 0 0 1-2.5-1.5M12 6v1.5M12 16.5V18"/>',
  azkar:'<circle cx="12" cy="5" r="1.6"/><circle cx="17.5" cy="8" r="1.6"/><circle cx="19" cy="13.5" r="1.6"/><circle cx="6.5" cy="8" r="1.6"/><circle cx="5" cy="13.5" r="1.6"/><circle cx="8" cy="18.5" r="1.6"/><circle cx="16" cy="18.5" r="1.6"/><path d="M12 20v2"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
};
const CALLBL = {"ar": "تحويل التاريخ", "ku": "گوهۆڕینا بەروارێ", "en": "Date converter", "de": "Datumsrechner", "tr": "Tarih çevirici", "fa": "تبدیل تاریخ", "ur": "تاریخ کی تبدیلی", "fr": "Convertisseur de dates", "es": "Conversor de fechas", "it": "Convertitore di date", "nl": "Datumomrekenaar", "da": "Datoomregner", "sv": "Datumomvandlare", "ru": "Конвертер дат", "bs": "Pretvarač datuma", "id": "Konversi tanggal", "ms": "Penukar tarikh", "bn": "তারিখ রূপান্তর", "ps": "د نېټې اړونه", "ha": "Sauya kwanan wata", "sw": "Kubadili tarehe"};
const ZAKATBL = {"ar": "حاسبة الزكاة", "ku": "هژمارتنا زەکاتێ", "en": "Zakat calculator", "de": "Zakat-Rechner", "tr": "Zekât hesaplayıcı", "fa": "محاسبه‌گر زکات", "ur": "زکوٰۃ کیلکولیٹر", "fr": "Calcul de la zakat", "es": "Calculadora de zakat", "it": "Calcolo della zakat", "nl": "Zakat-calculator", "da": "Zakat-beregner", "sv": "Zakat-kalkylator", "ru": "Калькулятор закята", "bs": "Kalkulator zekata", "id": "Kalkulator zakat", "ms": "Kalkulator zakat", "bn": "যাকাত ক্যালকুলেটর", "ps": "د زکات حساب", "ha": "Lissafin zakka", "sw": "Kikokotoo cha zaka"};
const QIBLABL = {"ar": "اتجاه القبلة", "ku": "ئاراستەیا قیبلێ", "en": "Qibla direction", "de": "Qibla-Richtung", "tr": "Kıble yönü", "fa": "جهت قبله", "ur": "سمتِ قبلہ", "fr": "Direction de la qibla", "es": "Dirección de la alquibla", "it": "Direzione della qibla", "nl": "Qibla-richting", "da": "Qibla-retning", "sv": "Qibla-riktning", "ru": "Направление киблы", "bs": "Smjer kible", "id": "Arah kiblat", "ms": "Arah kiblat", "bn": "কিবলার দিক", "ps": "د قبلې لوری", "ha": "Hanyar Alƙibla", "sw": "Mwelekeo wa Qibla"};
const RAMADANBL = {"ar": "زاوية رمضان", "ku": "گۆشەیا ڕەمەزانێ", "en": "Ramadan corner", "de": "Ramadan-Ecke", "tr": "Ramazan köşesi", "fa": "گوشهٔ رمضان", "ur": "رمضان گوشہ", "fr": "Coin du Ramadan", "es": "Rincón del Ramadán", "it": "Angolo del Ramadan", "nl": "Ramadanhoek", "da": "Ramadan-hjørne", "sv": "Ramadanhörnan", "ru": "Уголок Рамадана", "bs": "Ramazanski kutak", "id": "Pojok Ramadan", "ms": "Sudut Ramadan", "bn": "রমজান কর্নার", "ps": "د رمضان کونج", "ha": "Kusurwar Ramadan", "sw": "Kona ya Ramadhani"};
const OCCASIONSBL = {"ar": "المناسبات الهجرية", "ku": "بۆنێن هجری", "en": "Hijri occasions", "de": "Islamische Feiertage", "tr": "Hicrî günler", "fa": "مناسبت‌های قمری", "ur": "ہجری مواقع", "fr": "Fêtes de l'Hégire", "es": "Fechas islámicas", "it": "Ricorrenze islamiche", "nl": "Islamitische feestdagen", "da": "Islamiske mærkedage", "sv": "Islamiska högtider", "ru": "Исламские даты", "bs": "Islamski datumi", "id": "Hari besar Islam", "ms": "Hari kebesaran Islam", "bn": "হিজরি উপলক্ষ", "ps": "هجري مناسبتونه", "ha": "Lokutan Hijira", "sw": "Siku za Kiislamu"};
const AZKARBL = {"ar": "الأذكار", "ku": "زکر و دوعا", "en": "Adhkar", "de": "Adhkar", "tr": "Zikirler", "fa": "اذکار", "ur": "اذکار", "fr": "Adhkar", "es": "Adhkar", "it": "Adhkar", "nl": "Adhkar", "da": "Adhkar", "sv": "Adhkar", "ru": "Азкары", "bs": "Zikrovi", "id": "Zikir", "ms": "Zikir", "bn": "যিকির", "ps": "اذکار", "ha": "Azkar", "sw": "Adhkar"};
const ic = k => `<svg class="ni" viewBox="0 0 24 24">${I[k]}</svg>`;

const css = `
.gbar{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:2px 0 14px}
.gb{box-sizing:border-box;height:40px;line-height:1.3;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:1.5px solid var(--gold);color:var(--gold);background:var(--card);border-radius:999px;padding:7px 13px;font-family:inherit;font-size:.88rem;font-weight:700;white-space:nowrap;text-decoration:none;cursor:pointer;list-style:none}
.gb::-webkit-details-marker{display:none}
.gb:hover{background:var(--hover)}
.gb svg{width:17px;height:17px;flex:none;stroke:var(--gold);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.gb.on{background:var(--green);border-color:var(--green);color:#fff}
.gb.on svg{stroke:#f3d58a}
.gbmore{position:relative;display:none}
.gbmore .menu{inset-inline-start:auto!important;inset-inline-end:0!important}
.gbmore > summary.gb{width:100%;height:auto;border-radius:999px;background:var(--card);border:1.5px solid var(--gold);display:flex}
.gbmore .menu a{color:var(--gold);font-weight:600}
.top{flex-wrap:wrap;gap:8px}
.top > .brandmini{order:1}
.top > .tr{order:3}
.top > .gbar{order:4;flex-basis:100%;margin:6px 0 0}
@media (min-width:761px){
  /* الحاسوب: الصفان يبدآن من الطرف الأيسر معًا، فتحاذي حافة زر اللغة حافة المناسبات */
  .top{justify-content:flex-end}
  .top > .gbar{justify-content:flex-end}
  /* الشعار يبقى في طرف الصفحة اليمين، ولا ينزاح مع الأزرار */
  .top > .brandmini{margin-inline-end:auto}
}
.top > .setbtn{order:2}
@media (max-width:760px){
  /* الهاتف: الشعار، الرئيسية، اللغة، المزيد في سطر واحد أعلى الصفحة */
  .top{display:grid;grid-template-columns:auto repeat(4,minmax(0,1fr));gap:8px;align-items:center}
  .top > .gbar,.top > .tr{display:contents}
  html .top > .brandmini{order:0;font-size:0!important;gap:0}
  html[dir=ltr] .gb{font-size:.8rem;gap:5px}
  .gb svg{width:16px;height:16px}
  .gb.gbhome{order:1}
  .gb.gbhome span{display:none}
  .gb.gbhome svg{width:22px;height:22px}
  .top .langs{order:2;min-width:0}
  .top .langs summary{width:100%;justify-content:center;box-sizing:border-box;height:40px}
  .top .langs .lname{display:none}
  .top .langs summary .flag{width:25px;height:17px}
  .gbmore{order:4;display:block}
  .gbmore > summary svg{display:none}
  .top .langs summary{height:36px}
  .top .langs summary .flag{width:22px;height:15px}
  .gb{width:100%;padding:8px 6px;min-width:0}
  .gb span{overflow:hidden;text-overflow:ellipsis}
  .gb.wide{display:none}
  .top > .setbtn{display:flex;order:3;width:100%;padding:8px 6px;min-width:0;justify-content:center}
  .top > .setbtn span{display:none}
}

.tr{display:flex;align-items:center;gap:8px}
.navm{position:relative}
.navm summary{list-style:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;background:var(--card);border:1px solid var(--gold);border-radius:999px;cursor:pointer}
.navm summary::-webkit-details-marker{display:none}
.navm[open] summary{border-color:var(--gold)}
.navm summary svg{width:19px;height:19px;stroke:var(--gold);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.navcal{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;background:var(--card);border:1px solid var(--gold);border-radius:999px;margin-inline-start:6px;flex:none}
.navcal svg{width:19px;height:19px;stroke:var(--gold);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.navm .menu{position:absolute;inset-inline-start:0;top:calc(100% + 8px);z-index:21;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px;width:230px;max-height:70vh;max-height:calc(100svh - 120px);overflow:auto;box-shadow:0 14px 40px rgba(0,0,0,.2)}
.navm .menu a{display:flex;align-items:center;gap:10px;padding:7px 12px;border-radius:9px;font-size:.92rem}
.navm .menu a:hover{background:var(--hover)}
.navm .menu a[hidden]{display:none}
.navm .menu hr{border:0;border-top:1px solid var(--line);margin:5px 6px}
.crumbs{align-items:center}
.crumbs .navm span{opacity:1}
.navm .menu{color:var(--text);font-size:.92rem;font-weight:400}
/* الإعدادات واللغات: إطار وكلمات بالذهبي */
.langs summary,.setpill{border-color:var(--gold)!important;color:var(--gold)}
.langs summary .chev{stroke:var(--gold);opacity:1}
.setpill{display:inline-flex;align-items:center;gap:7px;background:var(--card);border:1px solid var(--gold);border-radius:999px;padding:6px 14px;font-size:.88rem}
.setpill svg{width:17px;height:17px;stroke:var(--gold);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
@media (max-width:420px){ .setpill span{display:none} .setpill{padding:0;width:34px;height:34px;justify-content:center} .brandmini{font-size:1.35rem} }
.navm .ni{width:17px;height:17px;flex:none;stroke:var(--gold);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}`;

const MORE = { ar:"المزيد", ku:"زێدەتر", en:"More", de:"Mehr", tr:"Daha fazla", fa:"بیشتر", ur:"مزید", fr:"Plus", es:"Más", it:"Altro", nl:"Meer", da:"Mere", sv:"Mer", ru:"Ещё", bs:"Više", id:"Lainnya", ms:"Lagi", bn:"আরও", ps:"نور", ha:"Ƙari", sw:"Zaidi" };
const QSHORT = { ar:"القبلة", ku:"قیبلە", en:"Qibla", de:"Qibla", tr:"Kıble", fa:"قبله", ur:"قبلہ", fr:"Qibla", es:"Alquibla", it:"Qibla", nl:"Qibla", da:"Qibla", sv:"Qibla", ru:"Кибла", bs:"Kibla", id:"Kiblat", ms:"Kiblat", bn:"কিবলা", ps:"قبله", ha:"Alƙibla", sw:"Qibla" };
I.more = '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>';
const lbl = (d, lang) => d[lang] || d.en;
// اسم قصير لزر الرئيسية في الشريط (حتى لا يُقطع على الهاتف)
const HOMESHORT = {"ar": "الرئيسية", "ku": "سەرەکی", "en": "Home", "de": "Start", "tr": "Ana sayfa", "fa": "خانه", "ur": "ہوم", "fr": "Accueil", "es": "Inicio", "it": "Home", "nl": "Home", "da": "Forside", "sv": "Start", "ru": "Главная", "bs": "Početna", "id": "Beranda", "ms": "Utama", "bn": "হোম", "ps": "کور", "ha": "Gida", "sw": "Mwanzo"};
// أسماء قصيرة لأزرار الشريط في الحاسوب (القائمة في الهاتف تبقى بالأسماء الكاملة)
const SHORT = { ar:{countries:"البلدان",hijri:"التاريخ",zakat:"الزكاة",azkar:"الأذكار",ramadan:"رمضان",occasions:"المناسبات"},
  ku:{countries:"وەلات",hijri:"بەروار",zakat:"زەکات",azkar:"زکر",ramadan:"ڕەمەزان",occasions:"بۆنە"},
  en:{countries:"Countries",hijri:"Dates",zakat:"Zakat",azkar:"Adhkar",ramadan:"Ramadan",occasions:"Occasions"} };

// بداية شريط المسار: «الرئيسية»
function html(lang){
  return `<a href="/?lang=${lang}">${esc(T[lang].home)}</a>`;
}

// الشريط الأفقي: الرئيسية والقبلة دائمًا؛ في الحاسوب بقية الأدوات والإعدادات، وفي الهاتف زر «المزيد» يفتح القائمة
function bar(lang, cur){
  const t = T[lang], x = INFO[lang];
  const b = (href, k, label, cls = "") => `<a class="gb${cls}${cur === k ? " on" : ""}" href="${href}">${ic(k)}<span>${esc(label)}</span></a>`;
  const m = (href, k, label) => `<a href="${href}">${ic(k)}<span>${esc(label)}</span></a>`;
  const tools = [["countries","globe",t.allCountries],["hijri","cal",lbl(CALLBL,lang)],["zakat","zakat",lbl(ZAKATBL,lang)],["azkar","azkar",lbl(AZKARBL,lang)],["ramadan","ramadan",lbl(RAMADANBL,lang)],["occasions","occasions",lbl(OCCASIONSBL,lang)]];
  return `<nav class="gbar">
${b(`/?lang=${lang}`, "home", HOMESHORT[lang] || t.home, " gbhome")}${b(`/${lang}/qibla`, "qibla", QSHORT[lang] || t.qibla, " wide")}
${tools.map(([p, k, l]) => b(`/${lang}/${p}`, k, (SHORT[lang] && SHORT[lang][p]) || l, " wide").replace(cur === p ? 'class="gb wide"' : "@@", 'class="gb wide on"')).join("")}
<details class="gbmore navm"><summary class="gb">${ic("more")}<span>${esc(MORE[lang] || MORE.en)}</span></summary><div class="menu">
${m(`/${lang}/qibla`, "qibla", lbl(QIBLABL, lang))}
${tools.map(([p, k, l]) => m(`/${lang}/${p}`, k, l)).join("\n")}
${m(`/?lang=${lang}&settings=1`, "gear", t.settings)}
<hr>
${m(`/${lang}/about`, "about", x.cAbout)}
${m(`/${lang}/privacy`, "privacy", x.cPrivacy)}
${m(`/${lang}/contact`, "contact", x.cContact)}
</div></details></nav>`;
}

// زر الإعدادات: يفتح الإعدادات في الصفحة الرئيسية
function settings(lang){
  return `<a class="setpill" href="/?lang=${lang}&settings=1" aria-label="${esc(T[lang].settings)}"><svg viewBox="0 0 24 24">${I.gear}</svg><span>${esc(T[lang].settings)}</span></a>`;
}

// يملأ بلدك ومدينتك من موقعك المحفوظ (تحفظه الصفحة الرئيسية)، ويغلق القوائم عند الضغط خارجها
function js(lang){
  return `(function(){
  var L=${JSON.stringify(lang)}, PS=${JSON.stringify({ ar:"فلسطين", ku:"فەلەستین", fa:"فلسطین", ur:"فلسطین", ps:"فلسطین" })};
  try{
    var p=JSON.parse(localStorage.getItem("myPlace")||"null");
    if(p && p.slug){
      var c=document.querySelector('.navm .mine[data-k="city"]'); if(!c) throw 0; c.href="/"+L+"/"+p.slug; c.querySelector("span").textContent=p.name||p.slug; c.hidden=false;
      if(p.cc){
        var n=p.cc; try{ var dn=new Intl.DisplayNames([L==="ku"?"ckb":L, L==="ku"?"ar":"en"],{type:"region"}); n=(p.cc==="PS"&&PS[L])||dn.of(p.cc)||p.cc; }catch(e){}
        var k=document.querySelector('.navm .mine[data-k="country"]'); k.href="/"+L+"/country/"+p.cc.toLowerCase(); k.querySelector("span").textContent=n; k.hidden=false;
      }
    }
  }catch(e){}
  var all=[].slice.call(document.querySelectorAll("details.navm, details.langs"));
  all.forEach(function(d){ d.addEventListener("toggle",function(){ if(d.open) all.forEach(function(o){ if(o!==d) o.open=false; }); }); });
  document.addEventListener("click",function(e){ all.forEach(function(d){ if(d.open && !d.contains(e.target)) d.open=false; }); });
})();`;
}

// زر الإعدادات يوضع بجانب زر اللغة (خارج شريط الأزرار)
function settingsLink(lang){
  const t = T[lang];
  return `<a class="gb wide setbtn" href="/?lang=${lang}&settings=1">${ic("gear")}<span>${esc(t.settings)}</span></a>`;
}
module.exports = { css, html, bar, js, settings, settingsLink };
