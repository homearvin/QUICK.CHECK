/*
 * skeleton.js — The grey "template" of a page, shown while the real page loads.
 *
 * Instead of a spinning circle, the teacher sees the shape of what is coming:
 * the same cards, in the same places, as soft grey blocks. When the real page
 * arrives it simply fills the shapes in.
 *
 * Used in two places, so the shapes are drawn here once:
 *   - opening.html  — the screen shown while QuickCheck starts
 *   - base.html     — when a menu or dashboard link opens another page
 */
(function () {
  "use strict";

  // A page that opens this fast never flashes a skeleton at all.
  // 400 ms: most pages open faster, and a skeleton shown for a moment reads as flicker.
  var SHOW_AFTER_MS = 400;
  // If opening a page fails silently, don't leave the grey shapes up forever.
  var GIVE_UP_MS = 15000;

  // Links that always open a normal page (never a download), so it is safe
  // to show a skeleton when one is clicked.
  var PAGE_LINKS = ".il-rail a, .nav a, .tabbar a, .stat-link, .action, .step, .rowlink, .cls";

  /* ---- Building blocks ------------------------------------------------- */
  function line(width, height) {
    return '<span class="skel skel-line" style="width:' + width + ';height:' + height + 'px"></span>';
  }

  function chip(size) {
    return '<span class="skel skel-chip" style="width:' + size + 'px;height:' + size + 'px"></span>';
  }

  function repeat(count, draw) {
    var html = "";
    for (var i = 0; i < count; i++) html += draw(i);
    return html;
  }

  function card(inner, extraClass) {
    return '<div class="ui-card skel-card ' + (extraClass || "") + '">' + inner + "</div>";
  }

  function cardHead() {
    return '<div class="skel-head">' + line("38%", 13) + line("26%", 9) + "</div>";
  }

  function listRow() {
    return '<div class="skel-row">' + chip(38) +
      '<div class="skel-grow">' + line("55%", 12) + line("35%", 9) + "</div></div>";
  }

  function topbar() {
    return '<div class="skel-top"><div class="skel-grow">' + line("90px", 9) + line("190px", 20) +
      '</div><span class="skel skel-pill"></span></div>';
  }

  /* ---- Whole pages ----------------------------------------------------- */
  // Same 12-column grid as dashboard.html, in the same order: the dark
  // "what to do next" panel and the waiting card, a row of number tiles, then
  // recent checking + quick actions, and the two chart cards.
  function grid(inner) {
    return '<div class="ui-grid skel-grid">' + inner + "</div>";
  }

  function span(columns, inner, extraClass) {
    return card(inner, "ui-c" + columns + " " + (extraClass || ""));
  }

  function bars(count) {
    return repeat(count, function () {
      return '<div class="skel-bar">' + line("60%", 11) + '<span class="skel skel-track"></span></div>';
    });
  }

  function dashboard() {
    var next = span(8, line("90px", 9) + line("72%", 22) + line("88%", 10) + line("46%", 10) +
      '<div class="skel-split" style="margin-top:18px">' + line("150px", 38) + line("110px", 12) + "</div>",
      "skel-dark skel-tall");

    var waiting = span(4, cardHead() + repeat(2, listRow));

    var tiles = repeat(4, function () {
      return span(3, '<div class="skel-split">' + line("55%", 10) + chip(30) + "</div>" +
        line("38%", 24) + line("62%", 9), "skel-kpi");
    });

    var recent = span(8, cardHead() + repeat(3, listRow));

    var quickActions = span(4, cardHead() + '<div class="skel-actions">' + repeat(4, function () {
      return '<div class="skel-action">' + chip(34) +
        '<div class="skel-grow">' + line("62%", 12) + line("82%", 9) + "</div></div>";
    }) + "</div>");

    var performance = span(7, cardHead() + bars(4));
    var items = span(5, cardHead() + bars(4));

    return topbar() + grid(next + waiting + tiles + recent + quickActions + performance + items);
  }

  // Any other page: a title and a couple of list cards, full width.
  function page() {
    return topbar() + grid(span(12, cardHead() + repeat(5, listRow)) +
                           span(12, cardHead() + repeat(2, listRow)));
  }

  function sidebar() {
    var widths = [62, 48, 55, 70, 52, 58, 45, 50];
    // Not ".brand": on small screens that class hides every <span> inside it.
    return '<div class="skel-brand">' + chip(36) +
      '<div class="skel-grow skel-side-text">' + line("75%", 13) + line("45%", 8) + "</div></div>" +
      repeat(widths.length, function (i) {
        return '<div class="skel-nav">' + chip(18) + line(widths[i] + "%", 10) + "</div>";
      });
  }

  var VIEWS = { dashboard: dashboard, page: page };

  /* ---- Showing it when a link opens another page ----------------------- */
  var showTimer = null;
  var giveUpTimer = null;

  function show(view) {
    var main = document.querySelector(".main");
    if (!main || document.body.classList.contains("is-loading")) return;

    var root = document.createElement("div");
    root.className = "skel-root";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = VIEWS[view]();
    main.appendChild(root);
    main.setAttribute("aria-busy", "true");
    document.body.classList.add("is-loading");
    window.scrollTo(0, 0);
    giveUpTimer = setTimeout(hide, GIVE_UP_MS);
  }

  function hide() {
    clearTimeout(showTimer);
    clearTimeout(giveUpTimer);
    document.body.classList.remove("is-loading");
    var main = document.querySelector(".main");
    if (main) main.removeAttribute("aria-busy");
    document.querySelectorAll(".skel-root").forEach(function (el) { el.remove(); });
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest && e.target.closest(PAGE_LINKS);
    if (!link || link.target || link.hasAttribute("download")) return;

    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.href === location.href) return;

    var view = url.pathname === "/" ? "dashboard" : "page";
    clearTimeout(showTimer);
    showTimer = setTimeout(function () { show(view); }, SHOW_AFTER_MS);
  });

  // Coming back with the Back button can restore this page exactly as it was
  // left — skeleton included — so clear it away.
  window.addEventListener("pageshow", hide);

  window.QCSkeleton = { dashboard: dashboard, page: page, sidebar: sidebar };
}());
