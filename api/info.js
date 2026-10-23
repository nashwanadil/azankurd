// صفحات «عن الموقع» و«سياسة الخصوصية» و«اتصل بنا»: /ar/about  /ar/privacy  /ar/contact
const { LANGS } = require("./_core.js");
const { T, esc, page, send } = require("./_layout.js");
const I = require("./_info.js");

const CSS = `
.prose p{margin-bottom:14px;font-size:1.02rem;line-height:2}
.prose h2{font-size:1.05rem;color:var(--gold);margin:18px 0 6px}
.prose b.nm{font-family:'Amiri',serif;font-size:1.3em;font-weight:700;color:#b08a3e;padding:0 .1em;word-spacing:-.12em}
html[data-mode=dark] .prose b.nm{color:#e0b860}
.sign{margin-top:22px;text-align:end;font-family:'Amiri',serif;font-size:1.5rem;font-weight:700;color:var(--title)}
html[dir=ltr] .sign{font-family:'Noto Sans',sans-serif;font-size:1.15rem}
.orn{display:block;width:180px;height:16px;margin:6px auto 20px;fill:#c9a24e;stroke:#c9a24e}
.muted{color:var(--muted);font-size:.85rem;margin-top:16px}
.form label{display:block;color:var(--muted);font-size:.85rem;margin:12px 0 6px}
.form input,.form textarea{width:100%;background:var(--inner);color:var(--text);border:1px solid var(--line);border-radius:12px;padding:10px 12px;font-family:inherit;font-size:1rem}
.form textarea{min-height:150px;resize:vertical}
.form input:focus,.form textarea:focus{outline:0;border-color:var(--gold)}
.form .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.form .btn{margin-top:16px}
.form .st{margin-top:12px;min-height:1.5em;font-size:.92rem}
.form .st.ok{color:#2e9d5b;font-weight:600}
.form .st.err{color:#d0443c}`;
const ORN = '<svg class="orn" viewBox="0 0 240 24" aria-hidden="true"><path d="M4 12H92M148 12h88" stroke-width="1.4"/><path d="M96 12l5-5 5 5-5 5zM134 12l5-5 5 5-5 5z"/><path d="M120 2l3.4 6.6L130 12l-6.6 3.4L120 22l-3.4-6.6L110 12l6.6-3.4z"/></svg>';

module.exports = (req, res) => {
  const u = new URL(req.url, "https://azankurd.com");
  const lang = LANGS.includes(u.searchParams.get("lang")) ? u.searchParams.get("lang") : "ar";
  const which = ["about","privacy","contact"].includes(u.searchParams.get("page")) ? u.searchParams.get("page") : "about";
  const t = T[lang], x = I[lang] || I.en;
  const crumbs = title => `<nav class="crumbs"><a href="/?lang=${lang}">${esc(t.home)}</a><span>›</span><b>${esc(title)}</b></nav>`;
  let title, desc, body, js = "";

  if(which === "about"){
    title = x.aboutTitle;
    desc = x.about[0];
    const ps = x.about.map(p => `<p>${esc(p).replace("{name}", `<b class="nm">${esc(x.hname)}</b>`)}</p>`).join("");
    body = `${crumbs(title)}<section class="hcard prose"><h1>${esc(title)}</h1>${ORN}${ps}<div class="sign">${esc(x.sign)}</div></section>`;
  } else if(which === "privacy"){
    title = x.privTitle;
    desc = x.priv[0][1];
    const ps = x.priv.map(([h, p]) => (h ? `<h2>${esc(h)}</h2>` : "") + `<p>${esc(p)}</p>`).join("");
    body = `${crumbs(title)}<section class="hcard prose"><h1>${esc(title)}</h1>${ORN}${ps}<p class="muted">${esc(x.updated)}</p></section>`;
  } else {
    title = x.contTitle;
    desc = x.contIntro;
    body = `${crumbs(title)}<section class="hcard"><h1>${esc(title)}</h1><p class="lead">${esc(x.contIntro)}</p>
    <form class="form" id="cf" novalidate>
      <label for="cn">${esc(x.fName)}</label><input id="cn" name="name" maxlength="80" autocomplete="name">
      <label for="ce">${esc(x.fEmail)}</label><input id="ce" name="email" type="email" maxlength="120" autocomplete="email" required dir="ltr">
      <label for="cm">${esc(x.fMsg)}</label><textarea id="cm" name="message" maxlength="4000" required></textarea>
      <div class="hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>
      <button class="btn" type="submit" id="cs">${esc(x.fSend)}</button>
      <div class="st" id="cst" role="status" aria-live="polite"></div>
    </form></section>`;
    js = `(function(){
  var f=document.getElementById("cf"), st=document.getElementById("cst"), bt=document.getElementById("cs"), t0=Date.now();
  var M=${JSON.stringify({ sending:x.fSending, ok:x.fOk, err:x.fErr, req:x.fReq, send:x.fSend })};
  f.addEventListener("submit", function(e){
    e.preventDefault();
    var d={ name:f.name.value.trim(), email:f.email.value.trim(), message:f.message.value.trim(), website:f.website.value, ms:Date.now()-t0, lang:${JSON.stringify(lang)} };
    if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(d.email) || d.message.length < 2){ st.className="st err"; st.textContent=M.req; return; }
    bt.disabled=true; bt.textContent=M.sending; st.className="st"; st.textContent="";
    fetch("/api/contact",{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(d) })
      .then(function(r){ if(!r.ok) throw 0; st.className="st ok"; st.textContent=M.ok; f.reset(); })
      .catch(function(){ st.className="st err"; st.textContent=M.err; })
      .then(function(){ bt.disabled=false; bt.textContent=M.send; });
  });
})();`;
  }
  send(res, page({ lang, title:`${title} | ${t.logo}`, desc, path:`/${which}`, body, css:CSS, js }));
};
