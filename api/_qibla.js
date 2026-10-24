// اتجاه القبلة: /ar/qibla
// يُحسب في المتصفح من موقع الزائر (المحفوظ من الصفحة الرئيسية أو الحالي)، والبوصلة من حسّاس الهاتف
const { LANGS } = require("./_core.js");
const { esc, page, send } = require("./_layout.js");
const NAV = require("./_nav.js");

const X = {
  ar:{ title:"اتجاه القبلة – بوصلة القبلة من موقعك", desc:"اعرف اتجاه القبلة بدقة من مكانك، مع بوصلة حيّة على الهاتف والمسافة إلى الكعبة.",
    h1:"اتجاه القبلة", from:"من", deg:"درجة من الشمال", dist:"المسافة إلى الكعبة", km:"كم",
    useLoc:"استخدم موقعي الحالي", locating:"جارٍ تحديد الموقع…", noLoc:"لم نعرف موقعك بعد. اضغط «استخدم موقعي الحالي» أو اختر مدينتك من الصفحة الرئيسية.", locErr:"تعذّر تحديد الموقع. اسمح للمتصفح بالوصول إلى الموقع ثم أعد المحاولة.",
    compass:"تشغيل البوصلة", live:"البوصلة تعمل: أدِر الهاتف حتى يصل السهم الأخضر إلى الأعلى.", facing:"أنت الآن باتجاه القبلة", noSensor:"هاتفك أو متصفحك لا يتيح البوصلة. ضع أعلى الهاتف نحو الشمال، فالسهم يدلّك على القبلة.",
    tips:"للدقة: أمسك الهاتف أفقيًا، وابتعد عن المعادن والمغناطيس، وحرّك الهاتف على شكل الرقم 8 لمعايرة البوصلة.", north:"ش", card:["الشمال","الشرق","الجنوب","الغرب"], cardL:["ش","ق","ج","غ"], toward:"نحو {c}، مائلًا {o}° نحو {t}", exact:"نحو {c} تمامًا", noComp:"جهازك لا يتيح البوصلة، ولكن اتجاه القبلة من موقعك {d}° من الشمال: {w}." },
  ku:{ title:"ئاراستەیا قیبلێ – قیبلەنما ژ جهێ تە", desc:"ئاراستەیا قیبلێ ب دروستی ژ جهێ خۆ بزانە، دگەل قیبلەنمایەکا زیندی ل سەر مۆبایلێ و دویراتیا کەعبێ.",
    h1:"ئاراستەیا قیبلێ", from:"ژ", deg:"پلە ژ باکوورێ", dist:"دویراتیا کەعبێ", km:"کم",
    useLoc:"جهێ من یێ نوکە بکاربینە", locating:"جه دهێتە دیارکرن…", noLoc:"هێشتا جهێ تە نەزانین. «جهێ من یێ نوکە بکاربینە» بدە یان باژێرێ خۆ ژ لاپەڕێ سەرەکی هەلبژێرە.", locErr:"دیارکرنا جهی سەرنەکەفت. ڕێ بدە وێبگەرێ دا جهی بزانیت و دیسا تاقی بکە.",
    compass:"قیبلەنمایێ هەلکە", live:"قیبلەنما کار دکەت: مۆبایلێ بزڤڕینە هەتا تیرا کەسک دگەهیتە سەری.", facing:"نوکە تو بەرەڤ قیبلێ یی", noSensor:"مۆبایلێ تە یان وێبگەرێ تە قیبلەنمایێ ڕێ نادەت. سەرێ مۆبایلێ بەرەڤ باکوورێ بکە، تیر دێ قیبلێ نیشا تە دەت.",
    tips:"بۆ دروستیێ: مۆبایلێ ب ئاسۆیی بگرە، ژ ئاسن و موگناتیسێ دویر بکەڤە، و مۆبایلێ وەک ژمارا 8 بلڤینە دا قیبلەنما ڕاست ببیت.", north:"باک", card:["باکوور","ڕۆژهەلات","باشوور","ڕۆژئاڤا"], cardL:["باکوور","ڕۆژهەلات","باشوور","ڕۆژئاڤا"], toward:"بەرەڤ {c}، {o}° بەرەڤ {t} لار", exact:"ڕاست بەرەڤ {c}", noComp:"ئامێرێ تە قیبلەنمایێ ڕێ نادەت، بەلێ ئاراستەیا قیبلێ ژ جهێ تە {d}° ژ باکوورێ یە: {w}." },
  en:{ title:"Qibla Direction – Qibla Compass from Your Location", desc:"Find the exact Qibla direction from where you are, with a live phone compass and the distance to the Kaaba.",
    h1:"Qibla direction", from:"From", deg:"degrees from north", dist:"Distance to the Kaaba", km:"km",
    useLoc:"Use my current location", locating:"Locating…", noLoc:"We don't know your location yet. Tap “Use my current location” or pick your city on the home page.", locErr:"Couldn't get your location. Allow location access in the browser and try again.",
    compass:"Start compass", live:"Compass on: turn the phone until the green arrow points to the top.", facing:"You are facing the Qibla", noSensor:"Your phone or browser doesn't offer a compass. Point the top of the phone north and the arrow shows the Qibla.",
    tips:"For accuracy: hold the phone flat, keep away from metal and magnets, and move the phone in a figure 8 to calibrate the compass.", north:"N", card:["north","east","south","west"], cardL:["N","E","S","W"], toward:"toward the {c}, {o}° toward the {t}", exact:"due {c}", noComp:"Your device has no compass, but the Qibla from your location is {d}° from north: {w}." }
};

