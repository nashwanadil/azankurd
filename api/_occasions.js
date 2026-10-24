// المناسبات الهجرية: /ar/occasions — تواريخها الميلادية القادمة والأيام الباقية (تقويم أم القرى، تُحسب في المتصفح)
const { LANGS } = require("./_core.js");
const { esc, page, send } = require("./_layout.js");
const NAV = require("./_nav.js");

// [الشهر، اليوم، المفتاح]
const LIST = [[1,1,"newYear"],[1,10,"ashura"],[3,12,"mawlid"],[7,27,"isra"],[8,15,"shaban"],[9,1,"ramadan"],[9,21,"lastTen"],[10,1,"fitr"],[12,1,"dhulhijja"],[12,9,"arafah"],[12,10,"adha"]];

const X = {
  ar:{ title:"المناسبات الإسلامية والهجرية – مواعيدها القادمة", desc:"مواعيد المناسبات الهجرية القادمة بالتاريخ الميلادي: رأس السنة، عاشوراء، رمضان، العيدان، يوم عرفة وغيرها، مع الأيام الباقية.",
    h1:"المناسبات الهجرية", today:"اليوم", left:"باقٍ {n} يوم", tomorrow:"غدًا", now:"اليوم", era:"هـ",
    note:"التواريخ بحسب تقويم أم القرى، وقد تختلف يومًا بحسب رؤية الهلال في بلدك. وتاريخ الإسراء والمعراج على المشهور، وفيه خلاف بين العلماء.",
    n:{ newYear:"رأس السنة الهجرية", ashura:"يوم عاشوراء", mawlid:"المولد النبوي", isra:"الإسراء والمعراج", shaban:"ليلة النصف من شعبان", ramadan:"بداية شهر رمضان", lastTen:"العشر الأواخر من رمضان", fitr:"عيد الفطر", dhulhijja:"بداية العشر من ذي الحجة", arafah:"يوم عرفة", adha:"عيد الأضحى" } },
  ku:{ title:"بۆنێن ئیسلامی و هجری – دەمێن وان یێن بێن", desc:"دەمێن بۆنێن هجری یێن بێن ب بەروارێ زایینی: سەری سالا هجری، عاشوورا، ڕەمەزان، هەردوو جەژن، ڕۆژا عەرەفێ و یێن دی، دگەل ڕۆژێن مای.",
    h1:"بۆنێن هجری", today:"ئەڤرۆ", left:"{n} ڕۆژ مانە", tomorrow:"سوبە", now:"ئەڤرۆ", era:"ھ",
    note:"بەروار ل دویڤ ژمێریارێ ئومولقورانە، و دبیت ب ڕۆژەکێ ل دویڤ دیتنا هیڤێ ل وەلاتێ تە جودا ببن. بەروارێ ئیسرا و میعراجێ یێ ناسکرییە، و زانا ل سەر جودانە.",
    n:{ newYear:"سەری سالا هجری", ashura:"ڕۆژا عاشوورا", mawlid:"مەولوودا پێغەمبەری", isra:"ئیسرا و میعراج", shaban:"شەڤا نیڤا شەعبانێ", ramadan:"دەستپێکا هەیڤا ڕەمەزانێ", lastTen:"دەهـ شەڤێن دوماهیێ یێن ڕەمەزانێ", fitr:"جەژنا ڕەمەزانێ", dhulhijja:"دەستپێکا دەهـ ڕۆژێن زولحیججێ", arafah:"ڕۆژا عەرەفێ", adha:"جەژنا قوربانێ" } },
  en:{ title:"Islamic and Hijri Occasions – Upcoming Dates", desc:"Upcoming Hijri occasions with their Gregorian dates: Islamic New Year, Ashura, Ramadan, both Eids, the Day of Arafah and more, with days remaining.",
    h1:"Hijri occasions", today:"Today", left:"in {n} days", tomorrow:"tomorrow", now:"today", era:"AH",
    note:"Dates follow the Umm al-Qura calendar and may differ by a day with local moon sighting. The date of Isra and Mi'raj is the commonly held one; scholars differ on it.",
    n:{ newYear:"Islamic New Year", ashura:"Day of Ashura", mawlid:"Mawlid (the Prophet's birth)", isra:"Isra and Mi'raj", shaban:"Mid-Sha'ban night", ramadan:"Start of Ramadan", lastTen:"Last ten nights of Ramadan", fitr:"Eid al-Fitr", dhulhijja:"First ten days of Dhul-Hijjah", arafah:"Day of Arafah", adha:"Eid al-Adha" } }
};
const KU_HIJRI = ["موحەڕەم","سەفەر","ڕەبیعولئەوەل","ڕەبیعولئاخر","جومادەلئەوەل","جومادەلئاخر","ڕەجەب","شەعبان","ڕەمەزان","شەووال","زولقەعدە","زولحیججە"];
const KU_MONTHS = ["کانوونا دووێ","شوبات","ئادار","نیسان","گولان","حزیران","تیرمەھ","تەباخ","ئەیلوول","چریا ئێکێ","چریا دووێ","کانوونا ئێکێ"];
const KU_WD = ["ئێکشەمب","دووشەمب","سێشەمب","چارشەمب","پێنجشەمب","ئەینی","شەمبی"];

