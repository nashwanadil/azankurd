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
    tips:"للدقة: أمسك الهاتف أفقيًا، وابتعد عن المعادن والمغناطيس، وحرّك الهاتف على شكل الرقم 8 لمعايرة البوصلة.", north:"ش" },
  ku:{ title:"ئاراستەیا قیبلێ – قیبلەنما ژ جهێ تە", desc:"ئاراستەیا قیبلێ ب دروستی ژ جهێ خۆ بزانە، دگەل قیبلەنمایەکا زیندی ل سەر مۆبایلێ و دویراتیا کەعبێ.",
    h1:"ئاراستەیا قیبلێ", from:"ژ", deg:"پلە ژ باکوورێ", dist:"دویراتیا کەعبێ", km:"کم",
    useLoc:"جهێ من یێ نوکە بکاربینە", locating:"جه دهێتە دیارکرن…", noLoc:"هێشتا جهێ تە نەزانین. «جهێ من یێ نوکە بکاربینە» بدە یان باژێرێ خۆ ژ لاپەڕێ سەرەکی هەلبژێرە.", locErr:"دیارکرنا جهی سەرنەکەفت. ڕێ بدە وێبگەرێ دا جهی بزانیت و دیسا تاقی بکە.",
    compass:"قیبلەنمایێ هەلکە", live:"قیبلەنما کار دکەت: مۆبایلێ بزڤڕینە هەتا تیرا کەسک دگەهیتە سەری.", facing:"نوکە تو بەرەڤ قیبلێ یی", noSensor:"مۆبایلێ تە یان وێبگەرێ تە قیبلەنمایێ ڕێ نادەت. سەرێ مۆبایلێ بەرەڤ باکوورێ بکە، تیر دێ قیبلێ نیشا تە دەت.",
    tips:"بۆ دروستیێ: مۆبایلێ ب ئاسۆیی بگرە، ژ ئاسن و موگناتیسێ دویر بکەڤە، و مۆبایلێ وەک ژمارا 8 بلڤینە دا قیبلەنما ڕاست ببیت.", north:"باک" },
  en:{ title:"Qibla Direction – Qibla Compass from Your Location", desc:"Find the exact Qibla direction from where you are, with a live phone compass and the distance to the Kaaba.",
    h1:"Qibla direction", from:"From", deg:"degrees from north", dist:"Distance to the Kaaba", km:"km",
    useLoc:"Use my current location", locating:"Locating…", noLoc:"We don't know your location yet. Tap “Use my current location” or pick your city on the home page.", locErr:"Couldn't get your location. Allow location access in the browser and try again.",
    compass:"Start compass", live:"Compass on: turn the phone until the green arrow points to the top.", facing:"You are facing the Qibla", noSensor:"Your phone or browser doesn't offer a compass. Point the top of the phone north and the arrow shows the Qibla.",
    tips:"For accuracy: hold the phone flat, keep away from metal and magnets, and move the phone in a figure 8 to calibrate the compass.", north:"N" }
};