const CSS = `
.qb{text-align:center}
.qb h1{margin-bottom:2px}
.qb .place{color:var(--muted);margin:0 0 4px}
.qb .deg{font-size:2.3rem;font-weight:800;color:var(--gold);direction:ltr;font-variant-numeric:tabular-nums;line-height:1.2}
.qb .deg small{display:block;font-size:.85rem;font-weight:400;color:var(--muted)}
.qb .way{color:var(--title);font-weight:600;margin:4px 0 0}
.qb .dial{position:relative;width:min(320px,74vw,38svh);aspect-ratio:1;margin:16px auto 10px;border-radius:50%;box-shadow:0 10px 30px rgba(60,30,20,.28),0 0 0 0 rgba(46,157,91,0);transition:box-shadow .25s}
.qb .dial.ok{box-shadow:0 10px 30px rgba(60,30,20,.28),0 0 0 6px rgba(46,157,91,.45)}
.qb .dial > svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.qb .lubber{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid var(--green);filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
.qb .center{position:absolute;left:50%;top:50%;width:52%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center}
.qb .center .k{width:46%;display:block;filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))}
.qb .center .txt{font-size:.78rem;line-height:1.7;color:var(--title);font-weight:600}
.qb .btns{display:flex;gap:8px;justify-content:center}
.qb .go{flex:0 1 auto;min-width:0;background:var(--green);color:#fff;border:1px solid var(--green);border-radius:10px;padding:9px 12px;font-family:inherit;font-size:.88rem;line-height:1.35;font-weight:600;cursor:pointer}
.qb .go.ghost{background:transparent;color:var(--text);border-color:var(--line)}
.qb .msg{min-height:1.6em;margin:12px 0 0;font-weight:600}
.qb .msg.ok{color:#2e9d5b}
.qb .muted{color:var(--muted);font-size:.85rem;margin-top:10px;line-height:1.8}`;

// الكعبة: مكعب أسود بحزام ذهبي وباب
const KAABA = `<svg class="k" viewBox="0 0 64 64" aria-hidden="true">
<path d="M8 20 L32 10 L56 20 L32 30 Z" fill="#3a3a3a"/>
<path d="M8 20 L32 30 L32 58 L8 48 Z" fill="#141414"/>
<path d="M32 30 L56 20 L56 48 L32 58 Z" fill="#232323"/>
<path d="M8 26 L32 36 L32 40 L8 30 Z" fill="url(#qgold)"/>
<path d="M32 36 L56 26 L56 30 L32 40 Z" fill="url(#qgold)" opacity=".85"/>
<path d="M14 44 L22 47.3 L22 35.3 L14 32 Z" fill="url(#qgold)" opacity=".9"/>
<path d="M8 20 L32 30 L56 20" fill="none" stroke="#c9a24e" stroke-width=".8" opacity=".6"/></svg>`;

