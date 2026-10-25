// محوّل التاريخ الهجري (أم القرى) والميلادي: /ar/hijri  /ku/hijri ...
// الحساب كله في المتصفح عبر Intl، فلا يستهلك الخادم شيئًا
const { LANGS } = require("./_core.js");
const { T, esc, page, send } = require("./_layout.js");
const NAV = require("./_nav.js");

const X = {
  ar:{ title:"تحويل التاريخ الهجري والميلادي", desc:"حوّل بين التاريخ الهجري (تقويم أم القرى) والميلادي بسهولة، مع اسم اليوم.", h1:"تحويل التاريخ", todayLbl:"اليوم", g2h:"من الميلادي إلى الهجري", h2g:"من الهجري إلى الميلادي", pick:"اكتب التاريخ الميلادي (يوم.شهر.سنة)", day:"اليوم", month:"الشهر", year:"السنة", go:"تحويل", eq:"يوافق", err:"تاريخ غير صحيح أو خارج المدى المدعوم (1300–1600 هـ)", era:"هـ", ex:"مثال:", note:"التقويم المعتمد: أم القرى. وقد يختلف يومًا واحدًا عن رؤية الهلال المحلية." },
  ku:{ title:"گوهۆڕینا بەروارێ هجری و زایینی", desc:"ب ئاسانی ژ بەروارێ هجری (ئومولقورا) بۆ زایینی و پێچەوانە بگوهۆڕە، دگەل ناڤێ ڕۆژێ.", h1:"گوهۆڕینا بەروارێ", todayLbl:"ئەڤرۆ", g2h:"ژ زایینی بۆ هجری", h2g:"ژ هجری بۆ زایینی", pick:"بەروارێ زایینی بنڤیسە (ڕۆژ.مەه.سال)", day:"ڕۆژ", month:"مەه", year:"سال", go:"بگوهۆڕە", eq:"دبیتە", err:"بەروار دروست نینە یان ژ ڕێژەیا پشتگیریکری دەرڤەیە (1300–1600 هـ)", era:"ھ", ex:"نموونە:", note:"ژمێریارێ بکارهاتی: ئومولقورا. دبیت ب ڕۆژەکێ ژ دیتنا هیڤیا جهێ جودا بیت." },
  en:{ title:"Hijri and Gregorian Date Converter", desc:"Convert between the Hijri (Umm al-Qura) and Gregorian calendars, with the weekday.", h1:"Date converter", todayLbl:"Today", g2h:"Gregorian to Hijri", h2g:"Hijri to Gregorian", pick:"Type the Gregorian date (day.month.year)", day:"Day", month:"Month", year:"Year", go:"Convert", eq:"equals", err:"Invalid date or outside the supported range (1300–1600 AH)", era:"AH", ex:"e.g.", note:"Calendar used: Umm al-Qura. It may differ by one day from local moon sighting." }
};
const KU_HIJRI = ["موحەڕەم","سەفەر","ڕەبیعولئەوەل","ڕەبیعولئاخر","جومادەلئەوەل","جومادەلئاخر","ڕەجەب","شەعبان","ڕەمەزان","شەووال","زولقەعدە","زولحیججە"];
const KU_MONTHS = ["کانوونا دووێ","شوبات","ئادار","نیسان","گولان","حزیران","تیرمەھ","تەباخ","ئەیلوول","چریا ئێکێ","چریا دووێ","کانوونا ئێکێ"];
const KU_WD = ["ئێکشەمب","دووشەمب","سێشەمب","چارشەمب","پێنجشەمب","ئەینی","شەمبی"];

