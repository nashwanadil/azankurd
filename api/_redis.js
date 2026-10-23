// اتصال بسيط بقاعدة Upstash Redis عبر واجهتها (REST)، دون مكتبات إضافية
// المفاتيح يضيفها Vercel تلقائيًا عند ربط القاعدة بالمشروع
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// أمر واحد: redis(["GET", "key"])
async function redis(cmd){
  const r = await fetch(URL_, { method:"POST", headers:{ Authorization:`Bearer ${TOKEN}` }, body:JSON.stringify(cmd) });
  const j = await r.json();
  if(j.error) throw new Error(j.error);
  return j.result;
}
// عدة أوامر في طلب واحد: pipeline([["SET","a","1"],["ZADD","z","1","a"]])
async function pipeline(cmds){
  if(!cmds.length) return [];
  const r = await fetch(URL_ + "/pipeline", { method:"POST", headers:{ Authorization:`Bearer ${TOKEN}` }, body:JSON.stringify(cmds) });
  const j = await r.json();
  return j.map(x => x.result);
}
const ready = () => !!(URL_ && TOKEN);

module.exports = { redis, pipeline, ready };
