/* QuickCheck "Try it before you install it" — first-visit overlay.
   Flow: Welcome -> About you (client form) -> TOS (teacher) -> test on two papers (student)
         -> checking with a made-up class -> Score / Analysis / Record / Install.
   Needs: try/test-sets.js (TEST_SETS) loaded first, try/try.css, and the inline gate in index.html's <head>
          that adds html.qct-open on a first visit. */
(function () {
  "use strict";

  // ---------- settings (single source of truth) ----------
  const SEEN_KEY = "qc_try_seen";
  // Anonymous logger: Google Apps Script web app bound to Arvin's "QuickCheck Visitors (website Try-it)" Sheet.
  // One row per visitor; no names. Empty string = nothing is sent.
  const LOG_URL = "https://script.google.com/macros/s/AKfycby_4xn6PZjIFZy6SzrTg4JOKU8pLot1Egriq6sBI9ZlLpckztwdDIjMR0v8G0DgBq_rRA/exec";
  const ASSUME = { secondsPerPaper: 3, classSize: 35, mastery: 75, section: "Sampaguita" };
  const LETTERS = ["A", "B", "C", "D"];

  // The About-you client form. NOT part of the test: it tells Arvin who his visitors are.
  // Anonymous: no names, no typing. Grade and subject also pick the test set.
  const ABOUT = [
    { id: "where",   q: "Where do you teach?", c: { A: "Public school (DepEd)", B: "Private school", C: "College or other", D: "I'm not a teacher" } },
    { id: "age",     q: "How old are you?", c: { A: "20–29", B: "30–39", C: "40–49", D: "50 or older" } },
    { id: "years",   q: "How long have you been teaching?", c: { A: "Less than 3 years", B: "3–10 years", C: "11–20 years", D: "More than 20 years" } },
    { id: "apps",    q: "Have you used an app to check papers before?", c: { A: "No, never", B: "Yes, ZipGrade", C: "Yes, another checker app", D: "Only Google Forms or online quizzes" } },
    { id: "grade",   q: "Which grade do you teach?", c: { A: "Grades 1–3", B: "Grades 4–6", C: "Grades 7–10", D: "Senior High" } },
    { id: "subject", q: "What subject do you teach most?", c: { A: "Math", B: "Science", C: "English", D: "Filipino", E: "AP", F: "ESP", G: "MAPEH", H: "TLE" } },
  ];
  const BAND_KEY = { A: "ELEM", B: "ELEM", C: "JHS", D: "SHS" };
  const BAND_NAME = { A: "Elementary", B: "Elementary", C: "Junior High", D: "Senior High" };
  const GRADE_FOR_BAND = { A: "Grade 3", B: "Grade 5", C: "Grade 7", D: "Grade 11" };
  const SUBJECT_KEY = { A: "Math", B: "Science", C: "English", D: "Filipino", E: "AP", F: "ESP", G: "MAPEH", H: "TLE" };
  const FIRST = ["Andrea","Joshua","Princess Mae","Carlo","Kyla","Mark Anthony","Jasmine","Rhian","John Lloyd","Angel","Miguel","Bea","Paolo","Nicole","Kenneth","Shaira","Jerome","Althea","Vince","Trisha","Ivan","Hannah","Renz","Czarina","Bryan","Mikaela","Dexter","Lovely","Gabriel","Camille","Rafael","Erica","Nathan","Joy","Luis"];
  const LAST = ["Bautista","Dela Cruz","Santos","Reyes","Mendoza","Ramos","Villanueva","Aquino","Garcia","Torres","Navarro","Castillo","Flores","Gonzales","Lopez","Domingo","Cruz","Pascual","Salazar","Rivera","Mercado","Soriano","Manalo","Fernandez","Valdez","Ocampo","Galang","Tolentino","Sison","Lim","Robles","Javier","Panganiban","Medina","Abad"];

  // ---------- small helpers ----------
  let S, timers = [];
  const $ = id => document.getElementById(id);
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const isWide = () => matchMedia("(min-width: 900px)").matches;
  const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isAndroid = () => /Android/i.test(navigator.userAgent);
  const seen = {
    set() { try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* private mode: fine */ } },
  };
  const freshState = () => ({ id: Math.random().toString(36).slice(2, 10), about: {}, test: {}, set: null, subject: "", tosMap: null, moved: new Set(), cls: null, logged: false });
  const className = () => `${GRADE_FOR_BAND[S.about.grade] || "Grade 7"} – ${ASSUME.section}`;
  // Download links come from the page's own #download section, so each release updates one place only.
  const downloadUrl = kind => (document.querySelector(`#download a[href$="${kind === "android" ? ".apk" : ".exe"}"]`) || {}).href || "#download";

  function log(event, extra) {
    if (!LOG_URL || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;   // local tests never reach the Sheet
    const a = S.about, row = Object.assign({ id: S.id, event, where: a.where, age: a.age, years: a.years, apps: a.apps, grade: a.grade, subject: a.subject }, extra || {});
    try { fetch(LOG_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(row), keepalive: true }); } catch (e) { /* never block the visitor */ }
  }

  // ---------- markup ----------
  // On every step, for visitors who only came to buy: closes the flow at the price cards.
  const SKIP = `<button class="toprice" data-goto="#pricing">Skip to prices</button>`;
  function build() {
    const root = document.createElement("div");
    root.id = "qct";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Try QuickCheck");
    root.innerHTML = `
    <div class="qv welcome on" id="qct-welcome">
      <button class="close dark" data-close aria-label="Close">×</button>
      <div class="inner">
        <span class="logo"><i>✓</i>QuickCheck</span>
        <div class="mini-sheet" aria-hidden="true"><span class="cm tl"></span><span class="cm tr"></span><span class="cm bl"></span><span class="cm br"></span>
          <div class="dots">${"f,,,,,,f,,,f,,,,,,f,f,,,".split(",").slice(0, 20).map(x => `<span class="${x}"></span>`).join("")}</div></div>
        <h2>Ma'am, Sir, try QuickCheck right here.</h2>
        <p>Take a 10-item test in your subject. Watch it get checked in seconds, with a whole class. No install yet.</p>
        <div class="chips"><span>About you (6 taps)</span><span>1 · You set the test</span><span>2 · You answer like a student</span><span>3 · QuickCheck scans the class</span><span>4 · You see the results</span></div>
        <button class="btn light" id="qct-start">Tara, let's start →</button>
        <button class="linkish" data-goto="#pricing">Skip, show me the prices</button>
      </div>
    </div>

    <div class="qv" id="qct-about"><div class="pad">
      <button class="close" data-close aria-label="Close">×</button>${SKIP}
      <div class="card">
        <p class="eyebrow">Before the test · about you</p>
        <h2>Quick question muna, Ma'am / Sir.</h2>
        <p class="sub">6 taps. No name, no typing. This helps us make QuickCheck better for teachers like you.</p>
        <div id="qct-form"></div>
      </div>
      <div class="bar"><div class="left" id="qct-form-left"></div><button class="btn" id="qct-form-go" disabled>Next: my test</button></div>
    </div></div>

    <div class="qv" id="qct-tos"><div class="pad">
      <button class="close" data-close aria-label="Close">×</button>${SKIP}
      <div class="card">
        <p class="eyebrow">You are the teacher · set up the test</p>
        <h2 id="qct-tos-title"></h2>
        <p class="sub">QuickCheck made your Table of Specifications. Tap an item number to move it to the next competency. Try it once.</p>
        <div class="tos-table" id="qct-tos-table"></div>
        <div class="tip" id="qct-tos-tip"><b>Why a TOS?</b> After checking, QuickCheck tells you which competency your class has not mastered yet.<span class="pro">PRO</span></div>
      </div>
      <div class="bar"><div class="left">Next: answer the 10 items yourself</div><button class="btn" id="qct-tos-go">Start the test</button></div>
    </div></div>

    <div class="qv sheetview" id="qct-sheet">
      <div class="papers">
        <div class="qpaper" id="qct-qpaper">
          <p class="qp-tag"><span>TEST PAPER · read here</span>${SKIP}</p>
          <p class="qp-title" id="qct-qp-title"></p>
          <p class="sub">Now you're the student. Read here, shade on the answer sheet, like your learners do.</p>
          <ol class="qlist" id="qct-qlist"></ol>
        </div>
        <div class="apaper" id="qct-apaper">
          <div class="sheet" id="qct-paper">
            <span class="cm tl"></span><span class="cm tr"></span><span class="cm bl"></span><span class="cm br"></span>
            <div class="sheet-title"><span class="logo"><i>✓</i>QuickCheck</span><b>ANSWER SHEET</b></div>
            <div class="head-box">
              <div class="name">NAME <span class="hand">Ma'am / Sir</span></div>
              <div>GRADE &amp; SECTION <span class="hand" id="qct-hb-grade"></span></div>
              <div class="mid">SUBJECT <span class="hand" id="qct-hb-subj"></span></div>
              <div class="mid score">SCORE <span class="hand" id="qct-hb-score"></span></div>
            </div>
            <div id="qct-rows"></div>
            <p class="sheet-foot">Shade the bubble fully. One bubble per question.</p>
          </div>
        </div>
      </div>
      <div class="bar"><div class="left"><span id="qct-left"></span><div class="progress" id="qct-progress"></div></div><button class="btn" id="qct-sheet-go" disabled>Submit my sheet</button></div>
    </div>

    <div class="qv checking" id="qct-check">
      <div class="ck-top">${SKIP}<button class="ck-skip" id="qct-ck-skip">Skip ▸</button></div>
      <div class="ck-wrap">
        <div class="phone" id="qct-ph"><div class="ph-screen">
          <span class="lock tl"></span><span class="lock tr"></span><span class="lock bl"></span><span class="lock br"></span>
          <div class="vf" id="qct-vf"><span class="cm tl"></span><span class="cm tr"></span><span class="cm bl"></span><span class="cm br"></span><div class="lines" id="qct-vf-dots"></div></div>
          <div class="ph-score" id="qct-ph-score"><span id="qct-ph-name">You</span><span id="qct-ph-num"></span></div>
          <div class="ph-status" id="qct-ph-status"></div>
          <div class="flash" id="qct-flash"></div>
        </div></div>
        <div class="side">
          <div class="timer"><span>Time checking</span><b id="qct-ck-time">0 s</b></div>
          <div class="clock"><span id="qct-ck-label"></span><b id="qct-ck-count"></b></div>
          <div class="list" id="qct-ck-list" aria-live="polite"></div>
          <div class="stamp" id="qct-stamp"></div>
        </div>
      </div>
      <p class="ck-note">You're the teacher again: QuickCheck checks your paper with the class's. (Animation. The other learners are made up.)</p>
    </div>

    <div class="qv" id="qct-results">
      <button class="close" data-close aria-label="Close">×</button>
      <div class="rtabs" role="tablist" id="qct-rtabs">
        <button role="tab" data-tab="score">Score</button><button role="tab" data-tab="ia">Analysis</button><button role="tab" data-tab="rec">Record</button><button role="tab" data-tab="get">Install</button>
      </div>
      <div class="rskip">${SKIP}</div>
      <div class="rbody"><div class="res" id="qct-res"></div></div>
    </div>`;
    document.body.appendChild(root);
  }

  function show(id) {
    document.querySelectorAll("#qct .qv").forEach(v => v.classList.toggle("on", v.id === id));
    $(id).scrollTop = 0;
  }
  // Scroll one scrolling box (not the page) so an element sits near its top.
  function scrollBox(box, el) {
    if (el) box.scrollTop += el.getBoundingClientRect().top - box.getBoundingClientRect().top - 40;
  }

  // ---------- About you ----------
  function renderForm() {
    $("qct-form").innerHTML = ABOUT.map((it, i) => `<fieldset class="fq" id="qct-fq-${it.id}"><legend><b>${i + 1}.</b> ${it.q}</legend>
      <div class="opts-grid">${Object.entries(it.c).map(([k, v]) =>
        `<button type="button" class="opt" data-q="${it.id}" data-k="${k}" aria-pressed="${S.about[it.id] === k}">${v}</button>`).join("")}</div></fieldset>`).join("");
    updateForm();
  }
  function updateForm() {
    const left = ABOUT.filter(it => !S.about[it.id]).length;
    $("qct-form-left").textContent = left ? `${left} to go` : "Salamat! Next, your test.";
    $("qct-form-go").disabled = left > 0;
  }

  // ---------- TOS (teacher) ----------
  function startTos() {
    S.set = TEST_SETS[BAND_KEY[S.about.grade]][SUBJECT_KEY[S.about.subject]];
    S.subject = S.set.title;
    S.test = {};
    S.tosMap = S.set.items.map(it => it.comp);
    S.moved = new Set();
    $("qct-hb-grade").textContent = GRADE_FOR_BAND[S.about.grade];
    $("qct-hb-subj").textContent = S.subject;
    $("qct-hb-score").textContent = "";
    $("qct-tos-title").textContent = `${BAND_NAME[S.about.grade]} ${S.subject} quiz · 10 items`;
    renderTos();
    show("qct-tos");
  }
  function renderTos() {
    let h = `<div class="tos-row"><span>COMPETENCY</span><span style="text-align:center">ITEMS</span></div>`;
    S.set.comps.forEach((c, ci) => {
      const nums = S.tosMap.map((m, i) => (m === ci ? i + 1 : 0)).filter(Boolean);
      h += `<div class="tos-row"><span class="comp">${c}</span><span class="cnt">${nums.length}</span>
        <div class="tchips">${nums.map(n => `<button class="tchip${S.moved.has(n) ? " moved" : ""}" data-item="${n}" aria-label="Move item ${n} to the next competency">#${n}</button>`).join("") || '<span style="font-size:12px;color:#888">no items</span>'}</div></div>`;
    });
    $("qct-tos-table").innerHTML = h;
    if (S.moved.size) $("qct-tos-tip").innerHTML = `<b>Nice, your TOS is updated.</b> The competency report will follow your version.<span class="pro">PRO</span>`;
  }

  // ---------- the test on two papers (student) ----------
  const testItems = () => S.set.items.map((it, i) => ({ id: "t" + (i + 1), n: i + 1, q: it.q, choices: it.c.map((c, j) => [LETTERS[j], c]) }));
  const currentItem = () => testItems().find(it => !S.test[it.id]);

  function renderSheet() {
    const items = testItems();
    $("qct-qp-title").textContent = `${S.subject.toUpperCase()} · 10 ITEMS`;
    $("qct-qlist").innerHTML = items.map(it => `<li id="qct-q-${it.id}"><b>${it.n}.</b> ${it.q}
      <ol class="opts">${it.choices.map(([k, v]) => `<li><b>${k}.</b> ${v}</li>`).join("")}</ol></li>`).join("");
    $("qct-rows").innerHTML = `<div class="part">${S.subject.toUpperCase()}</div>
      <div class="arow"><span class="num"></span>${LETTERS.map(l => `<span class="lbl">${l}</span>`).join("")}</div>` +
      items.map(it => `<div class="arow" id="qct-row-${it.id}"><span class="num">${it.n}</span>${it.choices.map(([k]) =>
        `<button class="abub" data-id="${it.id}" data-k="${k}" aria-label="Item ${it.n}, choice ${k}" aria-pressed="false"></button>`).join("")}<span class="mark" id="qct-mark-${it.id}"></span></div>`).join("");
    $("qct-paper").classList.remove("checked");
    $("qct-progress").innerHTML = items.map(() => "<i></i>").join("");
    Object.entries(S.test).forEach(([id, k]) => markSel(id, k));
    $("qct-qpaper").scrollTop = 0;
    $("qct-apaper").scrollTop = 0;
    updateBar();
  }
  function markSel(id, k) {
    document.querySelectorAll(`#qct .abub[data-id="${id}"]`).forEach(b => { const on = b.dataset.k === k; b.classList.toggle("sel", on); b.setAttribute("aria-pressed", on); });
    $("qct-q-" + id).classList.add("done");
  }
  function shade(id, k) { S.test[id] = k; markSel(id, k); updateBar(); }
  function updateBar() {
    const items = testItems();
    const left = items.filter(it => !S.test[it.id]).length;
    $("qct-left").textContent = left ? `${left} item${left > 1 ? "s" : ""} left` : "All shaded. Ready to check!";
    [...$("qct-progress").children].forEach((d, i) => d.classList.toggle("f", !!S.test[items[i].id]));
    $("qct-sheet-go").disabled = left > 0;
    $("qct-sheet-go").textContent = "Submit my sheet";
    // the same item is highlighted on both papers
    const cur = currentItem();
    document.querySelectorAll("#qct .arow.cur, #qct .qlist>li.cur").forEach(el => el.classList.remove("cur"));
    if (cur) {
      $("qct-row-" + cur.id).classList.add("cur");
      $("qct-q-" + cur.id).classList.add("cur");
      later(350, () => { scrollBox($("qct-qpaper"), $("qct-q-" + cur.id)); scrollBox($("qct-apaper"), $("qct-row-" + cur.id)); });
    }
  }

  // ---------- checking with a made-up class ----------
  function seeded(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function makeClass() {
    const rnd = seeded(20261117 + S.subject.length);
    return Array.from({ length: ASSUME.classSize }, (_, i) => {
      const ability = rnd() * 0.5 - 0.2;
      const ans = S.set.items.map(it => {
        if (rnd() < Math.min(0.97, Math.max(0.05, it.p + ability))) return it.key;
        const wrong = LETTERS.filter(l => l !== it.key);
        return rnd() < 0.6 ? wrong[0] : wrong[1 + Math.floor(rnd() * 2)];   // one favourite wrong choice
      });
      return { name: `${LAST[i]}, ${FIRST[i]}`, ans };
    });
  }
  const scoreOf = ans => ans.reduce((s, a, i) => s + (a === S.set.items[i].key ? 1 : 0), 0);
  const timeText = sec => (sec < 60 ? `${sec} s` : `${Math.floor(sec / 60)} min ${sec % 60} s`);

  function runCheck() {
    show("qct-check"); clearTimers();
    S.cls = makeClass();
    const mine = S.set.items.map((_, i) => S.test["t" + (i + 1)]);
    const myScore = scoreOf(mine), total = S.cls.length + 1, totalSec = total * ASSUME.secondsPerPaper;
    const ph = $("qct-ph"), vf = $("qct-vf"), list = $("qct-ck-list");
    ph.classList.remove("in"); vf.classList.remove("read"); $("qct-stamp").classList.remove("on"); $("qct-ph-score").classList.remove("on");
    list.innerHTML = ""; $("qct-ck-label").textContent = className(); $("qct-ck-count").textContent = `0 / ${total}`; $("qct-ck-time").textContent = "0 s";
    document.querySelectorAll("#qct .lock").forEach(l => l.classList.remove("ok"));
    $("qct-vf-dots").innerHTML = S.set.items.slice(0, 9).map((it, i) => LETTERS.map(k => {
      const f = mine[i] === k; return `<span class="${f ? "f " + (k === it.key ? "ok" : "no") : ""}"></span>`; }).join("")).join("");
    $("qct-ph-status").textContent = "Point at the sheet…";
    $("qct-stamp").innerHTML = `${total} papers · ${timeText(totalSec)}<br>Scores saved ✓`;
    const finish = () => {
      ph.classList.add("in"); $("qct-stamp").classList.add("on"); $("qct-ph-status").textContent = "Scores saved ✓";
      $("qct-ck-count").textContent = `${total} / ${total}`; $("qct-ck-time").textContent = timeText(totalSec);
      later(1300, () => showResults("score"));
    };
    if (reducedMotion()) return finish();
    later(100, () => ph.classList.add("in"));
    ["tl", "tr", "br", "bl"].forEach((c, i) => later(800 + i * 200, () => { document.querySelector("#qct .lock." + c).classList.add("ok"); $("qct-ph-status").textContent = "Hold steady…"; }));
    later(1700, () => { const f = $("qct-flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); });
    later(1950, () => {
      vf.classList.add("read"); $("qct-ph-status").textContent = "Read ✓"; $("qct-ph-name").textContent = "You"; $("qct-ph-num").textContent = `${myScore}/10`;
      $("qct-ph-score").classList.add("on"); $("qct-ck-time").textContent = "0.9 s"; $("qct-ck-count").textContent = `1 / ${total}`;
      const r = document.createElement("div"); r.className = "you"; r.innerHTML = `<span>You</span><b>${myScore}/10</b>`; list.appendChild(r);
    });
    S.cls.forEach((l, i) => later(3000 + ((i + 1) / S.cls.length) * 3200, () => {
      const sc = scoreOf(l.ans), n = i + 2;
      $("qct-ck-count").textContent = `${n} / ${total}`; $("qct-ck-time").textContent = timeText(n * ASSUME.secondsPerPaper);
      vf.style.transform = `rotate(${(i % 3 - 1) * 2}deg)`; vf.classList.remove("read");
      $("qct-ph-name").textContent = l.name.split(",")[0]; $("qct-ph-num").textContent = `${sc}/10`; $("qct-ph-status").textContent = "Checking the class…";
      if (i % 3 === 0 || i === S.cls.length - 1) {
        const r = document.createElement("div"); r.innerHTML = `<span>${l.name}</span><b>${sc}/10</b>`; list.appendChild(r);
        while (list.children.length > 7) list.firstChild.remove();
      }
    }));
    later(6600, finish);
  }

  // ---------- results (teacher) ----------
  function analysis() {
    const mine = S.set.items.map((_, i) => S.test["t" + (i + 1)]);
    const all = [{ name: "You (Ma'am / Sir)", ans: mine, you: true }, ...S.cls];
    const items = S.set.items.map((it, i) => {
      const counts = { A: 0, B: 0, C: 0, D: 0 }; all.forEach(l => counts[l.ans[i]]++);
      const topWrong = LETTERS.filter(l => l !== it.key).sort((a, b) => counts[b] - counts[a])[0];
      return { n: i + 1, pct: Math.round((100 * counts[it.key]) / all.length), topWrong, wrongCount: counts[topWrong] };
    });
    const comps = S.set.comps.map((c, ci) => {
      const idx = S.tosMap.map((m, i) => (m === ci ? i : -1)).filter(i => i >= 0);
      return { c, pct: idx.length ? Math.round(idx.reduce((s, i) => s + items[i].pct, 0) / idx.length) : null };
    });
    const scores = all.map(l => ({ name: l.name, you: !!l.you, s: scoreOf(l.ans) })).sort((a, b) => b.s - a.s);
    const mps = Math.round((100 * scores.reduce((s, x) => s + x.s, 0)) / (scores.length * 10));
    return { mine, myScore: scoreOf(mine), items, comps, scores, mps, n: all.length };
  }
  function showResults(tab) {
    clearTimers(); seen.set();
    const A = analysis();
    if (!S.logged) { S.logged = true; log("finished", { set: `${BAND_KEY[S.about.grade]}/${SUBJECT_KEY[S.about.subject]}`, score: A.myScore }); }
    $("qct-hb-score").textContent = `${A.myScore}/10`;
    document.querySelectorAll("#qct-rtabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
    const M = ASSUME.mastery;
    let h = "";
    if (tab === "score") {
      h = `<p class="hello">Salamat, Ma'am / Sir. Checked in 0.9 seconds.</p>
        <div class="big"><span>Your score</span><span class="n">${A.myScore} / 10</span><small>${S.subject} quiz · ${BAND_NAME[S.about.grade]}</small></div>
        <div class="ans">${S.set.items.map((it, i) => { const ok = A.mine[i] === it.key;
          return `<div><b>${i + 1}</b><span>${it.q}<br><small>Answer: ${it.key}. ${it.c[LETTERS.indexOf(it.key)]}</small></span><span class="${ok ? "ok" : "no"}">${ok ? "✓" : "✗ " + A.mine[i]}</span></div>`; }).join("")}</div>
        <button class="linkish" id="qct-see-sheet" style="justify-self:start">See my checked answer sheet</button>
        <button class="btn" data-tab="ia">Next: how the class did →</button>`;
    } else if (tab === "ia") {
      const worst = [...A.items].sort((a, b) => a.pct - b.pct)[0];
      h = `<p class="hello">Item analysis · ${A.n} papers</p>
        <div class="callout"><b>Most missed: item ${worst.n} (${worst.pct}% correct).</b> ${worst.wrongCount} learners chose ${worst.topWrong}. Worth a quick review tomorrow.</div>
        <div class="ia">${A.items.map(it => `<div class="ia-row"><b>#${it.n}</b><div class="ia-bar"><i class="${it.pct < M ? "low" : ""}" data-w="${it.pct}"></i></div><span>${it.pct}%</span></div>`).join("")}</div>
        <h3>By competency (from your TOS)<span class="pro">PRO</span></h3>
        <div class="comp">${A.comps.map(c => `<div class="comp-row"><span>${c.c}${c.pct === null ? "" : `<span class="pill ${c.pct < M ? "re" : ""}">${c.pct < M ? "Reteach" : "Mastered"}</span>`}</span><b>${c.pct === null ? "–" : c.pct + "%"}</b><div class="ia-bar"><i class="${c.pct !== null && c.pct < M ? "low" : ""}" data-w="${c.pct || 0}"></i></div></div>`).join("")}</div>
        <button class="btn" data-tab="rec">Next: class record →</button>`;
    } else if (tab === "rec") {
      h = `<p class="hello">Class record · ${className()} (made up)</p>
        <div class="stats"><div>MPS<b>${A.mps}%</b></div><div>Highest<b>${A.scores[0].s}/10</b></div><div>Lowest<b>${A.scores[A.scores.length - 1].s}/10</b></div></div>
        <div class="rec"><table><thead><tr><th>#</th><th>LEARNER</th><th>SCORE</th></tr></thead><tbody>${A.scores.map((x, i) => `<tr class="${x.you ? "you" : ""}"><td>${i + 1}</td><td>${x.name}</td><td>${x.s}/10</td></tr>`).join("")}</tbody></table></div>
        <p class="sub">In the app, every score is saved to the class the moment it's checked.</p>
        <button class="btn" data-tab="get">Next: do this with your real papers →</button>`;
    } else {
      const notTeacher = S.about.where === "D";
      const dl = (label, kind, main) => `<a class="btn${main ? "" : " soft"}" href="${downloadUrl(kind)}" data-install="${kind}">${label}</a>`;
      const buttons = isAndroid() ? dl("Get it on Android", "android", true) + dl("Download for Windows", "windows", false)
                                  : dl("Download for Windows", "windows", true) + dl("Get it on Android", "android", false);
      h = `<div class="install">
        <span class="logo" style="color:#0A504A"><i>✓</i>QuickCheck</span>
        <h2>${notTeacher ? "Share QuickCheck with your teacher." : "That was QuickCheck. Now do it with your real papers."}</h2>
        <p>${A.n} papers checked, item analysis and class record. Same app, on your phone or laptop.</p>
        <div class="row2">${buttons}</div>
        <small>Free · no account · your first 7 days include Pro (TOS and competency reports)</small>
        <div class="tryprint"><b>Try it for real:</b> after installing, print an answer sheet from the app, shade it, and scan it with your phone.</div>
        <div class="links"><a class="linkish" href="guide.html">Teacher guide</a><a class="linkish" href="demo/">Live demo</a><button class="linkish" data-goto="#pricing">See the prices</button><button class="linkish" data-goto="#buy">How to pay for Pro</button></div>
      </div>`;
    }
    $("qct-res").innerHTML = h;
    show("qct-results");
    requestAnimationFrame(() => setTimeout(() => document.querySelectorAll("#qct-res .ia-bar i").forEach(i => { i.style.width = i.dataset.w + "%"; }), 60));
  }
  function showCheckedSheet() {
    renderSheet(); clearTimers();
    show("qct-sheet"); $("qct-paper").classList.add("checked");
    document.querySelectorAll("#qct .arow.cur, #qct .qlist>li.cur").forEach(el => el.classList.remove("cur"));
    S.set.items.forEach((it, i) => {
      const id = "t" + (i + 1);
      $("qct-mark-" + id).textContent = S.test[id] === it.key ? "✓" : "✗";
      document.querySelector(`#qct .abub[data-id="${id}"][data-k="${it.key}"]`).classList.add("key");
    });
    $("qct-left").textContent = "Checked. Green rings show the right answers.";
    $("qct-sheet-go").disabled = false; $("qct-sheet-go").textContent = "Back to results";
  }

  // ---------- open / close ----------
  function close(anchor) {
    clearTimers(); seen.set();
    document.documentElement.classList.remove("qct-open");
    if (anchor && anchor !== "#top") { const el = document.querySelector(anchor); if (el) el.scrollIntoView(); }
  }
  function open() {
    clearTimers(); S = freshState();
    document.documentElement.classList.add("qct-open");
    show("qct-welcome");
  }

  // ---------- wiring ----------
  function wire() {
    const root = $("qct");
    root.addEventListener("click", e => {
      const t = e.target;
      if (t.closest("[data-close]")) return close();
      const go = t.closest("[data-goto]"); if (go) return close(go.dataset.goto);
      const inst = t.closest("[data-install]"); if (inst) { log("install", { platform: inst.dataset.install }); return; }   // the link itself downloads
      const opt = t.closest(".opt");
      if (opt) {
        S.about[opt.dataset.q] = opt.dataset.k;
        document.querySelectorAll(`#qct .opt[data-q="${opt.dataset.q}"]`).forEach(o => o.setAttribute("aria-pressed", o === opt));
        updateForm();
        const next = ABOUT.find(it => !S.about[it.id]);
        if (next) later(250, () => scrollBox($("qct-about"), $("qct-fq-" + next.id)));
        return;
      }
      const chip = t.closest(".tchip");
      if (chip) { const n = +chip.dataset.item; S.tosMap[n - 1] = (S.tosMap[n - 1] + 1) % S.set.comps.length; S.moved.add(n); return renderTos(); }
      const bub = t.closest(".abub");
      if (bub && !$("qct-paper").classList.contains("checked")) return shade(bub.dataset.id, bub.dataset.k);
      const tab = t.closest("[data-tab]"); if (tab) return showResults(tab.dataset.tab);
      if (t.closest("#qct-see-sheet")) return showCheckedSheet();
    });
    $("qct-start").onclick = () => { renderForm(); show("qct-about"); };
    $("qct-form-go").onclick = startTos;
    $("qct-tos-go").onclick = () => { renderSheet(); show("qct-sheet"); };
    $("qct-sheet-go").onclick = () => ($("qct-paper").classList.contains("checked") ? showResults("score") : runCheck());
    $("qct-ck-skip").onclick = () => showResults("score");
    document.addEventListener("keydown", e => {
      if (!document.documentElement.classList.contains("qct-open")) return;
      if (e.key === "Escape") return close();
      if (!$("qct-sheet").classList.contains("on") || $("qct-paper").classList.contains("checked") || e.ctrlKey || e.metaKey || e.altKey) return;
      const cur = currentItem(), k = e.key.toUpperCase();
      if (cur && LETTERS.includes(k)) { e.preventDefault(); shade(cur.id, k); }
    });
    // "Try the 1-minute test" links anywhere on the site reopen it
    document.addEventListener("click", e => { if (e.target.closest("[data-qct-open]")) { e.preventDefault(); open(); } });
  }

  function init() {
    const html = document.documentElement;
    const wanted = html.classList.contains("qct-want");   // set by the first-visit gate in <head>
    html.classList.remove("qct-want");
    if (typeof TEST_SETS === "undefined") return;           // bank missing: leave the normal site alone
    build(); wire(); S = freshState();
    if (wanted) open();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
