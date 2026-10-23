// حاسبة الزكاة: /ar/zakat /ku/zakat ...
// حساب زكاة المال (2.5%) وزكاة الفطر
const { LANGS } = require("./_core.js");
const { T, esc, page, send } = require("./_layout.js");
const NAV = require("./_nav.js");

const X = {
  ar:{ title:"حاسبة الزكاة", desc:"احسب زكاة مالك وزكاة الفطر بسهولة وسرعة.", h1:"حاسبة الزكاة", zMoney:"زكاة المال", zFitr:"زكاة الفطر", money:"المبلغ (بالعملة)", nisab:"النصاب (حد الزكاة)", nisabInfo:"حد أدنى تجب فيه الزكاة. الحد الحالي: ~15,000 درهم (سعر الذهب)", rate:"النسبة", calc:"احسب", result:"الزكاة المستحقة", people:"عدد الأشخاص", fPrice:"سعر الفطرة الواحدة", zero:"لم يبلغ النصاب", note:"ملاحظة: هذا حساب تقريبي. تأكد من استشارة عالم شرعي لحسابك الفعلي.", toCome:"نقدًا أو طعامًا (دقيق أو أرز)" },
  ku:{ title:"حاسبەری زەکات", desc:"بە ئاسانی زەکاتی پولی خۆت و فیتری بژمێرە.", h1:"حاسبەری زەکات", zMoney:"زەکاتی پول", zFitr:"زەکاتی فیتری", money:"بڕ (بە دراو)", nisab:"نیساب (کمتریە زەکات)", nisabInfo:"دەبێتە بۆ پولی کەمتر نەبێت. نیساب ئێستا: ~15,000 درھم (نرخی زێڕ)", rate:"ڕێژە", calc:"بژمێرە", result:"زەکاتی بدەستێ", people:"ژمارەی کەسان", fPrice:"بڕی فیتریەکی یەک کەس", zero:"نیساب نەگێیشتووە", note:"تێبینی: ئەم حاسبینە نزیکمانە. دڕستیا خۆت پرسیارە لە عالیمێک بکە.", toCome:"نقد یان خۆراک (آرد یان برنج)" },
  en:{ title:"Zakat Calculator", desc:"Calculate your Zakat al-Mal and Zakat al-Fitr easily.", h1:"Zakat Calculator", zMoney:"Zakat al-Mal", zFitr:"Zakat al-Fitr", money:"Amount (in currency)", nisab:"Nisab (minimum threshold)", nisabInfo:"Minimum amount for Zakat obligation. Current nisab: ~15,000 AED (gold price)", rate:"Rate", calc:"Calculate", result:"Zakat Due", people:"Number of people", fPrice:"Fitr per person", zero:"Below nisab", note:"Note: This is an approximate calculation. Consult a Shariah scholar for your actual calculation.", toCome:"In cash or food (flour or rice)" }
};

const CSS = `
.zk{display:grid;gap:16px}
.zk .zcard{background:var(--inner);border:1px solid var(--line);border-radius:14px;padding:20px}
.zk .zcard h2{font-size:1.15rem;color:var(--gold);margin:0 0 14px;font-weight:600}
.zk label{display:block;color:var(--muted);font-size:.8rem;margin:0 0 4px}
.zk input,.zk select{width:100%;box-sizing:border-box;background:var(--outer);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px;font-family:inherit;font-size:1rem}
.zk input:focus,.zk select:focus{outline:0;border-color:var(--gold)}
.zk .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.zk .row3{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:8px}
.zk .full{grid-column:1/-1}
.zk .calc{width:100%;background:var(--green);color:#fff;border:1px solid var(--green);border-radius:10px;padding:10px;font-family:inherit;font-size:1rem;font-weight:600;cursor:pointer;margin-top:12px}
.zk .out{margin-top:12px;min-height:2.4em;font-size:1.3rem;line-height:1.8;color:var(--title);font-weight:700}
.zk .out.zero{color:var(--muted);font-size:1rem;font-weight:400}
.zk .help{color:var(--muted);font-size:.8rem;margin-top:6px}`;

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const x = X[lang] || X.en, t = T[lang];
  const crumbs = `<nav class="crumbs">${NAV.html(lang)}<span>›</span><b>${esc(x.h1)}</b></nav>`;
  const body = `${crumbs}<div class="zk">
  <section class="zcard"><h2>${esc(x.zMoney)}</h2>
    <div class="row"><div><label for="zMoney">${esc(x.money)}</label><input id="zMoney" type="number" inputmode="decimal" placeholder="0" dir="ltr"></div>
    <div><label for="zNisab">${esc(x.nisab)}</label><input id="zNisab" type="number" value="15000" inputmode="decimal" dir="ltr"></div></div>
    <p class="help">${esc(x.nisabInfo)}</p>
    <button class="calc" id="calcZakat">${esc(x.calc)}</button>
    <div class="out" id="zakResult" role="status"></div></section>

  <section class="zcard"><h2>${esc(x.zFitr)}</h2>
    <div class="row"><div><label for="fitrPeople">${esc(x.people)}</label><input id="fitrPeople" type="number" value="1" min="1" inputmode="numeric" dir="ltr"></div>
    <div><label for="fitrPrice">${esc(x.fPrice)}</label><input id="fitrPrice" type="number" value="3" step="0.5" inputmode="decimal" placeholder="3" dir="ltr"></div></div>
    <p class="help">${esc(x.toCome)}</p>
    <button class="calc" id="calcFitr">${esc(x.calc)}</button>
    <div class="out" id="fitrResult" role="status"></div></section>

  <p class="help" style="grid-column:1/-1">${esc(x.note)}</p></div>`;

  const js = `(function(){
  var L=${JSON.stringify(lang)}, X=${JSON.stringify({ result:x.result, zero:x.zero })};
  var RATE=2.5;

  function fmt(n){
    return new Intl.NumberFormat(L==='ku'?'ar':L,{minimumFractionDigits:0,maximumFractionDigits:2}).format(n);
  }

  document.getElementById('calcZakat').addEventListener('click',function(){
    var m=parseFloat(document.getElementById('zMoney').value)||0;
    var n=parseFloat(document.getElementById('zNisab').value)||15000;
    var out=document.getElementById('zakResult');
    if(m<n){out.textContent=X.zero;out.className='out zero'}else{
      var z=m*(RATE/100);
      out.textContent=X.result+': '+fmt(z);out.className='out'
    }
  });

  document.getElementById('calcFitr').addEventListener('click',function(){
    var p=parseInt(document.getElementById('fitrPeople').value)||1;
    var pr=parseFloat(document.getElementById('fitrPrice').value)||3;
    var f=p*pr;
    var out=document.getElementById('fitrResult');
    out.textContent=X.result+': '+fmt(f);out.className='out'
  });
})();`;

  return send(res, page({lang, title:x.title, desc:x.desc, path:"/zakat", body, css:CSS, js}));
};
