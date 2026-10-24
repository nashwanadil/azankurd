// صفحة الأذكار: /ar/azkar /ku/azkar ...
// النصوص من «حصن المسلم» وأصوله، بالعربية لكل اللغات (تُقرأ بالعربية)، مع العدد والمصدر وعدّاد باللمس
const { LANGS } = require("./_core.js");
const { esc, page, send } = require("./_layout.js");
const NAV = require("./_nav.js");

const X = {
  ar:{ title:"الأذكار – أذكار الصلاة والصباح والمساء والنوم", desc:"أذكار ما بعد الصلاة، والصباح والمساء، والنوم والاستيقاظ، والأذان والمسجد، من حصن المسلم مع العدد والمصدر وعدّاد.",
    h1:"الأذكار", intro:"اضغط على العدد بعد كل مرة ليُنقِص، حتى يتمّ الذكر.", src:"المصدر", times:"مرة", times2:"مرات", done:"تمّ", reset:"إعادة العدّ",
    tabs:{ prayer:"بعد الصلاة", morning:"الصباح", evening:"المساء", sleep:"النوم", wake:"الاستيقاظ", adhan:"الأذان والمسجد" },
    books:{ b:"البخاري", m:"مسلم", d:"أبو داود", t:"الترمذي", n:"النسائي", h:"الحاكم" }, and:"و" },
  ku:{ title:"زکر و دوعا – پشتی نڤێژێ، سپێدە و ئێڤار، نڤستن", desc:"زکرێن پشتی نڤێژێ، سپێدە و ئێڤار، نڤستن و هشیاربوون، بانگ و مزگەفت، ژ «حصن المسلم» دگەل ژمارە و ژێدەر.",
    h1:"زکر و دوعا", intro:"پشتی هەر جارەکێ ل سەر ژمارێ بدە دا کێم ببیت، هەتا زکر تەمام دبیت.", src:"ژێدەر", times:"جار", times2:"جار", done:"تەمام بوو", reset:"دیسا بژمێرە",
    tabs:{ prayer:"پشتی نڤێژێ", morning:"سپێدە", evening:"ئێڤار", sleep:"نڤستن", wake:"هشیاربوون", adhan:"بانگ و مزگەفت" },
    books:{ b:"بوخاری", m:"موسلم", d:"ئەبوو داوود", t:"تیرمزی", n:"نەسائی", h:"حاکم" }, and:"و" },
  en:{ title:"Adhkar – After Prayer, Morning, Evening and Sleep", desc:"Remembrances after prayer, morning and evening, sleep and waking, adhan and mosque — from Hisn al-Muslim with counts, sources and a counter.",
    h1:"Adhkar", intro:"Tap the counter after each recitation until the remembrance is complete.", src:"Source", times:"time", times2:"times", done:"Done", reset:"Reset",
    tabs:{ prayer:"After prayer", morning:"Morning", evening:"Evening", sleep:"Sleep", wake:"Waking", adhan:"Adhan & mosque" },
    books:{ b:"Bukhari", m:"Muslim", d:"Abu Dawud", t:"Tirmidhi", n:"Nasa'i", h:"Al-Hakim" }, and:"&" }
};

// نصوص القرآن
const KURSI = "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ";
const IKHLAS = "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ";
const FALAQ = "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ";
const NAS = "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ";
const BAQARA = "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ";
// يرقّم الآيات بعلامة ﴿١﴾ بدل الفاصل ۝
const AR_DIG = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
const ayat = (txt, start = 1) => txt.split(" ۝ ").map((a, i) => a + " ﴿" + AR_DIG(start + i) + "﴾").join(" ");
const MUAWWIDHAT = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n" + ayat(IKHLAS) + "\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n" + ayat(FALAQ) + "\n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n" + ayat(NAS);
const TAHLIL = "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ";

