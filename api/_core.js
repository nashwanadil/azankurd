// الأدوات المشتركة لصفحات المدن: المدن، طرق الحساب، حساب المواقيت
const adhan = require("adhan");
const DATA = require("./_cities.json");

const LANGS = ["ar","ku","fa","de","nl","da","en","fr","tr","ur","bs","id","ms","bn","ps","ha","sw","es","it","sv","ru"];   // بترتيب قائمة اللغات
const SITE = "https://azankurd.com";

// المدن: [slug, name, cc, lat, lng, tzIndex, pop]
const CITIES = DATA.c;
const BY_SLUG = new Map(CITIES.map((c, i) => [c[0], i]));
const cityAt = i => {
  const c = CITIES[i];
  return { slug:c[0], name:c[1], cc:c[2], lat:c[3], lng:c[4], tz:DATA.tz[c[5]], pop:c[6], gid:c[7] || 0 };
};
const findCity = slug => BY_SLUG.has(slug) ? cityAt(BY_SLUG.get(slug)) : null;

function nearest(lat, lng){
  let best = -1, bd = Infinity;
  const k = Math.cos(lat * Math.PI / 180);
  for(let i = 0; i < CITIES.length; i++){
    const c = CITIES[i], dx = (c[4] - lng) * k, dy = c[3] - lat, d = dx*dx + dy*dy;
    if(d < bd){ bd = d; best = i; }
  }
  return best >= 0 ? cityAt(best) : null;
}

function nearby(city, n = 8){
  const k = Math.cos(city.lat * Math.PI / 180), list = [];
  for(let i = 0; i < CITIES.length; i++){
    const c = CITIES[i];
    if(c[0] === city.slug) continue;
    const dx = (c[4] - city.lng) * k * 111, dy = (c[3] - city.lat) * 111, d = Math.sqrt(dx*dx + dy*dy);
    if(d < 300) list.push({ i, d, pop:c[6] });
  }
  list.sort((a, b) => a.d - b.d);
  return list.slice(0, 20).sort((a, b) => b.pop - a.pop).slice(0, n).map(x => cityAt(x.i));
}

