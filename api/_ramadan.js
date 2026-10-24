// زاوية رمضان: إمساكية الشهر كله لموقع الزائر، مع عدّ تنازلي للإمساك والإفطار: /ar/ramadan
// الصفحة تقرأ موقع الزائر المحفوظ في المتصفح، ثم تطلب المواقيت من هذه الدالة نفسها (?json=1)
const adhan = require("adhan");
const { LANGS, METHODS, autoMethod, paramsFor } = require("./_core.js");
const { esc, page, send } = require("./_layout.js");
const NAV = require("./_nav.js");

const X = {
  ar:{ title:"إمساكية رمضان – مواعيد السحور والإفطار في مدينتك", desc:"إمساكية شهر رمضان كاملة لمدينتك: الإمساك والفجر والمغرب (الإفطار) والعشاء لكل يوم، مع عدّ تنازلي لرمضان وللإفطار.",
    h1:"زاوية رمضان", imsakiya:"إمساكية رمضان", for:"لـ", toRamadan:"باقٍ على رمضان", toImsak:"باقٍ على الإمساك", toIftar:"باقٍ على الإفطار", eidSoon:"تقبّل الله صيامكم، وعيد مبارك",
    d:"يوم", h:"ساعة", m:"دقيقة", s:"ثانية",
    day:"رمضان", date:"التاريخ", imsak:"الإمساك", fajr:"الفجر", maghrib:"الإفطار", isha:"العشاء",
    noLoc:"اختر مدينتك أولًا من الصفحة الرئيسية، أو استخدم موقعك الحالي.", useLoc:"استخدم موقعي الحالي", change:"تغيير المدينة", print:"طباعة الإمساكية", loading:"جارٍ الحساب…", err:"تعذّر حساب المواقيت.",
    note:"الإمساك قبل الفجر بعشر دقائق احتياطًا، والصوم يبدأ من أذان الفجر. بداية الشهر بحسب تقويم أم القرى، وقد تختلف يومًا بحسب رؤية الهلال في بلدك.", method:"طريقة الحساب" },
  ku:{ title:"ئیمساکیا ڕەمەزانێ – دەمێن پارشیڤ و فتارێ ل باژێرێ تە", desc:"ئیمساکیا هەمی ڕۆژێن ڕەمەزانێ بۆ باژێرێ تە: ئیمساک، سپێدە، ئێڤار (فتار) و عەیشا، دگەل ژمارتنا پاشڤە بۆ ڕەمەزانێ و فتارێ.",
    h1:"گۆشەیا ڕەمەزانێ", imsakiya:"ئیمساکیا ڕەمەزانێ", for:"بۆ", toRamadan:"مایە بۆ ڕەمەزانێ", toImsak:"مایە بۆ ئیمساکێ", toIftar:"مایە بۆ فتارێ", eidSoon:"خودێ ڕۆژیێن هەوە قەبویل بکەت، جەژنا هەوە پیرۆز",
    d:"ڕۆژ", h:"دەمژمێر", m:"خولەک", s:"چرکە",
    day:"ڕەمەزان", date:"بەروار", imsak:"ئیمساک", fajr:"سپێدە", maghrib:"فتار", isha:"عەیشا",
    noLoc:"پێشی باژێرێ خۆ ژ لاپەڕێ سەرەکی هەلبژێرە، یان جهێ خۆ یێ نوکە بکاربینە.", useLoc:"جهێ من یێ نوکە بکاربینە", change:"گوهۆڕینا باژێری", print:"چاپکرنا ئیمساکیێ", loading:"دهێتە هژمارتن…", err:"هژمارتنا دەمان سەرنەکەفت.",
    note:"ئیمساک دە خولەکان بەری سپێدێ یە بۆ هشیاریێ، و ڕۆژی ژ بانگا سپێدێ دەست پێدکەت. دەستپێکا هەیڤێ ل دویڤ ژمێریارێ ئومولقورایە، و دبیت ب ڕۆژەکێ ل دویڤ دیتنا هیڤێ ل وەلاتێ تە جودا بیت.", method:"ڕێکا هژمارتنێ" },
  en:{ title:"Ramadan Timetable – Suhoor and Iftar Times in Your City", desc:"The full Ramadan timetable for your city: Imsak, Fajr, Maghrib (iftar) and Isha for every day, with countdowns to Ramadan and to iftar.",
    h1:"Ramadan corner", imsakiya:"Ramadan timetable", for:"for", toRamadan:"Until Ramadan", toImsak:"Until Imsak", toIftar:"Until iftar", eidSoon:"May Allah accept your fasting — Eid Mubarak",
    d:"days", h:"hours", m:"min", s:"sec",
    day:"Ramadan", date:"Date", imsak:"Imsak", fajr:"Fajr", maghrib:"Iftar", isha:"Isha",
    noLoc:"Pick your city on the home page first, or use your current location.", useLoc:"Use my current location", change:"Change city", print:"Print timetable", loading:"Calculating…", err:"Couldn't calculate the times.",
    note:"Imsak is 10 minutes before Fajr as a precaution; the fast begins at the Fajr adhan. The month follows the Umm al-Qura calendar and may differ by a day with local moon sighting.", method:"Calculation method" }
};

