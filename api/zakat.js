// حاسبة الزكاة: /ar/zakat /ku/zakat ...
// النصاب = 85 غرامًا من الذهب × سعر الغرام الذي يكتبه المستخدم بعملته، والزكاة ربع العشر (2.5%)
// الحساب كله في المتصفح، ولا يُرسل شيء إلى الخادم
const { LANGS } = require("./_core.js");
const { T, esc, page, send } = require("./_layout.js");
const NAV = require("./_nav.js");

const X = {
  ar:{ title:"حاسبة الزكاة – زكاة المال وزكاة الفطر", desc:"احسب زكاة مالك بنصاب الذهب (85 غرامًا) بعملتك، واحسب زكاة الفطر لأهل بيتك.",
    h1:"حاسبة الزكاة", mal:"زكاة المال", fitr:"زكاة الفطر",
    gold:"سعر غرام الذهب (عيار 24) بعملتك", cash:"النقود والمدخرات", assets:"قيمة الذهب والفضة وعروض التجارة (إن وُجدت)", debts:"الديون الحالّة عليك (تُطرح)",
    go:"احسب", nisabIs:"النصاب", net:"المال الخاضع للزكاة", due:"الزكاة الواجبة", below:"مالك لم يبلغ النصاب، فلا زكاة عليك فيه.", needGold:"اكتب سعر غرام الذهب أولًا.",
    hawl:"تجب الزكاة إذا بلغ المال النصاب وحال عليه حول هجري كامل.",
    persons:"عدد الأفراد (أنت ومن تعول)", perVal:"قيمة الفطرة عن الفرد بعملتك", perHelp:"تعلنها الجهة الدينية في بلدك كل عام.",
    food:"أو طعامًا: صاعٌ عن كل فرد، نحو 2.5 إلى 3 كغ من قوت البلد (قمح، أرز، تمر…)", fitrDue:"زكاة الفطر", kg:"كغ تقريبًا",
    note:"الحساب تقريبي للمساعدة. ولأحوال خاصة (كالأسهم والديون المؤجلة) اسأل عالمًا موثوقًا." },
  ku:{ title:"هژمارتنا زەکاتێ – زەکاتا مالی و سەرفترە", desc:"زەکاتا مالێ خۆ ب نیسابا زێڕی (85 گرام) ب دراڤێ خۆ بهژمێرە، و سەرفترا مالا خۆ.",
    h1:"هژمارتنا زەکاتێ", mal:"زەکاتا مالی", fitr:"سەرفترە (زەکاتا فترێ)",
    gold:"بهایێ گرامەکا زێڕی (عەیار 24) ب دراڤێ تە", cash:"پارە و پاشەکەفت", assets:"بهایێ زێڕ و زیڤ و کەلوپەلێن بازرگانیێ (ئەگەر هەبن)", debts:"قەرێن ل سەر تە (دێ هێنە کێمکرن)",
    go:"بهژمێرە", nisabIs:"نیساب", net:"مالێ زەکات دکەڤیتە سەر", due:"زەکاتا ل سەر تە", below:"مالێ تە نەگەهشتیە نیسابێ، زەکات ل سەر تە نینە.", needGold:"پێشی بهایێ گرامەکا زێڕی بنڤیسە.",
    hawl:"زەکات دکەڤیتە سەر تە دەمێ مال دگەهیتە نیسابێ و سالەکا هجری یا تەمام ب سەر دا دبۆریت.",
    persons:"ژمارا کەسان (تو و ئەوێن تو خودان دکەی)", perVal:"بهایێ سەرفترا ئێک کەسی ب دراڤێ تە", perHelp:"لایەنێ ئایینی ل وەلاتێ تە هەر سال ڕادگەهینیت.",
    food:"یان خوارن: ساعەک بۆ هەر کەسەکی، نێزیکی 2.5 تا 3 کیلۆ ژ خوارنا وەلاتی (گەنم، برنج، خورما…)", fitrDue:"سەرفترە", kg:"کیلۆ ب نێزیکی",
    note:"ئەڤ هژمارتنە بۆ هاریکاریێ یە و نێزیکە. بۆ حالەتێن تایبەت (وەک پشکێن کۆمپانیان و قەرێن دەرەنگ) پسیارا زانایەکێ جهێ باوەریێ بکە." },
  en:{ title:"Zakat Calculator – Zakat al-Mal and Zakat al-Fitr", desc:"Calculate your Zakat using the gold nisab (85 g) in your own currency, and the Zakat al-Fitr for your household.",
    h1:"Zakat calculator", mal:"Zakat on wealth", fitr:"Zakat al-Fitr",
    gold:"Price of 1 g of gold (24k) in your currency", cash:"Cash and savings", assets:"Value of gold, silver and trade goods (if any)", debts:"Debts currently due (deducted)",
    go:"Calculate", nisabIs:"Nisab", net:"Zakatable wealth", due:"Zakat due", below:"Your wealth is below the nisab, so no Zakat is due on it.", needGold:"Enter the price of a gram of gold first.",
    hawl:"Zakat is due when wealth reaches the nisab and a full Hijri year passes over it.",
    persons:"Number of people (you and your dependants)", perVal:"Fitr amount per person in your currency", perHelp:"Announced yearly by the religious authority in your country.",
    food:"Or in food: one sa' per person, about 2.5–3 kg of the local staple (wheat, rice, dates…)", fitrDue:"Zakat al-Fitr", kg:"kg approx.",
    note:"This is an approximate aid. For special cases (shares, deferred debts) ask a trusted scholar." }
};