const CSS = `
.cv{display:grid;gap:16px}
.cv .hcard h2{font-size:1.05rem;color:var(--gold);margin:0 0 12px}
.cv .row{display:grid;grid-template-columns:1fr 1.6fr 1.2fr;gap:8px}
.cv label{display:block;color:var(--muted);font-size:.8rem;margin:0 0 4px}
.cv input,.cv select{width:100%;box-sizing:border-box;background:var(--inner);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px;font-family:inherit;font-size:1rem}
.cv input:focus,.cv select:focus{outline:0;border-color:var(--gold)}
.cv .go{margin-top:12px;width:100%;background:var(--green);color:#fff;border:1px solid var(--green);border-radius:10px;padding:10px;font-family:inherit;font-size:1rem;font-weight:600;cursor:pointer}
.cv .out{margin-top:14px;min-height:2.2em;font-size:1.15rem;line-height:1.8;color:var(--title);font-weight:600}
.cv .out.err{color:#d0443c;font-size:.95rem;font-weight:400}
.cv .out.hit{color:var(--gold);border:1.5px solid var(--gold);border-radius:14px;padding:12px 14px;animation:hitGlow 1.4s ease-out 2}
@keyframes hitGlow{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--gold) 55%,transparent);background:color-mix(in srgb,var(--gold) 18%,transparent)}100%{box-shadow:0 0 0 14px color-mix(in srgb,var(--gold) 0%,transparent);background:color-mix(in srgb,var(--gold) 0%,transparent)}}
.cv .today{font-size:1.05rem;line-height:1.9}
.cv .today b{color:var(--gold)}
.cv .muted{color:var(--muted);font-size:.85rem;margin-top:6px}`;

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const x = X[lang] || X.en, t = T[lang];
  const crumbs = `<nav class="crumbs">${NAV.html(lang)}<span>›</span><b>${esc(x.h1)}</b></nav>`;
  const body = `${crumbs}<div class="cv">
  <section class="hcard"><h1>${esc(x.h1)}</h1><p class="today"><span>${esc(x.todayLbl)}: </span><b id="todayH"></b><br><span id="todayG" class="muted"></span></p></section>
  <section class="hcard"><h2>${esc(x.g2h)}</h2>
    <label for="gIn">${esc(x.pick)}</label><input type="text" id="gIn" dir="ltr" inputmode="numeric" autocomplete="off" maxlength="10" placeholder="${esc(x.ex)} 07.07.1974">
    <button class="go" type="button" id="g2h">${esc(x.go)}</button><div class="out" id="outH" role="status"></div></section>
  <section class="hcard"><h2>${esc(x.h2g)}</h2>
    <div class="row"><div><label for="hD">${esc(x.day)}</label><input id="hD" type="number" min="1" max="30" inputmode="numeric" dir="ltr"></div>
    <div><label for="hM">${esc(x.month)}</label><select id="hM"></select></div>
    <div><label for="hY">${esc(x.year)}</label><input id="hY" type="number" min="1300" max="1600" inputmode="numeric" dir="ltr"></div></div>
    <button class="go" type="button" id="h2g">${esc(x.go)}</button><div class="out" id="outG" role="status"></div></section>
  <p class="muted">${esc(x.note)}</p></div>`;
  const js = `(function(){
  var L=${JSON.stringify(lang)}, X=${JSON.stringify({ eq:x.eq, err:x.err, era:x.era })};
  var KU_H=${JSON.stringify(KU_HIJRI)}, KU_M=${JSON.stringify(KU_MONTHS)}, KU_W=${JSON.stringify(KU_WD)};
  var loc=(L==="ku"?"ar":L);
  var fmtH=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"numeric",year:"numeric",timeZone:"UTC"});
  function toH(dt){ var p={}; fmtH.formatToParts(dt).forEach(function(x){ p[x.type]=x.value; }); return {y:+p.year,m:+p.month,d:+p.day}; }
  function fromH(y,m,d){
    var a=Date.UTC(622,6,19)+((y-1)*354.36707+(m-1)*29.5306+(d-1))*864e5;
    for(var o=-45;o<=45;o++){ var dt=new Date(a+o*864e5), h=toH(dt); if(h.y===y&&h.m===m&&h.d===d) return dt; }
    return null;
  }
  function hMonth(m){
    if(L==="ku") return KU_H[m-1];
    var dt=fromH(1447,m,1); if(!dt) return String(m);
    try{ return new Intl.DateTimeFormat(loc+"-u-ca-islamic-umalqura-nu-latn",{month:"long",timeZone:"UTC"}).format(dt); }catch(e){ return String(m); }
  }
  function gMonth(dt){ if(L==="ku") return KU_M[dt.getUTCMonth()]; try{ return new Intl.DateTimeFormat(loc+"-u-ca-gregory-nu-latn",{month:"long",timeZone:"UTC"}).format(dt); }catch(e){ return String(dt.getUTCMonth()+1); } }
  function wDay(dt){ if(L==="ku") return KU_W[dt.getUTCDay()]; try{ return new Intl.DateTimeFormat(loc+"-u-ca-gregory-nu-latn",{weekday:"long",timeZone:"UTC"}).format(dt); }catch(e){ return ""; } }
  function gText(dt){ return wDay(dt)+" "+dt.getUTCDate()+" "+gMonth(dt)+" "+dt.getUTCFullYear(); }
  function hText(h){ return h.d+" "+hMonth(h.m)+" "+h.y+" "+X.era; }
  var sel=document.getElementById("hM"); for(var i=1;i<=12;i++){ var o=document.createElement("option"); o.value=i; o.textContent=i+" · "+hMonth(i); sel.appendChild(o); }
  var now=new Date(), td=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()));
  document.getElementById("todayH").textContent=hText(toH(td)); document.getElementById("todayG").textContent=gText(td);
  var gi=document.getElementById("gIn");
  // نقطة تلقائية بعد اليوم والشهر، ولا تتكرر إن كتبها المستخدم بنفسه
  gi.addEventListener("input",function(e){
    var typed=gi.value.split("/").join(".").split("-").join(".").split(",").join(".").split(" ").join(""), segs=[""], i, ch;
    for(i=0;i<typed.length;i++){ ch=typed[i];
      if(ch==="."){ if(segs[segs.length-1] && segs.length<3) segs.push(""); continue; }
      if("٠١٢٣٤٥٦٧٨٩".indexOf(ch)>=0) ch=String("٠١٢٣٤٥٦٧٨٩".indexOf(ch)); else if("۰۱۲۳۴۵۶۷۸۹".indexOf(ch)>=0) ch=String("۰۱۲۳۴۵۶۷۸۹".indexOf(ch));
      if("0123456789".indexOf(ch)<0) continue;
      if(segs.length<3 && segs[segs.length-1].length===2) segs.push("");
      if(segs.length===3 && segs[2].length>=4) continue;
      segs[segs.length-1]+=ch;
    }
    var out=segs.join(".");
    if(!(e.inputType||"").startsWith("delete") && segs.length<3 && segs[segs.length-1].length===2) out+=".";
    if(out!==gi.value) gi.value=out;
  });
  // الضغط على الخانة يحدد ما فيها، فيحلّ ما يُكتب محله؛ ومن لم يضغط تبقى كما هي
  ["gIn","hD","hY"].forEach(function(id){ var el=document.getElementById(id), fresh=false;
    el.addEventListener("focus",function(){ fresh=true; setTimeout(function(){ try{ el.select(); }catch(e){} },0); });
    el.addEventListener("mouseup",function(e){ if(fresh){ e.preventDefault(); fresh=false; try{ el.select(); }catch(x){} } });
    el.addEventListener("touchend",function(){ if(fresh){ setTimeout(function(){ try{ el.select(); }catch(x){} fresh=false; },10); } });
    el.addEventListener("keydown",function(e){ if(e.key==="Enter") document.getElementById(id==="gIn"?"g2h":"h2g").click(); }); });
  var th=toH(td); document.getElementById("hD").value=th.d; sel.value=th.m; document.getElementById("hY").value=th.y;
  function show(id,txt,err){ var e=document.getElementById(id); e.textContent=txt; e.className="out"; void e.offsetWidth; e.className="out"+(err?" err":" hit"); }
  document.getElementById("g2h").addEventListener("click",function(){
    var v=gi.value.trim()?gi.value.split(".").map(Number):[td.getUTCDate(),td.getUTCMonth()+1,td.getUTCFullYear()];
    if(v.length!==3||!(v[0]>=1&&v[0]<=31&&v[1]>=1&&v[1]<=12&&v[2]>=1800)) return show("outH",X.err,1);
    var dt=new Date(Date.UTC(v[2],v[1]-1,v[0])); if(dt.getUTCDate()!==v[0]) return show("outH",X.err,1);
    var h=toH(dt);
    if(!(h.y>=1300&&h.y<=1600)) return show("outH",X.err,1);
    show("outH",gText(dt)+"  "+X.eq+"  "+hText(h));
  });
  document.getElementById("h2g").addEventListener("click",function(){
    var d=+document.getElementById("hD").value, m=+sel.value, y=+document.getElementById("hY").value;
    if(!(y>=1300&&y<=1600&&d>=1&&d<=30)) return show("outG",X.err,1);
    var dt=fromH(y,m,d); if(!dt) return show("outG",X.err,1);
    show("outG",hText({d:d,m:m,y:y})+"  "+X.eq+"  "+gText(dt));
  });
})();`;
  send(res, page({ lang, title:`${x.title} | ${t.logo}`, desc:x.desc, path:"/hijri", body, css:CSS, js }));
};