const fmtH = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { day:"numeric", month:"numeric", year:"numeric", timeZone:"UTC" });
function toH(dt){ const p = {}; fmtH.formatToParts(dt).forEach(x => p[x.type] = x.value); return { y:+p.year, m:+p.month, d:+p.day }; }
function fromH(y, m, d){
  const a = Date.UTC(622, 6, 19) + ((y - 1) * 354.36707 + (m - 1) * 29.5306 + (d - 1)) * 864e5;
  for(let o = -45; o <= 45; o++){ const dt = new Date(a + o * 864e5), h = toH(dt); if(h.y === y && h.m === m && h.d === d) return dt; }
  return null;
}
function times(lat, lng, tz, method){
  const today = new Date(new Intl.DateTimeFormat("en-CA", { timeZone:tz }).format(new Date()) + "T00:00:00Z");
  const h = toH(today);
  let hy = h.y;
  const end = fromH(h.y, 10, 1);
  if(h.m > 9 || (end && today >= end)) hy = h.y + 1;
  const start = fromH(hy, 9, 1), stop = fromH(hy, 10, 1);
  if(!start || !stop) return null;
  const P = paramsFor(method), coords = new adhan.Coordinates(lat, lng), days = [];
  for(let dt = start, n = 1; dt < stop; dt = new Date(+dt + 864e5), n++){
    const t = new adhan.PrayerTimes(coords, new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()), P);
    days.push({ n, date:dt.toISOString().slice(0, 10), fajr:+t.fajr, imsak:+t.fajr - 10 * 60000, maghrib:+t.maghrib, isha:+t.isha });
  }
  return { hy, tz, method, days };
}

