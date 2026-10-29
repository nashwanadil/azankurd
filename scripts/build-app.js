// يُنتج مجلد الملفات الذي يحمله تطبيق أندرويد داخله (app-www/)
// الصفحة الرئيسية والصور والأصوات والأدوات الثابتة (الأذكار والزكاة والهجري والمناسبات) تُنسخ أو تُولَّد محليًا،
// وروابط الموقع الأخرى تصبح كاملة لتفتح على الإنترنت
// الاستخدام: node scripts/build-app.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "app-www");
const SITE = "https://www.azankurd.com";
const COPY = /\.(mp3|jpg|png|webp|svg|ico)$/i;
const APP_LANGS = ["ar", "ku", "en"];
const TOOLS = { azkar: "_azkar.js", zakat: "_zakat.js", hijri: "_hijri.js", occasions: "_occasions.js" };
const LOCAL = [];
for (const l of APP_LANGS) for (const t of Object.keys(TOOLS)) LOCAL.push(`${l}/${t}`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const f of fs.readdirSync(ROOT)) {
  if (f === "index.html" || f === "manifest.json" || COPY.test(f)) {
    fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
  }
}

// يعترض النقر على الأدوات المحلية، فتفتح نسختها داخل التطبيق بدل الإنترنت
function interceptor(prefix) {
  return `<script>(function(){var L=${JSON.stringify(LOCAL)},P=${JSON.stringify(prefix)};document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;var m=a.getAttribute("href").match(/^(?:https:\\/\\/www\\.azankurd\\.com)?\\/((?:ar|ku|en)\\/(?:azkar|zakat|hijri|occasions))\\/?(?:[?#].*)?$/);if(!m||L.indexOf(m[1])<0)return;e.preventDefault();location.href=P+m[1]+"/index.html";},true);})();</script>`;
}

function finish(html, prefix) {
  // طلبات البيانات تذهب إلى الموقع دائمًا
  html = html.replace(/(["'`])\/api\//g, `$1${SITE}/api/`);
  // الروابط إلى صفحات الموقع الأخرى تفتح على الموقع
  html = html.replace(/href="\/(?!\/)([^"]*)"/g, (m, p) => `href="${SITE}/${p}"`);
  return html.replace("</body>", interceptor(prefix) + "</body>");
}

fs.writeFileSync(path.join(OUT, "index.html"), finish(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"), ""));

// الأدوات الثابتة: تُولَّد من دوال الموقع نفسها، بلا اتصال بالسيرفر
const res = () => {
  const r = { statusCode: 200, body: "" };
  r.setHeader = () => {};
  r.writeHead = () => {};
  r.end = b => { r.body = b; };
  return r;
};
for (const l of APP_LANGS) {
  for (const [tool, file] of Object.entries(TOOLS)) {
    const handler = require(path.join(ROOT, "api", file));
    const r = res();
    handler({ url: `/${l}/${tool}`, headers: {}, method: "GET" }, r);
    const dir = path.join(OUT, l, tool);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), finish(r.body, "../../"));
  }
}

console.log("ok: " + OUT);