// نفس اختيار طريقة الحساب في الصفحة الرئيسية
const METHODS = {
  3:"Muslim World League",4:"Umm Al-Qura, Makkah",5:"Egyptian General Authority",8:"Gulf Region",
  9:"Kuwait",10:"Qatar",23:"Jordan (Awqaf)",13:"Diyanet, Türkiye",7:"Tehran (Geophysics)",
  1:"Karachi (Islamic Sciences)",2:"ISNA (North America)",12:"UOIF (France / Europe)",22:"Lisboa (Portugal)",
  14:"Russia (Muslim Spiritual Admin.)",18:"Tunisia",19:"Algeria",21:"Morocco",
  11:"Singapore (MUIS)",17:"Malaysia (JAKIM)",20:"Indonesia (KEMENAG)",15:"Moonsighting Committee"
};
function autoMethod(tz){
  const z = tz || "";
  const map = {
    "Europe/Istanbul":13,"Asia/Riyadh":4,"Asia/Aden":4,"Asia/Kuwait":9,"Asia/Qatar":10,
    "Asia/Dubai":8,"Asia/Muscat":8,"Asia/Bahrain":8,"Asia/Amman":23,"Asia/Tehran":7,
    "Africa/Cairo":5,"Africa/Khartoum":5,"Africa/Tripoli":5,"Asia/Damascus":5,"Asia/Beirut":5,
    "Asia/Karachi":1,"Asia/Kolkata":1,"Asia/Calcutta":1,"Asia/Dhaka":1,"Asia/Kabul":1,
    "Africa/Tunis":18,"Africa/Algiers":19,"Africa/Casablanca":21,"Africa/El_Aaiun":21,
    "Europe/Lisbon":22,"Asia/Singapore":11,"Asia/Kuala_Lumpur":17,"Asia/Kuching":17,
    "Asia/Jakarta":20,"Asia/Makassar":20,"Asia/Jayapura":20,"Asia/Pontianak":20,
    "Europe/Moscow":14,"Europe/Samara":14,"Europe/Volgograd":14,"Europe/Kazan":14
  };
  if(map[z] !== undefined) return map[z];
  if(z.startsWith("America/")) return 2;
  if(z.startsWith("Europe/")) return 12;
  return 3;
}
function custom(fajr, isha, ishaInterval, maghribAdj){
  const p = adhan.CalculationMethod.Other();
  p.fajrAngle = fajr;
  if(ishaInterval) p.ishaInterval = ishaInterval; else p.ishaAngle = isha;
  if(maghribAdj) p.methodAdjustments = { ...p.methodAdjustments, maghrib: maghribAdj };
  return p;
}
function paramsFor(id){
  const M = adhan.CalculationMethod;
  const p = ({
    3:()=>M.MuslimWorldLeague(), 4:()=>M.UmmAlQura(), 5:()=>M.Egyptian(), 9:()=>M.Kuwait(), 10:()=>M.Qatar(),
    13:()=>M.Turkey(), 7:()=>M.Tehran(), 1:()=>M.Karachi(), 2:()=>M.NorthAmerica(), 11:()=>M.Singapore(),
    15:()=>M.MoonsightingCommittee(),
    8:()=>custom(19.5, 0, 90), 23:()=>custom(18, 18, 0, 5), 12:()=>custom(12, 12),
    22:()=>custom(18, 0, 77, 3), 14:()=>custom(16, 15), 18:()=>custom(18, 18), 19:()=>custom(18, 17, 0, 3),
    21:()=>custom(19, 17, 0, 5), 17:()=>custom(20, 18), 20:()=>custom(20, 18)
  }[id] || (()=>M.MuslimWorldLeague()))();
  p.madhab = id === 1 ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  p.highLatitudeRule = adhan.HighLatitudeRule.TwilightAngle;
  return p;
}