const CSS = `
.qb{text-align:center}
.qb .place{color:var(--muted);margin:0 0 6px}
.qb .deg{font-size:2.6rem;font-weight:800;color:var(--gold);direction:ltr;font-variant-numeric:tabular-nums;line-height:1.2}
.qb .deg small{display:block;font-size:.85rem;font-weight:400;color:var(--muted)}
.qb .dial{position:relative;width:min(300px,78vw);aspect-ratio:1;margin:18px auto;border-radius:50%;border:2px solid var(--line);background:var(--inner);transition:border-color .2s}
.qb .dial.ok{border-color:#2e9d5b;box-shadow:0 0 0 4px rgba(46,157,91,.18)}
.qb .rose{position:absolute;inset:0;transition:transform .12s linear}
.qb .rose .n{position:absolute;top:8px;left:50%;transform:translateX(-50%);font-weight:800;color:#d0443c;font-size:.95rem}
.qb .rose .tick{position:absolute;left:50%;top:0;width:2px;height:10px;background:var(--line);transform-origin:1px calc(min(300px,78vw)/2)}
.qb .arrow{position:absolute;inset:0;transition:transform .12s linear}
.qb .arrow svg{width:100%;height:100%}
.qb .kaaba{position:absolute;left:50%;top:50%;width:34px;height:34px;transform:translate(-50%,-50%);border-radius:6px;background:#1c1c1c;border-top:6px solid #c9a24e}
.qb .top{position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:12px solid var(--gold)}
.qb .btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.qb .go{background:var(--green);color:#fff;border:1px solid var(--green);border-radius:10px;padding:10px 16px;font-family:inherit;font-size:.95rem;font-weight:600;cursor:pointer}
.qb .go.ghost{background:transparent;color:var(--text);border-color:var(--line)}
.qb .msg{min-height:1.6em;margin:12px 0 0;font-weight:600}
.qb .msg.ok{color:#2e9d5b}
.qb .muted{color:var(--muted);font-size:.85rem;margin-top:10px;line-height:1.8}`;

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const x = X[lang] || X.en;
  const ticks = Array.from({ length:36 }, (_, i) => `<i class="tick" style="transform:rotate(${i * 10}deg)"></i>`).join("");
  const crumbs = `<nav class="crumbs">${NAV.html(lang)}<span>›</span><b>${esc(x.h1)}</b></nav>`;
  const body = `${crumbs}<section class="hcard qb"><h1>${esc(x.h1)}</h1>
  <p class="place" id="qPlace"></p>
  <div class="deg" id="qDeg">—<small>${esc(x.deg)}</small></div>
  <div class="dial" id="qDial"><span class="top"></span>
    <div class="rose" id="qRose">${ticks}<span class="n">${esc(x.north)}</span></div>
    <div class="arrow" id="qArrow"><svg viewBox="0 0 100 100"><path d="M50 8 L57 26 L52 26 L52 50 L48 50 L48 26 L43 26 Z" fill="#2e9d5b"/></svg></div>
    <span class="kaaba"></span></div>
  <p id="qDist" class="place"></p>
  <div class="btns"><button class="go" type="button" id="qCompass">${esc(x.compass)}</button><button class="go ghost" type="button" id="qLoc">${esc(x.useLoc)}</button></div>
  <p class="msg" id="qMsg" role="status"></p>
  <p class="muted">${esc(x.tips)}</p></section>`;
  const js = `(function(){
  var X=${JSON.stringify(x)}, L=${JSON.stringify(lang)};
  var K={lat:21.422487,lng:39.826206}, R=Math.PI/180, bearing=null, heading=null;
  function $(id){ return document.getElementById(id); }
  function msg(t,ok){ var m=$("qMsg"); m.textContent=t||""; m.className="msg"+(ok?" ok":""); }
  function calc(lat,lng){
    var p1=lat*R, p2=K.lat*R, dl=(K.lng-lng)*R;
    var b=Math.atan2(Math.sin(dl), Math.cos(p1)*Math.tan(p2)-Math.sin(p1)*Math.cos(dl))/R;
    var a=Math.sin((p2-p1)/2)*Math.sin((p2-p1)/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2);
    return { b:(b+360)%360, km:Math.round(6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))) };
  }
  var nf=new Intl.NumberFormat((L==="ku"?"ar":L)+"-u-nu-latn");
  function setPlace(lat,lng,name){
    var r=calc(lat,lng); bearing=r.b;
    $("qDeg").firstChild.nodeValue=Math.round(r.b)+"°";
    $("qDist").textContent=X.dist+": "+nf.format(r.km)+" "+X.km;
    $("qPlace").textContent=name?X.from+" "+name:"";
    draw(); msg("");
  }
  function draw(){
    if(bearing===null) return;
    var h=heading===null?0:heading;
    $("qRose").style.transform="rotate("+(-h)+"deg)";
    $("qArrow").style.transform="rotate("+(bearing-h)+"deg)";
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
  if(m && isFinite(+m.latitude) && isFinite(+m.longitude)) setPlace(+m.latitude,+m.longitude,(q&&q.name)||(mp&&mp.name)||"");
  else msg(X.noLoc);
  $("qLoc").onclick=function(){
    if(!navigator.geolocation) return msg(X.locErr);
    msg(X.locating);
    navigator.geolocation.getCurrentPosition(function(p){ setPlace(p.coords.latitude,p.coords.longitude,""); }, function(){ msg(X.locErr); }, {enableHighAccuracy:true,timeout:15000,maximumAge:600000});
  };
  function onOri(e){
    var h=null;
    if(typeof e.webkitCompassHeading==="number") h=e.webkitCompassHeading;
    else if(e.absolute && typeof e.alpha==="number") h=360-e.alpha;
    if(h===null) return;
    var so=(screen.orientation&&screen.orientation.angle)||window.orientation||0;
    heading=(h+so+360)%360; draw();
  }
  $("qCompass").onclick=function(){
    var start=function(){
      var got=false, f=function(e){ got=true; onOri(e); };
      if("ondeviceorientationabsolute" in window) window.addEventListener("deviceorientationabsolute",f);
      else window.addEventListener("deviceorientation",f);
      setTimeout(function(){ if(!got||heading===null) msg(X.noSensor); },2500);
    };
    if(typeof DeviceOrientationEvent!=="undefined" && typeof DeviceOrientationEvent.requestPermission==="function"){
      DeviceOrientationEvent.requestPermission().then(function(s){ s==="granted"?start():msg(X.noSensor); }).catch(function(){ msg(X.noSensor); });
    } else if(typeof DeviceOrientationEvent!=="undefined") start();
    else msg(X.noSensor);
  };
})();`;
  send(res, page({ lang, title:x.title, desc:x.desc, path:"/qibla", body, css:CSS, js }));
};
