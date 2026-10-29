// يُنتج مجلد الملفات الذي يحمله تطبيق أندرويد داخله (app-www/)
// الصفحة الرئيسية والصور والأصوات تُنسخ، وروابط الموقع تصبح كاملة لأن الصفحات الأخرى تبقى على السيرفر
// الاستخدام: node scripts/build-app.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "app-www");
const SITE = "https://www.azankurd.com";

const COPY = /\.(mp3|jpg|png|webp|svg|ico)$/i;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const f of fs.readdirSync(ROOT)) {
  if (f === "index.html" || f === "manifest.json" || COPY.test(f)) {
    if (f === "AzanKurd.apk") continue;
    fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
  }
}

let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
// طلبات البيانات تذهب إلى الموقع دائمًا
html = html.replace(/(["'`])\/api\//g, `$1${SITE}/api/`);
// الروابط إلى صفحات الموقع الأخرى تفتح على الموقع
html = html.replace(/href="\/(?!\/)([^"]*)"/g, (m, p) => `href="${SITE}/${p}"`);

fs.writeFileSync(path.join(OUT, "index.html"), html);
console.log("ok: " + OUT);
