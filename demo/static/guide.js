// Guidance on the page (guidance.py, templates/_guide.html):
//  - "Got it" on a tip closes it for good, without reloading the page;
//  - the walkthrough: one stop per place on the screen, a light on that place
//    and a small card beside it. Next / Back / Skip, or the arrow keys and Esc.
//  - the demo's "Try these" list remembers being folded away (this tab only).
(function () {
  "use strict";

  function post(url, csrf) {
    return fetch(url, {
      method: "POST", credentials: "same-origin",
      headers: { "X-CSRF-Token": csrf, "X-Requested-With": "fetch" }
    }).catch(function () {});
  }

  // ---- Tips -------------------------------------------------------------
  document.querySelectorAll("form[data-guide-hide]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var tip = form.closest("[data-guide-tip]");
      fetch(form.action, {
        method: "POST", credentials: "same-origin", body: new FormData(form),
        headers: { "X-Requested-With": "fetch" }
      }).catch(function () {});
      if (tip) {
        tip.classList.add("is-leaving");
        setTimeout(function () { tip.remove(); }, 160);
      }
    });
  });

  // ---- Demo guide: folded or open, remembered for this tab ----------------
  var demoGuide = document.getElementById("qcDemoGuide");
  if (demoGuide) {
    var FOLD_KEY = "qcDemoGuideFolded";
    try {
      var folded = sessionStorage.getItem(FOLD_KEY);
      // A phone starts folded: the list would cover the page.
      if (folded === "1" || (folded === null && window.matchMedia("(max-width: 860px)").matches)) {
        demoGuide.removeAttribute("open");
      }
    } catch (err) { /* no storage: just stay open */ }
    demoGuide.addEventListener("toggle", function () {
      try { sessionStorage.setItem(FOLD_KEY, demoGuide.open ? "0" : "1"); } catch (err) {}
    });
  }

  // ---- Walkthrough ------------------------------------------------------
  var dataEl = document.getElementById("qcTourData");
  if (!dataEl) return;
  var tour;
  try { tour = JSON.parse(dataEl.textContent); } catch (err) { return; }
  var steps = tour.steps || [];
  if (!steps.length) return;

  var GAP = 14;           // between the lit place and the card
  var PAD = 6;            // light around the place
  var at = 0;
  var lastFocus = document.activeElement;

  var layer = document.createElement("div");
  layer.className = "qc-tour";
  layer.innerHTML =
    '<div class="qc-tour-spot" aria-hidden="true"></div>' +
    '<div class="qc-tour-card" role="dialog" aria-modal="true" aria-labelledby="qcTourTitle" aria-describedby="qcTourText">' +
    '  <p class="qc-tour-count"></p>' +
    '  <h2 id="qcTourTitle"></h2>' +
    '  <p id="qcTourText"></p>' +
    '  <div class="qc-tour-acts">' +
    '    <button type="button" class="qc-tour-skip">Skip</button>' +
    '    <span class="qc-tour-dots" aria-hidden="true"></span>' +
    '    <button type="button" class="btn ghost il-mini qc-tour-back">Back</button>' +
    '    <button type="button" class="btn primary il-mini qc-tour-next">Next</button>' +
    '  </div>' +
    '</div>';
  var spot = layer.querySelector(".qc-tour-spot");
  var card = layer.querySelector(".qc-tour-card");
  var countEl = layer.querySelector(".qc-tour-count");
  var titleEl = layer.querySelector("#qcTourTitle");
  var textEl = layer.querySelector("#qcTourText");
  var dotsEl = layer.querySelector(".qc-tour-dots");
  var backBtn = layer.querySelector(".qc-tour-back");
  var nextBtn = layer.querySelector(".qc-tour-next");
  var skipBtn = layer.querySelector(".qc-tour-skip");

  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    var cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none";
  }

  function targetOf(step) {
    for (var i = 0; i < (step.targets || []).length; i++) {
      var found = document.querySelectorAll(step.targets[i]);
      for (var j = 0; j < found.length; j++) {
        if (visible(found[j])) return found[j];
      }
    }
    return null;
  }

  function place() {
    var step = steps[at];
    var target = targetOf(step);
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    var cw = card.offsetWidth, ch = card.offsetHeight;
    var left, top;
    if (!target) {
      layer.classList.add("is-centred");
      left = (vw - cw) / 2;
      top = Math.max(16, (vh - ch) / 2);
    } else {
      layer.classList.remove("is-centred");
      var r = target.getBoundingClientRect();
      spot.style.left = (r.left - PAD) + "px";
      spot.style.top = (r.top - PAD) + "px";
      spot.style.width = (r.width + PAD * 2) + "px";
      spot.style.height = (r.height + PAD * 2) + "px";
      // Beside the place when there is room (the left strip), else below or above it.
      if (r.right + GAP + cw <= vw - 8) {
        left = r.right + GAP;
        top = r.top + r.height / 2 - ch / 2;
      } else if (r.bottom + GAP + ch <= vh - 8) {
        left = r.left + r.width / 2 - cw / 2;
        top = r.bottom + GAP;
      } else {
        left = r.left + r.width / 2 - cw / 2;
        top = r.top - GAP - ch;
      }
    }
    card.style.left = Math.round(Math.min(Math.max(8, left), vw - cw - 8)) + "px";
    card.style.top = Math.round(Math.min(Math.max(8, top), vh - ch - 8)) + "px";
  }

  function show(index) {
    at = index;
    var step = steps[at];
    var target = targetOf(step);
    if (target && target.scrollIntoView) target.scrollIntoView({ block: "nearest" });
    countEl.textContent = (at + 1) + " of " + steps.length;
    titleEl.textContent = step.title;
    textEl.textContent = step.text;
    dotsEl.innerHTML = steps.map(function (_s, i) {
      return '<i class="' + (i === at ? "is-on" : "") + '"></i>';
    }).join("");
    backBtn.hidden = at === 0;
    var last = at === steps.length - 1;
    nextBtn.textContent = last ? "Finish" : (at === 0 ? "Show me" : "Next");
    skipBtn.hidden = last;
    place();
    nextBtn.focus();
  }

  function close() {
    post(tour.done, tour.csrf);
    layer.remove();
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", place);
    window.removeEventListener("scroll", place, true);
    // "?tour=1" (Settings → watch again) should not start it again on reload.
    if (/[?&]tour=1/.test(location.search) && history.replaceState) {
      history.replaceState(null, "", location.pathname);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); nextBtn.click(); return; }
    if (e.key === "ArrowLeft" && at > 0) { e.preventDefault(); show(at - 1); return; }
    if (e.key === "Tab") {
      // Keep the keyboard inside the card while it is open.
      var items = Array.prototype.filter.call(card.querySelectorAll("button"), function (b) { return !b.hidden; });
      var first = items[0], lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastItem.focus(); }
      else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); first.focus(); }
    }
    // Stop the page's own keys (1–5, /, M) while the walkthrough is open.
    e.stopPropagation();
  }

  nextBtn.addEventListener("click", function () {
    if (at === steps.length - 1) close(); else show(at + 1);
  });
  backBtn.addEventListener("click", function () { if (at > 0) show(at - 1); });
  skipBtn.addEventListener("click", close);

  function start() {
    document.body.appendChild(layer);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    show(0);
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
}());
