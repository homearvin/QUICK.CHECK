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
 *
 * The new look (body.qc-new, phone and laptop; Arvin 11 Nov 2026: "the skeleton isn't
 * accurate") draws each kind of page from the SAME parts the real page uses (.ui-head,
 * .qc-list/.qc-row, .qc-tiles/.qc-tile, .qc-stats, .qc-rgroup, .st-desk), so phone.css and
 * desktop.css place the grey shapes exactly where the page will appear: Home (banner, To do,
 * three numbers, Menu), Tests and Classes (cards on a laptop, rows on a phone), Results (the
 * tools and the classes), Settings (groups, and the form beside them on a laptop), a test's own
 * page, a result's or a class's page (tabs, numbers, rows), and any other page.
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
  var PAGE_LINKS = ".il-rail a, .nav a, .tabbar a, .stat-link, .action, .step, .rowlink, .cls, " +
    "a.qc-row, a.qc-tile, a.qc-slide, a.qc-side-row, a.qc-side-title, a.rview, a.il-back, .qc-pane a";

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

  /* ---- The new look: each page from its own parts ---------------------- */
  var wide = function () { return window.matchMedia && window.matchMedia("(min-width: 861px)").matches; };

  function head(back) {
    return '<div class="ui-head qc-skel-head">' + (back ? '<span class="skel qc-skel-round"></span>' : "") +
      '<div class="skel-grow">' + line("90px", 12) + line("min(320px, 70%)", 30) + "</div></div>";
  }

  function sec(width) { return '<p class="qc-sec">' + line(width || "90px", 15) + "</p>"; }

  function row(meter) {
    return '<div class="qc-row' + (meter ? " qc-rrow" : "") + '"><span class="skel qc-skel-ico"></span>' +
      '<span class="qc-row-t">' + line("58%", 15) + line("34%", 11) + "</span>" +
      (meter ? '<span class="skel qc-rmeter"></span><span class="skel qc-skel-chip"></span>' : "") + "</div>";
  }

  function rows(count, meter) { return '<div class="qc-list">' + repeat(count, function () { return row(meter); }) + "</div>"; }

  function tile() {
    return '<div class="qc-tile">' + chip(30) + line("55%", 16) + line("75%", 11) + "</div>";
  }

  function tiles(count) { return '<div class="qc-tiles">' + repeat(count, tile) + "</div>"; }

  function numbers() {
    return '<div class="qc-stats">' + repeat(3, function () {
      return "<div>" + line("44%", 30) + line("70%", 11) + "</div>";
    }) + "</div>";
  }

  function tabs(count) {
    return '<div class="qc-skel-tabs">' + repeat(count, function () { return '<span class="skel qc-skel-tab"></span>'; }) + "</div>";
  }

  function home() {
    return head() + '<div class="qc-phome"><span class="skel qc-skel-banner"></span>' +
      sec("70px") + rows(1) + numbers() + sec("70px") + tiles(6) + "</div>";
  }

  // Tests and Classes: cards three to a row on a laptop (as the real list), rows on a phone.
  function list(tools) {
    return head() + '<div class="qc-stack">' + tools + (wide() ? tiles(6) : rows(5)) + "</div>";
  }

  function tests() {
    return list('<div class="qc-filterbar"><span class="skel qc-skel-filter"></span><span class="skel qc-skel-filter"></span></div>');
  }

  function classes() { return list('<span class="skel qc-skel-field"></span>'); }

  function results() {
    var group = function () {
      return '<section class="qc-rgroup"><div class="qc-rgroup-h">' + line("200px", 20) + line("180px", 12) +
        "</div>" + rows(3, true) + "</section>";
    };
    return head() + '<div class="qc-rtools">' + repeat(3, function () { return '<span class="skel qc-skel-field"></span>'; }) +
      '</div><div class="qc-rgroups">' + group() + group() + "</div>";
  }

  function settings() {
    var form = '<div class="ui-card qc-skel-form">' + line("120px", 18) +
      repeat(3, function () { return line("80px", 11) + '<span class="skel qc-skel-field"></span>'; }) + "</div>";
    return head() + '<div class="st-desk"><div class="qc-stack qc-settings">' + rows(1) + sec() + rows(2) +
      sec() + rows(3) + "</div>" + (wide() ? form : "") + "</div>";
  }

  function testPage() { return head(true) + '<div class="qc-stack">' + rows(4) + rows(2) + "</div>"; }

  function detail() { return head(true) + '<div class="qc-stack">' + tabs(5) + numbers() + rows(6) + "</div>"; }

  function other() { return head(true) + '<div class="qc-stack">' + rows(5) + "</div>"; }

  // The new look's frame, for the startup screen (opening.html): the laptop's icon sidebar (the
  // logo, Check papers, four places, four at the bottom), and the phone's top and bottom bars.
  // desktop.css shows the sidebar from 861px; phone.css and iconlook.css show the bars below it.
  function pane() {
    var item = function (cls) { return '<span class="skel qc-skel-navi ' + (cls || "") + '"></span>'; };
    return item("is-brand") + item("is-check") + repeat(4, function () { return item(); }) +
      '<span class="qc-skel-navfoot">' + repeat(4, function () { return item(); }) + "</span>";
  }

  function phoneTop() {
    return chip(40) + line("120px", 18) + '<span class="skel-grow"></span>' + chip(40) + chip(40) + chip(40);
  }

  function phoneBar() {
    return repeat(5, function (i) {
      return '<span class="qc-skel-baritem' + (i === 2 ? " is-check" : "") + '">' + chip(i === 2 ? 56 : 24) + line("36px", 8) + "</span>";
    });
  }

  // Which shape a link's page has, from its address.
  function viewFor(path) {
    if (!document.body.classList.contains("qc-new")) return path === "/" ? "dashboard" : "page";
    if (path === "/") return "home";
    if (path === "/tests") return "tests";
    if (path === "/classes") return "classes";
    if (path === "/results") return "results";
    if (path === "/settings") return "settings";
    if (/^\/tests\/[^\/]+$/.test(path) && path !== "/tests/new") return "testPage";
    if (/^\/results\/[^\/]+$/.test(path) || /^\/tests\/[^\/]+\/(analysis|saved|competencies|report|accuracy)$/.test(path) ||
        /^\/classes\/[^\/]+\/(preview|progress|interventions)$/.test(path)) return "detail";
    return "other";
  }

  var VIEWS = { dashboard: dashboard, page: page, home: home, tests: tests, classes: classes, results: results,
                settings: settings, testPage: testPage, detail: detail, other: other };

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

  // Start the skeleton for a page about to open (after SHOW_AFTER_MS, so a fast page never flashes it).
  // Downloads, other sites, the same page and a jump within it never show one.
  function start(href) {
    var url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (/\.(pdf|xlsx|csv|zip|png)$/i.test(url.pathname)) return;
    var view = viewFor(url.pathname);
    clearTimeout(showTimer);
    showTimer = setTimeout(function () { show(view); }, SHOW_AFTER_MS);
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest && e.target.closest(PAGE_LINKS);
    if (!link || !link.href || link.target || link.hasAttribute("download") || link.hasAttribute("data-download")) return;
    start(link.href);
  });

  // Coming back with the Back button can restore this page exactly as it was
  // left — skeleton included — so clear it away.
  window.addEventListener("pageshow", hide);

  // start: for pane.js, whose sidebar opens a page itself after it has closed.
  window.QCSkeleton = { dashboard: dashboard, page: page, sidebar: sidebar, start: start,
                        home: home, pane: pane, phoneTop: phoneTop, phoneBar: phoneBar };
}());
