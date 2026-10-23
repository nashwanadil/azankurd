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
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
};
const CALLBL = { ar:"تحويل التاريخ", ku:"گوهۆڕینا بەروارێ", en:"Date converter" };
const ic = k => `<svg class="ni" viewBox="0 0 24 24">${I[k]}</svg>`;

const css = `
.tr{display:flex;align-items:center;gap:8px}
.navm{position:relative}
.navm summary{list-style:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;background:var(--card);border:1px solid var(--gold);border-radius:999px;cursor:pointer}
.navm summary::-webkit-details-marker{display:none}
.navm[open] summary{border-color:var(--gold)}
.navm summary svg{width:19px;height:19px;stroke:var(--gold);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.navcal{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;background:var(--card);border:1px solid var(--gold);border-radius:999px;margin-inline-start:6px;flex:none}
.navcal svg{width:19px;height:19px;stroke:var(--gold);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.navm .menu{position:absolute;inset-inline-start:0;top:calc(100% + 8px);z-index:21;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px;width:230px;max-height:70vh;overflow:auto;box-shadow:0 14px 40px rgba(0,0,0,.2)}
.navm .menu a{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:9px;font-size:.92rem}
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

function html(lang){
  const t = T[lang], x = INFO[lang];
  return `<details class="navm"><summary aria-label="${esc(t.home)}">${ic("menu").replace('class="ni"', "")}</summary><div class="menu">
<a href="/?lang=${lang}">${ic("home")}<span>${esc(t.home)}</span></a>
<a href="/${lang}/countries">${ic("globe")}<span>${esc(t.allCountries)}</span></a>
<a class="mine" data-k="country" hidden>${ic("flag")}<span></span></a>
<a class="mine" data-k="city" hidden>${ic("pin")}<span></span></a>
<hr>
<a href="/${lang}/about">${ic("about")}<span>${esc(x.cAbout)}</span></a>
<a href="/${lang}/privacy">${ic("privacy")}<span>${esc(x.cPrivacy)}</span></a>
<a href="/${lang}/contact">${ic("contact")}<span>${esc(x.cContact)}</span></a>
</div></details><a class="navcal" href="/${lang}/hijri" aria-label="${esc(CALLBL[lang] || CALLBL.en)}" title="${esc(CALLBL[lang] || CALLBL.en)}"><svg viewBox="0 0 24 24">${I.cal}</svg></a>`;
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
      var c=document.querySelector('.navm .mine[data-k="city"]'); c.href="/"+L+"/"+p.slug; c.querySelector("span").textContent=p.name||p.slug; c.hidden=false;
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

module.exports = { css, html, js, settings };
