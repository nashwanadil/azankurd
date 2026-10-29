// صفحة تحميل التطبيق: /download.html و/ar/download، بالهيدر والقائمة نفسيهما في بقية الصفحات
const { LANGS } = require("./_core.js");
const { page, send } = require("./_layout.js");

const CSS = `
.dlp{text-align:center;padding:28px 22px}
.dlp .app{width:120px;height:120px;border-radius:28px;box-shadow:0 8px 22px rgba(0,0,0,.2);margin:0 auto 14px;display:block}
.dlp h1{font-size:1.5rem;color:var(--gold);font-weight:400}
.dlp .desc{color:var(--muted);font-size:.98rem;margin:6px 0 20px}
.dlp .dl{display:block;width:100%;padding:15px;border-radius:14px;background:var(--green);color:#fff;font-weight:400;font-size:1.05rem;text-decoration:none}
.dlp .note{margin-top:24px;text-align:start;background:var(--inner);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
.dlp .note h2{font-size:1rem;color:var(--gold);font-weight:400;margin-bottom:6px}
.dlp .note p{font-size:.92rem;color:var(--muted);margin-bottom:10px}
.dlp .note ol{padding-inline-start:20px;font-size:.92rem}
.dlp .note li{margin-bottom:6px}
.dlp .specs dl{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;font-size:.92rem}
.dlp .specs dt{color:var(--gold);font-weight:400}
.dlp .specs dd{color:var(--text)}
.dlp .specs dd ul{list-style:none;padding:0;display:grid;gap:6px}
.dlp .specs dd li{color:var(--muted);font-size:.9rem}
.dlp .specs dd li b{color:var(--text)}
.dlp .specs dd:has(ul){grid-column:1 / -1}
.dlp .specs dt:has(+ dd ul){grid-column:1 / -1}
.dlp .feat{list-style:none;padding:0;display:grid;gap:9px;margin-bottom:22px}
.dlp .feat li{position:relative;padding-inline-start:18px;font-size:.92rem;color:var(--muted)}
.dlp .feat li::before{content:"";position:absolute;inset-inline-start:0;top:.7em;width:7px;height:7px;border-radius:50%;background:var(--gold)}
.dlp .feat b{color:var(--text)}`;

// المحتوى بالعربية في كل اللغات (كما كانت الصفحة)، وهيدر الصفحة وقائمتها بلغة المستخدم
const BODY = `<section class="hcard dlp" dir="rtl">
<img class="app" src="/icon-192.png" alt="أذان كُرد" width="120" height="120">
  <h1>أذان كُرد</h1>
  <p class="desc">مواقيت الصلاة والأذان الكامل لكل مدن العالم، مع تنبيه قبل كل صلاة.</p>
  <a class="dl" href="/AzanKurd.apk" download>تنزيل التطبيق (APK)</a>

  <section class="note specs">
    <h2>معلومات التطبيق</h2>
    <dl>
      <dt>الاسم</dt><dd>أذان كُرد (AzanKurd)</dd>
      <dt>الإصدار</dt><dd>1.0.0 (رمز 1)</dd>
      <dt>المطور</dt><dd>نشوان عادل</dd>
      <dt>الحجم</dt><dd>نحو 11.4 ميغابايت</dd>
      <dt>يتطلب</dt><dd>أندرويد 7.0 فأحدث</dd>
      <dt>اللغات</dt><dd>20 لغة</dd>
      <dt>الصلاحيات</dt>
      <dd>
        <ul>
          <li>الموقع: لمعرفة مدينتك وحساب مواقيت الصلاة لها</li>
          <li>الإشعارات: لتنبيه قبل الصلاة وعند دخول وقتها</li>
          <li>المنبّهات الدقيقة: لتشغيل الأذان في وقته تماماً</li>
          <li>الصوت في الخلفية: لتشغيل الأذان كاملاً</li>
          <li>بدء التشغيل بعد إعادة الهاتف: لإعادة ضبط التنبيهات تلقائياً</li>
          <li>الإنترنت: لجلب المواقيت</li>
          <li>إبقاء الهاتف مستيقظاً: لحظة التنبيه فقط</li>
          <li>استثناء البطارية (اختياري): يُطلب عند الإعداد، ولا يزيد استهلاك البطارية</li>
        </ul>
      </dd>
    </dl>
  </section>

  <section class="note specs">
    <h2>مميزات التطبيق</h2>
    <ul class="feat">
      <li>مواقيت الصلاة لأي مدينة في العالم، وتحديد موقعك تلقائياً فوراً ثم بدقة بالـGPS.</li>
      <li>اختيار طريقة الحساب تلقائياً حسب بلد مدينتك، ويمكنك تغييرها يدوياً.</li>
      <li>البحث عن المدن، وحفظ المدن التي بحثت عنها لتعود إليها بنقرة.</li>
      <li>أقرب مدينة إليك عند التصفح، مع اسمها بلغتك.</li>
      <li>تذكير قبل الصلاة بالدقائق التي تختارها (من 5 إلى 30 دقيقة)، للصلوات التي تحددها.</li>
      <li>إمكانية تغيير أصوات الأذان الخمسة: صوت لكل صلاة، أو صامت، أو افتراضي كإشعارات الهاتف. الأصوات المتاحة: القدس ومكة والمدينة.</li>
      <li>تذكير قيام الليل عند دخول الثلث الأخير من الليل.</li>
      <li>تذكير صلاة الجمعة قبلها بنصف ساعة.</li>
      <li>مواقيت الأسبوع، والجدول الشهري.</li>
      <li>طباعة الجدول الشهري بتصميم أنيق، مع كتابة اسم مسجدك بخط راقٍ ليبدو الجدول وكأنه من تصميمك.</li>
      <li>أدوات: القبلة، والتقويم الهجري، والزكاة، والأذكار، ومواقيت رمضان، والمناسبات.</li>
      <li>مواقيت كل البلدان ومدنها.</li>
      <li>حساب العصر: الجمهور أو الحنفي.</li>
      <li>9 ألوان للواجهة، ووضع فاتح وداكن.</li>
      <li>تنسيق الوقت: 24 ساعة أو 12 ساعة.</li>
      <li>مزامنة الإعدادات والمدن بين أجهزتك بكود تنشئه وتضعه في جهاز آخر.</li>
    </ul>
  </section>

  <section class="note">
    <h2>لماذا يظهر تحذير عند التثبيت؟</h2>
    <p>التطبيق لم يُنشر بعد في متجر جوجل بلاي، لذلك يحذّر الهاتف من تثبيته. التطبيق آمن ولا يطلب حساباً ولا دفعاً. اتبع الخطوات:</p>
    <ol>
      <li>اضغط زر التنزيل، ثم افتح الملف من شريط الإشعارات.</li>
      <li>إن طلب الهاتف الإذن، اختر السماح من هذا المصدر ثم ارجع.</li>
      <li>إن ظهر «حماية Play» وقال إن التطبيق غير آمن، اضغط التفاصيل ثم التثبيت على أي حال.</li>
      <li>اضغط تثبيت، ثم فتح.</li>
    </ol>
  </section>
</section>`;

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  res.setHeader("X-Robots-Tag", "noindex");
  send(res, page({ lang, title:"تحميل تطبيق أذان كُرد", desc:"حمّل تطبيق أذان كُرد لمواقيت الصلاة والأذان الكامل على هاتفك أندرويد.", path:"/download", body:BODY, css:CSS }));
};
