// تتبع الرحلات الجوية: موقع الطائرة الحي ومسارها، والطائرات القادمة إلى أربيل
// البيانات مجانية ومفتوحة من شبكات ADS-B (adsb.lol ثم airplanes.live احتياطًا)، والمسار من adsbdb
//   /api/flight?q=IA231   رحلة واحدة برقمها أو بنداء الطائرة (callsign)
//   /api/flight?near=1    الطائرات حول أربيل (250 ميلًا بحريًا) مع وجهة كل منها إن عُرفت
const SITE = "https://flight.nashwanadil.com";

const EBL = { lat:36.2376, lon:43.9632 };
// رمز الشركة في رقم الرحلة (IATA) ← رمزها في نداء الطائرة (ICAO): IA231 ← IAW231
const AIRLINES = {
  IA:"IAW", IF:"FBA", TK:"THY", VF:"TKJ", PC:"PGT", XQ:"SXS", QR:"QTR", EK:"UAE", FZ:"FDB", EY:"ETD",
  G9:"ABY", RJ:"RJA", ME:"MEA", GF:"GFA", SV:"SVA", XY:"KNE", KU:"KAC", J9:"JZR", WY:"OMA", OS:"AUA",
  LH:"DLH", EW:"EWG", W6:"WZZ", "6Q":"SAW", IR:"IRA", W5:"IRM", J2:"AHY", MS:"MSR", SM:"MSC", NE:"NMA",
  LX:"SWR", KL:"KLM", AF:"AFR", BA:"BAW", SK:"SAS", A3:"AEE", PS:"AUI", "5W":"WAZ", OV:"OMS", AT:"RAM"
};

async function getJSON(u, opt = {}){
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 6000);
  try{
    const r = await fetch(u, { ...opt, signal:ctl.signal, headers:{ "User-Agent":`AzanKurd (${SITE})`, ...(opt.headers || {}) } });
    return r.ok ? await r.json() : null;
  }catch(e){ return null; } finally { clearTimeout(tm); }
}
// نفس الصيغة في المصدرين؛ إن تعطل الأول نسأل الثاني
async function adsb(path){
  for(const base of ["https://api.adsb.lol/v2", "https://api.airplanes.live/v2"]){
    const j = await getJSON(base + path);
    if(j && Array.isArray(j.ac)) return j;
  }
  return null;
}

// نداءات محتملة لما كتبه الزائر: «IA 231» ← IAW231 ثم IA231
function callsigns(q){
  const s = String(q || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = s.match(/^([A-Z0-9]{2})([0-9]{1,4}[A-Z]?)$/);
  const out = [];
  if(m && AIRLINES[m[1]]) out.push(AIRLINES[m[1]] + m[2].replace(/^0+(?=\d)/, ""));
  if(/^[A-Z0-9]{3,8}$/.test(s)) out.push(s);
  return [...new Set(out)];
}

const airport = a => a && {
  iata:a.iata_code || a.iata || "", icao:a.icao_code || a.icao || "", name:a.name || "",
  city:a.municipality || a.location || "", country:a.country_name || a.countryiso2 || "",
  lat:+a.latitude || +a.lat || null, lon:+a.longitude || +a.lon || null
};
async function route(cs){
  const j = await getJSON(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(cs)}`);
  const f = j && j.response && j.response.flightroute;
  if(!f) return null;
  return { airline:f.airline ? f.airline.name : "", flight:f.callsign_iata || "", origin:airport(f.origin), destination:airport(f.destination) };
}
// وجهات عدة طائرات بطلب واحد (للقائمة حول أربيل)
async function routes(list){
  if(!list.length) return {};
  const j = await getJSON("https://api.adsb.lol/api/0/routeset", {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ planes:list.map(a => ({ callsign:a.callsign, lat:a.lat, lng:a.lon })) })
  });
  const out = {};
  for(const r of Array.isArray(j) ? j : []){
    const ap = r.airports || [];
    if(r.callsign && ap.length >= 2 && r.plausible !== false) out[r.callsign] = { origin:airport(ap[0]), destination:airport(ap[ap.length - 1]) };
  }
  return out;
}

const plane = (a, now) => ({
  callsign:String(a.flight || "").trim(), hex:a.hex, reg:a.r || "", type:a.t || "", desc:a.desc || "",
  lat:a.lat ?? (a.lastPosition && a.lastPosition.lat), lon:a.lon ?? (a.lastPosition && a.lastPosition.lon),
  ground:a.alt_baro === "ground", alt:typeof a.alt_baro === "number" ? a.alt_baro : (a.alt_geom ?? null),
  gs:a.gs ?? null, track:a.track ?? a.true_heading ?? null, vr:a.baro_rate ?? a.geom_rate ?? null,
  squawk:a.squawk || "", seen:Math.round(a.seen_pos ?? a.seen ?? 0), at:now
});

module.exports = async (req, res) => {
  const u = new URL(req.url, SITE);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const send = (o, code = 200, age = 10) => {
    res.statusCode = code;
    res.setHeader("Cache-Control", `public, s-maxage=${age}, stale-while-revalidate=${age}`);
    res.end(JSON.stringify(o));
  };

  if(u.searchParams.get("near")){
    const j = await adsb(`/point/${EBL.lat}/${EBL.lon}/250`);
    if(!j) return send({ error:"source" }, 502, 5);
    const list = j.ac.map(a => plane(a, j.now)).filter(a => a.callsign && a.lat != null);
    const rt = await routes(list.slice(0, 120));
    for(const a of list) if(rt[a.callsign]) a.route = rt[a.callsign];
    return send({ ac:list, now:j.now });
  }

  const cands = callsigns(u.searchParams.get("q"));
  if(!cands.length) return send({ error:"query" }, 400, 60);
  for(const cs of cands){
    const j = await adsb(`/callsign/${cs}`);
    if(j === null) return send({ error:"source" }, 502, 5);
    const a = j.ac.find(x => x.lat != null || x.lastPosition) || j.ac[0];
    if(a){
      const p = plane(a, j.now);
      p.route = await route(p.callsign || cs);
      return send({ found:true, tried:cands, flight:p });
    }
  }
  send({ found:false, tried:cands }, 200, 20);
};

module.exports.callsigns = callsigns;