const KEYS = ["fajr","sunrise","dhuhr","asr","maghrib","isha"];
function hm(date, tz){
  if(!(date instanceof Date) || isNaN(date)) return "—";
  return date.toLocaleTimeString("en-GB", { timeZone:tz, hour:"2-digit", minute:"2-digit", hour12:false });
}
function dayTimes(city, y, m, d, method){
  const t = new adhan.PrayerTimes(new adhan.Coordinates(city.lat, city.lng), new Date(y, m - 1, d), paramsFor(method));
  const o = {};
  KEYS.forEach(k => o[k] = hm(t[k], city.tz));
  return o;
}
// تاريخ اليوم في منطقة المدينة الزمنية
function todayIn(tz){
  const p = new Intl.DateTimeFormat("en-CA", { timeZone:tz, year:"numeric", month:"2-digit", day:"2-digit" }).formatToParts(new Date());
  const g = t => +p.find(x => x.type === t).value;
  return { y:g("year"), m:g("month"), d:g("day") };
}
// الصلاة القادمة بعد لحظة معينة (للإشعارات): تبحث في اليوم الحالي والتالي بمنطقة المكان الزمنية
const NOTIFY_KEYS = ["fajr","dhuhr","asr","maghrib","isha"];
function nextPrayer(lat, lng, tz, method, school, after){
  const p = paramsFor(method);
  if(school === 0 || school === 1) p.madhab = school === 1 ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  const base = new Date(after.getTime() - 86400000);
  for(let i = 0; i < 3; i++){
    const day = new Date(base.getTime() + i * 86400000);
    const ds = new Intl.DateTimeFormat("en-CA", { timeZone:tz, year:"numeric", month:"2-digit", day:"2-digit" }).formatToParts(day);
    const g = t => +ds.find(x => x.type === t).value;
    const t = new adhan.PrayerTimes(new adhan.Coordinates(lat, lng), new Date(g("year"), g("month") - 1, g("day")), p);
    for(const k of NOTIFY_KEYS){
      const at = t[k];
      if(at instanceof Date && !isNaN(at) && at > after) return { key:k, at, hm:hm(at, tz) };
    }
  }
  return null;
}
// كل تنبيهات المشترك حسب اختياراته المتقدمة، ثم أقربها بعد لحظة معينة
// prefs: { p:[الصلوات المختارة], a:التنبيه عند دخول الوقت, b:دقائق قبل الصلاة, i:دقائق الإقامة بعد الأذان, fe:قبل نهاية الفجر, j:الجمعة, q:قيام الليل }
// (a مستقل عن b و i: يمكن الاكتفاء بالتذكير قبل الصلاة دون تنبيه عند دخولها)
function cleanPrefs(x){
  x = x && typeof x === "object" ? x : {};
  const num = (v, ok) => ok.includes(Number(v)) ? Number(v) : 0;
  const p = Array.isArray(x.p) ? NOTIFY_KEYS.filter(k => x.p.includes(k)) : NOTIFY_KEYS;
  const pb = Array.isArray(x.pb) ? NOTIFY_KEYS.filter(k => x.pb.includes(k)) : p;
  return { p, pb, a:x.a === 0 ? 0 : 1, b:num(x.b, [0,5,10,15,20,30]), i:num(x.i, [0,5,10,15,20]), fe:x.fe ? 1 : 0, j:x.j ? 1 : 0, q:x.q ? 1 : 0 };
}
function dayEvents(lat, lng, tz, params, y, m, d, prefs){
  const t = new adhan.PrayerTimes(new adhan.Coordinates(lat, lng), new Date(y, m - 1, d), params);
  const ev = [], M = 60000, ok = x => x instanceof Date && !isNaN(x);
  for(const k of NOTIFY_KEYS){
    const at = t[k]; if(!ok(at)) continue;
    const hmv = hm(at, tz);
    if(prefs.p.includes(k)){
      if(prefs.a) ev.push({ type:"adhan", key:k, at, hm:hmv });
      if(prefs.i) ev.push({ type:"iqama", key:k, at:new Date(+at + prefs.i * M), hm:hmv });
    }
    if(prefs.b && prefs.pb.includes(k)) ev.push({ type:"before", key:k, at:new Date(at - prefs.b * M), hm:hmv });
  }
  if(prefs.fe && ok(t.sunrise)) ev.push({ type:"fajrEnd", key:"fajr", at:new Date(t.sunrise - 15 * M), hm:hm(t.sunrise, tz) });
  if(prefs.j && ok(t.dhuhr) && new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 5) ev.push({ type:"jumuah", key:"dhuhr", at:new Date(t.dhuhr - 30 * M), hm:hm(t.dhuhr, tz) });
  if(prefs.q){
    try{ const lt = new adhan.SunnahTimes(t).lastThirdOfTheNight; if(ok(lt)) ev.push({ type:"qiyam", key:"isha", at:lt, hm:hm(lt, tz) }); }catch(e){}
  }
  return ev;
}
function nextEvent(lat, lng, tz, method, school, prefs, after){
  const params = paramsFor(method);
  if(school === 0 || school === 1) params.madhab = school === 1 ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  prefs = cleanPrefs(prefs);
  let best = null;
  for(let i = -1; i <= 1; i++){
    const day = new Date(after.getTime() + i * 86400000);
    const ds = new Intl.DateTimeFormat("en-CA", { timeZone:tz, year:"numeric", month:"2-digit", day:"2-digit" }).formatToParts(day);
    const g = t => +ds.find(x => x.type === t).value;
    for(const e of dayEvents(lat, lng, tz, params, g("year"), g("month"), g("day"), prefs))
      if(e.at > after && (!best || e.at < best.at)) best = e;
  }
  return best;
}
const qibla = city => Math.round(adhan.Qibla(new adhan.Coordinates(city.lat, city.lng)));

module.exports = { LANGS, SITE, CITIES, findCity, nearest, nearby, METHODS, autoMethod, dayTimes, todayIn, qibla, KEYS, cityAt, nextPrayer, nextEvent, cleanPrefs, NOTIFY_KEYS, paramsFor };