const CSS = `
.rm .cd{display:flex;justify-content:center;gap:10px;margin:10px 0 6px;direction:ltr}
.rm .cd div{min-width:64px;background:var(--inner);border:1px solid var(--line);border-radius:12px;padding:8px 6px;text-align:center}
.rm .cd b{display:block;font-size:1.9rem;font-weight:800;color:var(--gold);font-variant-numeric:tabular-nums;line-height:1.2}
.rm .cd small{color:var(--muted);font-size:.75rem}
.rm .cdl{text-align:center;color:var(--muted);font-weight:700;margin:0}
.rm .place{text-align:center;color:var(--muted);margin:4px 0 0}
.rm .btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:12px 0}
.rm .go{background:var(--green);color:#fff;border:1px solid var(--green);border-radius:10px;padding:9px 14px;font-family:inherit;font-size:.9rem;font-weight:600;cursor:pointer;text-decoration:none}
.rm .go.ghost{background:transparent;color:var(--text);border-color:var(--line)}
.rm table{width:100%;border-collapse:collapse;font-size:.9rem;margin-top:8px}
.rm th,.rm td{padding:8px 4px;text-align:center;border-bottom:1px solid var(--line)}
.rm th{color:var(--gold);font-weight:600;font-size:.82rem}
.rm td.t{direction:ltr;font-variant-numeric:tabular-nums}
.rm td.mg{font-weight:700}
.rm tr.today td{background:var(--inner);font-weight:700}
.rm .muted{color:var(--muted);font-size:.82rem;line-height:1.8;margin-top:12px}
.rm .msg{text-align:center;color:var(--muted)}
@media print{ header,.topbar,.crumbs,.rm .btns,.rm .cdwrap,footer,.foot{display:none!important} .rm table{font-size:11pt} body{background:#fff!important;color:#000!important} }`;

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  if(u.searchParams.get("json")){
    const lat = +u.searchParams.get("lat"), lng = +u.searchParams.get("lng");
    let tz = String(u.searchParams.get("tz") || "UTC");
    try{ new Intl.DateTimeFormat("en", { timeZone:tz }); }catch(e){ tz = "UTC"; }
    let method = +u.searchParams.get("m");
    if(!METHODS[method]) method = autoMethod(tz);
    let out = null;
    if(isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) out = times(lat, lng, tz, method);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.statusCode = out ? 200 : 400;
    return res.end(JSON.stringify(out ? { ...out, methodName:METHODS[method] } : { error:"bad" }));
  }
  const x = X[lang] || X.en;
  const crumbs = `<nav class="crumbs">${NAV.html(lang)}<span>›</span><b>${esc(x.h1)}</b></nav>`;
  const body = `${crumbs}<section class="hcard rm"><h1>${esc(x.h1)}</h1>
  <div class="cdwrap"><p class="cdl" id="rLbl"></p><div class="cd" id="rCd" hidden>
    <div><b id="cD">0</b><small>${esc(x.d)}</small></div><div><b id="cH">0</b><small>${esc(x.h)}</small></div><div><b id="cM">0</b><small>${esc(x.m)}</small></div><div><b id="cS">0</b><small>${esc(x.s)}</small></div></div></div>
  <p class="place" id="rPlace"></p>
  <div class="btns"><button class="go ghost" type="button" id="rLoc">${esc(x.useLoc)}</button><a class="go ghost" href="/?lang=${lang}&settings=1">${esc(x.change)}</a><button class="go" type="button" id="rPrint" hidden>${esc(x.print)}</button></div>
  <h2 id="rTitle" style="text-align:center;color:var(--gold);font-size:1.05rem"></h2>
  <p class="msg" id="rMsg"></p>
  <div style="overflow-x:auto"><table id="rTable" hidden><thead><tr><th>${esc(x.day)}</th><th>${esc(x.date)}</th><th>${esc(x.imsak)}</th><th>${esc(x.fajr)}</th><th>${esc(x.maghrib)}</th><th>${esc(x.isha)}</th></tr></thead><tbody></tbody></table></div>
  <p class="muted">${esc(x.note)}</p><p class="muted" id="rMethod"></p></section>`;
  const js = `(function(){
  var X=${JSON.stringify(x)}, L=${JSON.stringify(lang)}, loc=(L==="ku"?"ar":L)+"-u-nu-latn";
  function $(id){ return document.getElementById(id); }
  function read(k){ try{ return JSON.parse(localStorage.getItem(k)||"null"); }catch(e){ return null; } }
  var fmt12=(localStorage.getItem("fmt")||"24")==="12", D=null, timer=null;
  function tm(ms,tz){ return new Date(ms).toLocaleTimeString("en-GB",{timeZone:tz,hour:"2-digit",minute:"2-digit",hour12:fmt12}); }
  function dt(iso){ var d=new Date(iso+"T12:00:00Z"); try{ return new Intl.DateTimeFormat(loc,{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"}).format(d); }catch(e){ return iso; } }
  function load(lat,lng,tz,m,name){
    $("rMsg").textContent=X.loading;
    fetch("/"+L+"/ramadan?json=1&lat="+lat+"&lng="+lng+"&tz="+encodeURIComponent(tz)+"&m="+(m||"")).then(function(r){ return r.json(); }).then(function(j){
      if(!j||!j.days) throw 0; D=j; $("rMsg").textContent="";
      $("rPlace").textContent=name||""; $("rTitle").textContent=X.imsakiya+" "+j.hy+" "+(L==="en"?"AH":"هـ");
      $("rMethod").textContent=X.method+": "+j.methodName;
      var today=new Intl.DateTimeFormat("en-CA",{timeZone:j.tz}).format(new Date()), rows="";
      j.days.forEach(function(d){ rows+='<tr'+(d.date===today?' class="today"':'')+'><td>'+d.n+'</td><td>'+dt(d.date)+'</td><td class="t">'+tm(d.imsak,j.tz)+'</td><td class="t">'+tm(d.fajr,j.tz)+'</td><td class="t mg">'+tm(d.maghrib,j.tz)+'</td><td class="t">'+tm(d.isha,j.tz)+'</td></tr>'; });
      $("rTable").querySelector("tbody").innerHTML=rows; $("rTable").hidden=false; $("rPrint").hidden=false;
      tick(); clearInterval(timer); timer=setInterval(tick,1000);
    }).catch(function(){ $("rMsg").textContent=X.err; });
  }
  function tick(){
    if(!D) return; var now=Date.now(), ds=D.days, target=null, lbl="";
    if(now<ds[0].imsak){ target=ds[0].imsak; lbl=X.toRamadan; }
    else { for(var i=0;i<ds.length;i++){ if(now<ds[i].imsak){ target=ds[i].imsak; lbl=X.toImsak; break; } if(now<ds[i].maghrib){ target=ds[i].maghrib; lbl=X.toIftar; break; } } }
    if(target===null){ $("rLbl").textContent=X.eidSoon; $("rCd").hidden=true; return; }
    var s=Math.max(0,Math.floor((target-now)/1000));
    $("rLbl").textContent=lbl; $("rCd").hidden=false;
    $("cD").textContent=Math.floor(s/86400); $("cH").textContent=Math.floor(s%86400/3600); $("cM").textContent=Math.floor(s%3600/60); $("cS").textContent=s%60;
  }
  var c=read("cache"), q=read("lastQuery"), mp=read("myPlace"), m=c&&c.data&&c.data.meta;
  if(m && isFinite(+m.latitude)) load(+m.latitude,+m.longitude,m.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone,c.method,(q&&q.name)||(mp&&mp.name)||"");
  else $("rMsg").textContent=X.noLoc;
  $("rLoc").onclick=function(){
    if(!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(function(p){ load(Math.round(p.coords.latitude*100)/100,Math.round(p.coords.longitude*100)/100,Intl.DateTimeFormat().resolvedOptions().timeZone,"",""); },function(){ $("rMsg").textContent=X.noLoc; },{timeout:15000,maximumAge:600000});
  };
  $("rPrint").onclick=function(){ window.print(); };
})();`;
  send(res, page({ lang, title:x.title, desc:x.desc, path:"/ramadan", body, css:CSS, js }));
};