const CSS = `
.oc .list{display:grid;gap:10px;margin-top:12px}
.oc .it{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--inner);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.oc .it.next{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}
.oc .it b{display:block;font-size:1rem;color:var(--title)}
.oc .it small{display:block;color:var(--muted);font-size:.82rem;margin-top:2px;line-height:1.6}
.oc .left{flex:none;text-align:center;min-width:72px;color:var(--gold);font-weight:800;font-size:.95rem}
.oc .today{font-size:1.02rem;line-height:1.9}
.oc .today b{color:var(--gold)}
.oc .muted{color:var(--muted);font-size:.82rem;line-height:1.8;margin-top:12px}`;

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const x = X[lang] || X.en;
  const crumbs = `<nav class="crumbs">${NAV.html(lang)}<span>›</span><b>${esc(x.h1)}</b></nav>`;
  const body = `${crumbs}<section class="hcard oc"><h1>${esc(x.h1)}</h1>
  <p class="today">${esc(x.today)}: <b id="oToday"></b></p>
  <div class="list" id="oList"></div>
  <p class="muted">${esc(x.note)}</p></section>`;
  const js = `(function(){
  var L=${JSON.stringify(lang)}, X=${JSON.stringify(x)}, LIST=${JSON.stringify(LIST)};
  var KU_H=${JSON.stringify(KU_HIJRI)}, KU_M=${JSON.stringify(KU_MONTHS)}, KU_W=${JSON.stringify(KU_WD)}, loc=(L==="ku"?"ar":L);
  var fmtH=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn",{day:"numeric",month:"numeric",year:"numeric",timeZone:"UTC"});
  function toH(dt){ var p={}; fmtH.formatToParts(dt).forEach(function(x){ p[x.type]=x.value; }); return {y:+p.year,m:+p.month,d:+p.day}; }
  function fromH(y,m,d){ var a=Date.UTC(622,6,19)+((y-1)*354.36707+(m-1)*29.5306+(d-1))*864e5; for(var o=-45;o<=45;o++){ var dt=new Date(a+o*864e5), h=toH(dt); if(h.y===y&&h.m===m&&h.d===d) return dt; } return null; }
  function hMonth(m){ if(L==="ku") return KU_H[m-1]; var dt=fromH(1447,m,1); try{ return new Intl.DateTimeFormat(loc+"-u-ca-islamic-umalqura-nu-latn",{month:"long",timeZone:"UTC"}).format(dt); }catch(e){ return String(m); } }
  function gText(dt){
    if(L==="ku") return KU_W[dt.getUTCDay()]+" "+dt.getUTCDate()+" "+KU_M[dt.getUTCMonth()]+" "+dt.getUTCFullYear();
    try{ return new Intl.DateTimeFormat(loc+"-u-ca-gregory-nu-latn",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(dt); }catch(e){ return dt.toISOString().slice(0,10); }
  }
  // العدد والمعدود بالعربية: يومان، 3–10 أيام، 11–99 يومًا، 100 يوم
  function arDays(n){ var r=n%100; return "بعد "+(n===2?"يومين":n+" "+(r>=3&&r<=10?"أيام":(r>=11&&r<=99?"يومًا":"يوم"))); }
  var now=new Date(), td=new Date(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())), th=toH(td);
  document.getElementById("oToday").textContent=th.d+" "+hMonth(th.m)+" "+th.y+" "+X.era;
  var items=[];
  [th.y, th.y+1].forEach(function(y){ LIST.forEach(function(o){ var dt=fromH(y,o[0],o[1]); if(dt && dt>=td) items.push({dt:dt,y:y,m:o[0],d:o[1],k:o[2]}); }); });
  items.sort(function(a,b){ return a.dt-b.dt; }); items=items.slice(0,LIST.length);
  var html="";
  items.forEach(function(it,i){
    var n=Math.round((it.dt-td)/864e5), left=n===0?X.now:(n===1?X.tomorrow:(L==="ar"?arDays(n):X.left.replace("{n}",n)));
    html+='<div class="it'+(i===0?' next':'')+'"><div><b>'+X.n[it.k]+'</b><small>'+it.d+" "+hMonth(it.m)+" "+it.y+" "+X.era+' · '+gText(it.dt)+'</small></div><div class="left">'+left+'</div></div>';
  });
  document.getElementById("oList").innerHTML=html;
})();`;
  send(res, page({ lang, title:x.title, desc:x.desc, path:"/occasions", body, css:CSS, js }));
};
