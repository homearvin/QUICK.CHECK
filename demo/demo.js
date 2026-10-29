// QuickCheck's click-through demo on the website (made by scripts/build_web_demo.py).
//
// Every page here is a screen the real app drew. This script makes them behave:
//  - a button the demo recorded (Check the sample papers, Save on a paper, Save) opens
//    the screen that came next;
//  - anything else that would save shows a short note instead;
//  - tips closed, the walkthrough finished and the "Try these" ticks are remembered for
//    this visit (sessionStorage), so the demo feels like one app;
//  - End demo goes back to the QuickCheck page.
(function () {
  "use strict";

  var TRANSITIONS = {
 "s0": {
  "/tests/sample-science-quiz/check/samples": "../s1/tests_sample-science-quiz_check.html"
 },
 "s1": {
  "/tests/sample-science-quiz/glance/p222cdb862e8621c0": "../s2a/tests_sample-science-quiz_glance_p8cd5be55cbb73fd9--back-check.html",
  "/tests/sample-science-quiz/glance/p8cd5be55cbb73fd9": "../s2b/tests_sample-science-quiz_glance_p222cdb862e8621c0--back-check.html"
 },
 "s2a": {
  "/tests/sample-science-quiz/glance/p8cd5be55cbb73fd9": "../s3/tests_sample-science-quiz_check.html"
 },
 "s2b": {
  "/tests/sample-science-quiz/glance/p222cdb862e8621c0": "../s3/tests_sample-science-quiz_check.html"
 },
 "s3": {
  "/tests/sample-science-quiz/done/save": "../s4/tests_sample-science-quiz_check.html"
 }
};
  var WEBSITE = "https://homearvin.github.io/QUICK.CHECK/";
  var PAGE = window.QC_DEMO_PAGE || { stage: "s0", url: "/" };
  var KEY = "qcWebDemo";

  // ---- what this visit has done --------------------------------------------
  function load() {
    try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(state) {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  var state = load();
  state.tips = state.tips || [];
  state.goals = state.goals || [];

  function reach(goal) {
    if (state.goals.indexOf(goal) < 0) { state.goals.push(goal); save(state); }
  }

  // Opening these pages counts towards a goal, as in the online demo (demo.py).
  var path = PAGE.url.split("?")[0];
  if (/\/key$/.test(path)) reach("key");
  if (path === "/sheets") reach("print");
  if (/^\/results\/.+|\/analysis$|\/competencies$/.test(path)) reach("results");
  if (PAGE.stage !== "s0") reach("upload");
  if (PAGE.stage === "s4") reach("save");

  // ---- before guide.js runs: the walkthrough and tips already dealt with --------
  var asked = /[?&]tour=1/.test(location.search);
  var tour = document.getElementById("qcTourData");
  if (tour && state.tourDone && !asked) tour.remove();
  document.querySelectorAll("[data-guide-tip]").forEach(function (tip) {
    if (state.tipsOff || state.tips.indexOf(tip.getAttribute("data-guide-tip")) >= 0) tip.remove();
  });

  // ---- notes ----------------------------------------------------------------
  function note(text) {
    if (window.qcNotice) { window.qcNotice(text); return; }
    if (window.qcToast) { window.qcToast(text, "warn"); return; }
    var box = document.createElement("div");
    box.className = "qc-webdemo-note";
    box.setAttribute("role", "status");
    box.textContent = text;
    box.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2000;" +
      "max-width:min(92vw,460px);padding:12px 16px;border-radius:12px;background:#102b28;color:#fff;" +
      "font:600 14px/1.45 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25)";
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 4200);
  }
  var REAL_APP = "In the demo this is only shown. In QuickCheck on your computer it is saved.";

  // ---- what a form would have done ------------------------------------------
  function actionOf(form) {
    return (form.getAttribute("data-demo-action") || PAGE.url).split("?")[0];
  }

  function go(form) {
    var action = actionOf(form);
    var data = new FormData(form);
    var moves = TRANSITIONS[PAGE.stage] || {};
    if (moves[action]) { location.href = moves[action]; return; }

    if (action === "/demo/end") {
      try { sessionStorage.removeItem(KEY); } catch (e) {}
      location.href = WEBSITE + "?demo=done#pricing";
      return;
    }
    if (action === "/guide/settings") {
      var choice = data.get("do");
      if (choice === "tour") { state.tourDone = false; save(state); location.href = "index.html?tour=1"; return; }
      if (choice === "off") state.tipsOff = true;
      if (choice === "on") state.tipsOff = false;
      if (choice === "show_all") { state.tipsOff = false; state.tips = []; }
      save(state);
      note(choice === "off" ? "Tips are off." : "Tips are back on.");
      return;
    }
    if (action === "/classes/new") {
      reach("class");
      note("In QuickCheck your class is saved here. The demo keeps its sample class so you can carry on.");
      setTimeout(function () { location.href = "classes.html"; }, 2200);
      return;
    }
    if (/\/done\/save$/.test(action)) {
      note("In the demo, fix the papers marked Fix first, then Save. (QuickCheck lets you save the ready ones any time.)");
      return;
    }
    if (/\/glance\//.test(action)) {
      note("In the demo, open the papers marked Fix, choose the answer, then Save.");
      return;
    }
    note(REAL_APP);
  }

  // Forms: after confirm.js / busy.js have had their say (they cancel, then call form.submit()).
  window.addEventListener("submit", function (e) {
    if (e.defaultPrevented) return;
    e.preventDefault();
    go(e.target);
  });
  HTMLFormElement.prototype.submit = function () { go(this); };
  if (HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function () { go(this); };
  }

  // Links to screens the demo has not got.
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[data-demo-missing]");
    if (!link) return;
    e.preventDefault();
    note("That screen works in QuickCheck on your computer. The demo shows the main ones.");
  });

  // ---- the page scripts' own calls to the server -----------------------------
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    var method = ((init && init.method) || "GET").toUpperCase();
    var tip = url.match(/\/guide\/tip\/([^/]+)\/hide/);
    if (tip) { state.tips.push(tip[1]); save(state); return Promise.resolve(new Response(null, { status: 204 })); }
    if (/\/guide\/tour\/done/.test(url)) {
      state.tourDone = true; save(state); reach("tour");
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (method !== "GET") {
      note("Uploading your own photos works in QuickCheck on your computer. Here, use “Check the 8 sample papers”.");
      return Promise.resolve(new Response("{}", { status: 503, headers: { "Content-Type": "application/json" } }));
    }
    if (url.charAt(0) === "/" && url.indexOf("/static/") !== 0) {
      return Promise.resolve(new Response("{}", { status: 404, headers: { "Content-Type": "application/json" } }));
    }
    return realFetch ? realFetch(input, init) : Promise.reject(new Error("offline"));
  };

  // ---- the "Try these" list ---------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    var items = document.querySelectorAll("#qcDemoGuide li[data-goal]");
    if (!items.length) return;
    var done = 0, next = null;
    items.forEach(function (li) {
      var goal = li.getAttribute("data-goal");
      if (state.goals.indexOf(goal) >= 0 && !li.classList.contains("is-done")) {
        li.classList.add("is-done");
        li.querySelector(".qc-demo-dot").textContent = "✓";
      }
      li.classList.remove("is-next");
      if (li.classList.contains("is-done")) done += 1;
      else if (!next) next = li;
    });
    if (next) next.classList.add("is-next");
    var count = document.querySelector("[data-demo-done]");
    if (count) count.textContent = done;
  });
}());