// t: النص، n: العدد، s: المصدر [[الكتاب، الرقم]...]، q: آية قرآنية (يُعرض بخط أكبر)، h: تنبيه قصير بالعربية
const SAYYID = { t:"اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", n:1, s:[["b",6306]], h:"سيّد الاستغفار" };
const BISMILLAH3 = { t:"بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ", n:3, s:[["d",5088],["t",3388]] };
const RADITU = { t:"رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا", n:3, s:[["d",5072]] };
const YAHAYY = { t:"يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ", n:1, s:[["h","1/545"]] };
const SUBHAN100 = { t:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", n:100, s:[["m",2692]] };
const KURSI_I = { t:KURSI + " ﴿٢٥٥﴾", n:1, q:1, h:"آية الكرسي" };
const MUAW3 = { t:MUAWWIDHAT, n:3, q:1, s:[["d",5082],["t",3575]], h:"الإخلاص والمعوّذتان" };

const AZ = {
  prayer:[
    { t:"أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ\nاللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", n:1, s:[["m",591]] },
    { t:TAHLIL + "، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ", n:1, s:[["b",844],["m",593]] },
    { t:"سُبْحَانَ اللَّهِ", n:33, s:[["m",597]] },
    { t:"الْحَمْدُ لِلَّهِ", n:33, s:[["m",597]] },
    { t:"اللَّهُ أَكْبَرُ", n:33, s:[["m",597]] },
    { t:TAHLIL, n:1, s:[["m",597]], h:"تمام المئة" },
    { t:KURSI + " ﴿٢٥٥﴾", n:1, q:1, s:[["n","عمل اليوم والليلة 100"]], h:"آية الكرسي" },
    { t:MUAWWIDHAT, n:1, q:1, s:[["d",1523],["t",2903]], h:"بعد كل صلاة مرة، وبعد الفجر والمغرب ثلاثًا" }
  ],
  morning:[
    KURSI_I, MUAW3,
    { t:"أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، " + TAHLIL + "، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", n:1, s:[["m",2723]] },
    { t:"اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", n:1, s:[["t",3391]] },
    SAYYID, BISMILLAH3, RADITU, YAHAYY,
    { t:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", n:3, s:[["m",2726]] },
    SUBHAN100
  ],
  evening:[
    SAYYID, KURSI_I, MUAW3,
    { t:"أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، " + TAHLIL + "، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ", n:1, s:[["m",2723]] },
    { t:"اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", n:1, s:[["t",3391]] },
    BISMILLAH3, RADITU, YAHAYY,
    { t:"أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", n:3, s:[["m",2709]] },
    SUBHAN100
  ],
  sleep:[
    { t:MUAWWIDHAT, n:3, q:1, s:[["b",5017]], h:"يجمع كفّيه وينفث فيهما ويقرأ، ثم يمسح بهما ما استطاع من جسده" },
    { t:KURSI + " ﴿٢٥٥﴾", n:1, q:1, s:[["b",2311]], h:"آية الكرسي" },
    { t:ayat(BAQARA, 285), n:1, q:1, s:[["b",4008],["m",807]], h:"آخر آيتين من سورة البقرة" },
    { t:"بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ", n:1, s:[["b",6320],["m",2714]] },
    { t:"اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", n:3, s:[["d",5045],["t",3398]] },
    { t:"بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", n:1, s:[["b",6324]] },
    { t:"سُبْحَانَ اللَّهِ", n:33, s:[["b",3705],["m",2727]] },
    { t:"الْحَمْدُ لِلَّهِ", n:33, s:[["b",3705],["m",2727]] },
    { t:"اللَّهُ أَكْبَرُ", n:34, s:[["b",3705],["m",2727]] }
  ],
  wake:[
    { t:"الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا، وَإِلَيْهِ النُّشُورُ", n:1, s:[["b",6312]] },
    { t:"الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ", n:1, s:[["t",3401]] }
  ],
  adhan:[
    { t:"يقول مثل ما يقول المؤذّن، إلا في «حيَّ على الصلاة» و«حيَّ على الفلاح» فيقول: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", n:1, s:[["b",611],["m",385]], h:"عند سماع الأذان" },
    { t:"اللَّهُمَّ رَبَّ هَٰذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ", n:1, s:[["b",614]], h:"بعد الأذان، بعد الصلاة على النبي ﷺ" },
    { t:"اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", n:1, s:[["m",713]], h:"عند دخول المسجد" },
    { t:"اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", n:1, s:[["m",713]], h:"عند الخروج من المسجد" }
  ]
};
const ORDER = ["prayer","morning","evening","sleep","wake","adhan"];

const CSS = `
.ak .tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}
.ak .tab{padding:7px 14px;background:var(--card);color:var(--text);border:1px solid var(--line);border-radius:999px;cursor:pointer;font-family:inherit;font-size:.9rem}
.ak .tab[aria-selected="true"]{background:var(--green);color:#fff;border-color:var(--green)}
.ak .intro{color:var(--muted);font-size:.85rem;margin:0 0 12px}
.ak .list{display:grid;gap:12px}
.ak .list[hidden]{display:none}
.ak .item{background:var(--card);border:1px solid var(--line);border-inline-start:3px solid var(--gold);border-radius:14px;padding:16px}
.ak .item.done{opacity:.55}
.ak .h{color:var(--gold);font-size:.85rem;font-weight:600;margin:0 0 6px}
.ak .tx{font-weight:400;direction:rtl;text-align:right;font-size:1.2rem;line-height:2.1;color:var(--title);white-space:pre-line;font-family:"Amiri","Noto Naskh Arabic","Traditional Arabic",serif}
.ak .tx.q{font-size:1.3rem}
.ak .ft{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;flex-wrap:wrap}
.ak .src{color:var(--muted);font-size:.8rem}
.ak .cnt{min-width:64px;padding:7px 14px;border-radius:999px;border:1px solid var(--gold);background:var(--inner);color:var(--gold);font-family:inherit;font-weight:800;font-size:1.05rem;cursor:pointer;font-variant-numeric:tabular-nums}
.ak .item.done .cnt{background:var(--gold);color:#fff}
.ak .reset{margin-top:14px;background:none;border:1px solid var(--line);color:var(--muted);border-radius:999px;padding:7px 16px;font-family:inherit;cursor:pointer}`;

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const x = X[lang] || X.en;
  const srcTxt = s => (s || []).map(([b, n]) => x.books[b] + " " + n).join(" " + x.and + " ");
  const tabs = ORDER.map((k, i) => `<button class="tab" type="button" role="tab" data-k="${k}" aria-selected="${i ? "false" : "true"}">${esc(x.tabs[k])}</button>`).join("");
  const lists = ORDER.map((k, i) => `<div class="list" data-k="${k}"${i ? " hidden" : ""}>` + AZ[k].map(a =>
    `<article class="item" data-n="${a.n}">${a.h ? `<p class="h" dir="rtl">${esc(a.h)}</p>` : ""}<p class="tx${a.q ? " q" : ""}">${esc(a.t)}</p>
    <div class="ft"><span class="src">${a.s ? esc(x.src + ": " + srcTxt(a.s)) : ""}</span><button class="cnt" type="button" aria-label="${a.n}">${a.n}</button></div></article>`).join("") + `</div>`).join("");
  const crumbs = `<nav class="crumbs">${NAV.html(lang)}<span>›</span><b>${esc(x.h1)}</b></nav>`;
  const body = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400&display=swap">${crumbs}<div class="ak"><section class="hcard"><h1>${esc(x.h1)}</h1><p class="intro">${esc(x.intro)}</p>
  <div class="tabs" role="tablist">${tabs}</div>${lists}<button class="reset" type="button" id="akReset">${esc(x.reset)}</button></section></div>`;
  const js = `(function(){
  var DONE=${JSON.stringify(x.done)};
  var tabs=[].slice.call(document.querySelectorAll(".ak .tab")), lists=[].slice.call(document.querySelectorAll(".ak .list"));
  function show(k){ tabs.forEach(function(t){ t.setAttribute("aria-selected", t.dataset.k===k?"true":"false"); }); lists.forEach(function(l){ l.hidden = l.dataset.k!==k; }); try{ localStorage.setItem("azkarTab",k); }catch(e){} }
  tabs.forEach(function(t){ t.onclick=function(){ show(t.dataset.k); }; });
  var h=new Date().getHours(), saved=null; try{ saved=localStorage.getItem("azkarTab"); }catch(e){}
  if(location.hash && document.querySelector('.ak .list[data-k="'+location.hash.slice(1)+'"]')) show(location.hash.slice(1));
  else if(saved && document.querySelector('.ak .list[data-k="'+saved+'"]')) show(saved);
  else show(h>=4&&h<12?"morning":(h>=15&&h<21?"evening":"prayer"));
  function reset(){ [].forEach.call(document.querySelectorAll(".ak .item"),function(it){ it.classList.remove("done"); var b=it.querySelector(".cnt"); b.textContent=it.dataset.n; b.dataset.left=it.dataset.n; }); }
  [].forEach.call(document.querySelectorAll(".ak .cnt"),function(b){
    b.dataset.left=b.textContent;
    b.onclick=function(){ var it=b.closest(".item"), n=+b.dataset.left; if(n<=0) return; n--; b.dataset.left=n; b.textContent=n?n:DONE; if(!n) it.classList.add("done"); if(navigator.vibrate) try{ navigator.vibrate(n?15:60); }catch(e){} };
  });
  document.getElementById("akReset").onclick=reset;
})();`;
  send(res, page({ lang, title:x.title, desc:x.desc, path:"/azkar", body, css:CSS, js }));
};