const CSS = `
.zk{display:grid;gap:16px}
.zk h2{font-size:1.05rem;color:var(--gold);margin:0 0 12px}
.zk label{display:block;color:var(--muted);font-size:.8rem;margin:10px 0 4px}
.zk input{width:100%;box-sizing:border-box;background:var(--inner);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px;font-family:inherit;font-size:1rem}
.zk input:focus{outline:0;border-color:var(--gold)}
.zk .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media (max-width:520px){ .zk .row{grid-template-columns:1fr} }
.zk .go{margin-top:14px;width:100%;background:var(--green);color:#fff;border:1px solid var(--green);border-radius:10px;padding:10px;font-family:inherit;font-size:1rem;font-weight:600;cursor:pointer}
.zk .out{margin-top:14px;line-height:1.9}
.zk .out .big{font-size:1.5rem;font-weight:800;color:var(--gold)}
.zk .out .err{color:#d0443c}
.zk .muted{color:var(--muted);font-size:.85rem;margin-top:8px}`;

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const x = X[lang] || X.en;
  const num = (id, lbl) => `<div><label for="${id}">${esc(lbl)}</label><input id="${id}" type="number" min="0" step="any" inputmode="decimal" dir="ltr"></div>`;
  const crumbs = `<nav class="crumbs">${NAV.html(lang)}<span>›</span><b>${esc(x.h1)}</b></nav>`;
  const body = `${crumbs}<div class="zk">
  <section class="hcard"><h1>${esc(x.h1)}</h1><h2>${esc(x.mal)}</h2>
    ${num("zGold", x.gold)}
    <div class="row">${num("zCash", x.cash)}${num("zAssets", x.assets)}</div>
    ${num("zDebts", x.debts)}
    <button class="go" type="button" id="zGo">${esc(x.go)}</button>
    <div class="out" id="zOut" role="status"></div>
    <p class="muted">${esc(x.hawl)}</p></section>
  <section class="hcard"><h2>${esc(x.fitr)}</h2>
    <div class="row">${num("fN", x.persons)}${num("fV", x.perVal)}</div>
    <p class="muted">${esc(x.perHelp)}</p>
    <button class="go" type="button" id="fGo">${esc(x.go)}</button>
    <div class="out" id="fOut" role="status"></div>
    <p class="muted">${esc(x.food)}</p></section>
  <p class="muted">${esc(x.note)}</p></div>`;
  const js = `(function(){
  var L=${JSON.stringify(lang)}, X=${JSON.stringify({ nisabIs:x.nisabIs, net:x.net, due:x.due, below:x.below, needGold:x.needGold, fitrDue:x.fitrDue, kg:x.kg })};
  var nf=new Intl.NumberFormat((L==="ku"?"ar":L)+"-u-nu-latn",{maximumFractionDigits:2});
  function v(id){ var n=parseFloat(document.getElementById(id).value); return isFinite(n)&&n>0?n:0; }
  function line(k,val,big){ return "<div>"+k+": "+(big?'<span class="big">'+val+"</span>":"<b>"+val+"</b>")+"</div>"; }
  document.getElementById("fN").value=1;
  document.getElementById("zGo").onclick=function(){
    var o=document.getElementById("zOut"), g=v("zGold");
    if(!g){ o.innerHTML='<span class="err">'+X.needGold+"</span>"; return; }
    var nis=85*g, net=Math.max(0, v("zCash")+v("zAssets")-v("zDebts"));
    var h=line(X.nisabIs+" (85 g)", nf.format(nis))+line(X.net, nf.format(net));
    h+= net>=nis ? line(X.due, nf.format(net*0.025), true) : "<div>"+X.below+"</div>";
    o.innerHTML=h;
  };
  document.getElementById("fGo").onclick=function(){
    var n=Math.max(1, Math.round(v("fN"))||1), p=v("fV"), o=document.getElementById("fOut");
    var h= p ? line(X.fitrDue, nf.format(n*p), true) : "";
    h+="<div>"+nf.format(n*2.5)+" – "+nf.format(n*3)+" "+X.kg+"</div>";
    o.innerHTML=h;
  };
})();`;
  send(res, page({ lang, title:x.title, desc:x.desc, path:"/zakat", body, css:CSS, js }));
};