function dial(x){
  const C = 100, tick = [], num = [];
  for(let a = 0; a < 360; a += 5){
    const major = a % 30 === 0, r1 = 86, r2 = major ? 78 : 82, t = a * Math.PI / 180;
    tick.push(`<line x1="${(C + r1 * Math.sin(t)).toFixed(2)}" y1="${(C - r1 * Math.cos(t)).toFixed(2)}" x2="${(C + r2 * Math.sin(t)).toFixed(2)}" y2="${(C - r2 * Math.cos(t)).toFixed(2)}" stroke="${major ? "url(#qgold)" : "var(--muted)"}" stroke-width="${major ? 1.6 : .7}" stroke-linecap="round"/>`);
    if(major){
      const r = 69, card = a % 90 === 0, lbl = card ? x.cardL[a / 90] : String(a);
      num.push(`<text x="${(C + r * Math.sin(t)).toFixed(2)}" y="${(C - r * Math.cos(t)).toFixed(2)}" text-anchor="middle" dominant-baseline="central" ${card ? "" : `transform="rotate(${a} ${(C + r * Math.sin(t)).toFixed(2)} ${(C - r * Math.cos(t)).toFixed(2)})"`} font-size="${card ? (lbl.length > 2 ? 6.5 : 10) : 6}" font-weight="${card ? 800 : 500}" fill="${a === 0 ? "var(--green)" : card ? "var(--title)" : "var(--muted)"}" font-family="inherit">${esc(lbl)}</text>`);
    }
  }
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
<defs>
<linearGradient id="qgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc93"/><stop offset=".45" stop-color="#c9a24e"/><stop offset=".7" stop-color="#9a7224"/><stop offset="1" stop-color="#e8c56a"/></linearGradient>
<radialGradient id="qface" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="var(--card)"/><stop offset="1" stop-color="var(--inner)"/></radialGradient>
<linearGradient id="qneedle" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8c56a"/><stop offset=".5" stop-color="#f6dc93"/><stop offset=".5" stop-color="#b8892f"/><stop offset="1" stop-color="#9a7224"/></linearGradient>
</defs>
<circle cx="100" cy="100" r="99" fill="url(#qgold)"/>
<circle cx="100" cy="100" r="95" fill="var(--green)"/>
<circle cx="100" cy="100" r="91.5" fill="none" stroke="url(#qgold)" stroke-width="1.4"/>
<circle cx="100" cy="100" r="89" fill="url(#qface)"/>
<g class="spin" id="qRose">${tick.join("")}${num.join("")}</g>
<circle cx="100" cy="100" r="58" fill="none" stroke="url(#qgold)" stroke-width=".8" opacity=".7"/>
<g class="spin" id="qArrow">
  <path d="M100 41 L105.5 63 L100 70 L94.5 63 Z" fill="url(#qneedle)" stroke="var(--green)" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M100 41 L100 70" stroke="var(--green)" stroke-width=".5" opacity=".6"/>
  <circle cx="100" cy="5.2" r="3.4" fill="var(--green)" stroke="url(#qgold)" stroke-width="1.2"/>
</g>
</svg>`;
}

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const x = X[lang] || X.en;
  const crumbs = `<nav class="crumbs">${NAV.html(lang)}<span>›</span><b>${esc(x.h1)}</b></nav>`;
  const body = `${crumbs}<section class="hcard qb"><h1>${esc(x.h1)}</h1>
  <p class="place" id="qPlace"></p>
  <div class="deg" id="qDeg">—<small>${esc(x.deg)}</small></div>
  <p class="way" id="qWay"></p>
  <div class="dial" id="qDial">${dial(x)}<span class="lubber"></span><div class="center" id="qCenter">${KAABA}</div></div>
  <p id="qDist" class="place"></p>
  <div class="btns"><button class="go" type="button" id="qCompass">${esc(x.compass)}</button><button class="go ghost" type="button" id="qLoc">${esc(x.useLoc)}</button></div>
  <p class="msg" id="qMsg" role="status"></p>
  <p class="muted">${esc(x.tips)}</p></section>`;
  const js = `(function(){
  var X=${JSON.stringify(x)}, L=${JSON.stringify(lang)}, KAABA=${JSON.stringify(KAABA)};
  var K={lat:21.422487,lng:39.826206}, R=Math.PI/180, bearing=null, heading=null, noComp=false;
  function $(id){ return document.getElementById(id); }
  function msg(t,ok){ var m=$("qMsg"); m.textContent=t||""; m.className="msg"+(ok?" ok":""); }
  function calc(lat,lng){
    var p1=lat*R, p2=K.lat*R, dl=(K.lng-lng)*R;
    var b=Math.atan2(Math.sin(dl), Math.cos(p1)*Math.tan(p2)-Math.sin(p1)*Math.cos(dl))/R;
    var a=Math.sin((p2-p1)/2)*Math.sin((p2-p1)/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2);
    return { b:(b+360)%360, km:Math.round(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))) };
  }
  // وصف الاتجاه بالكلمات: نحو الجنوب، مائلًا 11° نحو الغرب
  function words(b){
    var c=Math.round(b/90)%4, off=Math.round(((b-c*90)+540)%360-180);
    if(Math.abs(off)<1) return X.exact.replace("{c}",X.card[c]);
    var tilt=off>0?(c+1)%4:(c+3)%4;
    return X.toward.replace("{c}",X.card[c]).replace("{o}",Math.abs(off)).replace("{t}",X.card[tilt]);
  }
  var nf=new Intl.NumberFormat((L==="ku"?"ar":L)+"-u-nu-latn");
  function setPlace(lat,lng,name){
    var r=calc(lat,lng); bearing=r.b;
    $("qDeg").firstChild.nodeValue=Math.round(r.b)+"°";
    $("qWay").textContent=words(r.b);
    $("qDist").textContent=X.dist+": "+nf.format(r.km)+" "+X.km;
    $("qPlace").textContent=name?X.from+" "+name:"";
    if(noComp) showNoComp();
    draw(); if(!noComp) msg("");
  }
  function showNoComp(){
    noComp=true;
    if(bearing===null){ msg(X.noSensor); return; }
    $("qCenter").innerHTML='<span class="txt"></span>';
    $("qCenter").firstChild.textContent=X.noComp.replace("{d}",Math.round(bearing)).replace("{w}",words(bearing));
    msg("");
  }
  function draw(){
    if(bearing===null) return;
    var h=heading===null?0:heading;
    $("qRose").setAttribute("transform","rotate("+(-h)+" 100 100)");
    $("qArrow").setAttribute("transform","rotate("+(bearing-h)+" 100 100)");
    if(heading!==null){
      var d=Math.abs(((bearing-h)%360+540)%360-180), ok=d<4;
      $("qDial").classList.toggle("ok",ok);
      if(ok && !draw.was && navigator.vibrate) try{ navigator.vibrate(60); }catch(e){}
      draw.was=ok; msg(ok?X.facing:X.live, ok);
    }
  }
  function read(k){ try{ return JSON.parse(localStorage.getItem(k)||"null"); }catch(e){ return null; } }
  var c=read("cache"), q=read("lastQuery"), mp=read("myPlace");
  var m=c&&c.data&&c.data.meta;
  // الحاسوب بلا شاشة لمس: لا حسّاس اتجاه في الغالب، فنعرض الشرح مباشرة
  var desktop=window.matchMedia && matchMedia("(hover:hover) and (pointer:fine)").matches && !("ontouchstart" in window);
  if(desktop){ noComp=true; $("qCompass").hidden=true; }
  if(m && isFinite(+m.latitude) && isFinite(+m.longitude)) setPlace(+m.latitude,+m.longitude,(q&&q.name)||(mp&&mp.name)||"");
  else msg(X.noLoc);
  $("qLoc").onclick=function(){
    if(!navigator.geolocation) return msg(X.locErr);
    msg(X.locating);
    navigator.geolocation.getCurrentPosition(function(p){ msg(""); setPlace(p.coords.latitude,p.coords.longitude,""); }, function(){ msg(X.locErr); }, {enableHighAccuracy:true,timeout:15000,maximumAge:600000});
  };
  function onOri(e){
    var h=null;
    if(typeof e.webkitCompassHeading==="number") h=e.webkitCompassHeading;
    else if(e.absolute && typeof e.alpha==="number") h=360-e.alpha;
    if(h===null) return;
    var so=(screen.orientation&&screen.orientation.angle)||window.orientation||0;
    heading=(h+so+360)%360;
    if(noComp){ noComp=false; $("qCenter").innerHTML=KAABA; }
    draw();
  }
  $("qCompass").onclick=function(){
    var start=function(){
      if("ondeviceorientationabsolute" in window) window.addEventListener("deviceorientationabsolute",onOri);
      else window.addEventListener("deviceorientation",onOri);
      setTimeout(function(){ if(heading===null) showNoComp(); },2500);
    };
    if(typeof DeviceOrientationEvent!=="undefined" && typeof DeviceOrientationEvent.requestPermission==="function"){
      DeviceOrientationEvent.requestPermission().then(function(s){ s==="granted"?start():showNoComp(); }).catch(showNoComp);
    } else if(typeof DeviceOrientationEvent!=="undefined") start();
    else showNoComp();
  };
})();`;
  send(res, page({ lang, title:x.title, desc:x.desc, path:"/qibla", body, css:CSS, js }));
};
