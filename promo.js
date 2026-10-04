/* The World Teachers' Day offer: buy one licence, get a second one free.

   Every page that loads this file shows, while the offer is running:
     - a pop-up, once per visit — close it with ×, "Not now", Esc, or a click
       outside it;
     - a slim bar at the top that stays while the visitor scrolls, counting down.
       Tapping the bar opens the pop-up again;
     - a small flag on the Solo card in the pricing table, so the offer is still
       visible to someone who closed both and scrolled down to buy.

   The dates are two fixed moments for everyone, so the countdown reads the same
   on every phone and computer and never restarts for a new visitor. Before it
   starts and after it ends, this file does nothing at all: no pop-up, no bar, no
   flag, and the prices in the page stand on their own.

   TO CHANGE OR END THE OFFER: edit STARTS, ENDS and the wording below. To end it
   early, set ENDS to a moment that has passed. Nothing else on the site needs
   touching — the pricing table is not rewritten by this file, only flagged. */
(function () {
  "use strict";

  var STARTS = Date.parse("2026-10-04T00:00:00+08:00");   // 4 October 2026, Philippine time
  var ENDS = Date.parse("2026-10-11T23:59:59+08:00");     // end of 11 October 2026
  var SEEN = "qc-teachers-day-seen";                      // one pop-up per visit, not per page

  var EYEBROW = "World Teachers' Day · 5 October";
  var HEADLINE = "Buy 1, get 1 free";
  var PRICE = "₱499";
  var LEAD = "Two licence keys for the price of one. Keep the second, or give it to a "
           + "teacher you check papers with.";
  var FACTS = ["2 keys, 1 computer each", "The complete app, every feature", "Lifetime — nothing renews"];
  var DATES = "4–11 October 2026";
  var CTA = "Claim the offer";
  var BAR_LABEL = "Teachers' Day: buy 1, get 1 free — " + PRICE + " for 2 keys";

  function now() { return Date.now(); }
  function running() { return now() >= STARTS && now() <= ENDS; }

  function remembered(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function remember(key) {
    try { window.sessionStorage.setItem(key, "1"); } catch (e) { /* private window: show it again */ }
  }

  function whenReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* "6d 04h 12m 09s" — the exact time left, for the pop-up. */
  function exactLeft() {
    var ms = Math.max(0, ENDS - now());
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return (d ? d + "d " : "") + pad(h) + "h " + pad(m) + "m " + pad(s % 60) + "s";
  }

  /* "6 days left", "11 hours left" — the plainer version, for the bar. */
  function roughLeft() {
    var ms = Math.max(0, ENDS - now());
    var hours = Math.floor(ms / 3600000);
    if (hours >= 48) return Math.floor(hours / 24) + " days left";
    if (hours >= 1) return hours + (hours === 1 ? " hour left" : " hours left");
    var minutes = Math.max(1, Math.round(ms / 60000));
    return minutes + (minutes === 1 ? " minute left" : " minutes left");
  }

  function styles() {
    var css = [
      /* The page's own colours, so the offer follows light and dark mode with it. */
      /* Above the page's own header (z-index 80), which is sticky at the top too:
         without this they would sit on the same line and the header would win. */
      ".qcp-bar{position:sticky; top:0; z-index:90; display:flex; align-items:center;",
      "  justify-content:center; gap:12px; flex-wrap:wrap; width:100%; padding:10px 16px;",
      "  border:0; border-bottom:1px solid rgba(255,255,255,.18); background:var(--teal-deep,#0f4b47);",
      "  color:#fff; font:inherit; font-size:14px; font-weight:700; cursor:pointer; text-align:center;}",
      ".qcp-bar:hover{background:var(--teal-night,#0a2f2c);}",
      ".qcp-bar b{background:#ffd54a; color:#10201f; padding:2px 9px; border-radius:999px; font-size:13px;}",
      ".qcp-bar span{font-weight:600; opacity:.92;}",
      ".qcp-bar u{text-decoration:none; border-bottom:1.5px solid rgba(255,255,255,.6); padding-bottom:1px;}",

      ".qcp-veil{position:fixed; inset:0; z-index:200; display:flex; align-items:center;",
      "  justify-content:center; padding:18px; background:rgba(8,32,30,.55); backdrop-filter:blur(2px);}",
      ".qcp-card{position:relative; width:100%; max-width:430px; max-height:92vh; overflow:auto;",
      "  background:var(--paper,#fff); color:var(--ink,#10201f); border-radius:var(--r-l,26px);",
      "  box-shadow:var(--shadow-l,0 30px 70px rgba(0,0,0,.35)); padding:30px 26px 24px; text-align:center;}",
      /* The padding keeps the date clear of the × button in the corner. */
      ".qcp-eyebrow{margin:0 0 10px; padding:0 26px; font-size:12px; font-weight:800;",
      "  letter-spacing:.14em; text-transform:uppercase; color:var(--teal,#12a594);}",
      ".qcp-card h2{margin:0; font-size:30px; line-height:1.15; letter-spacing:-.02em;}",
      ".qcp-price{display:inline-flex; align-items:baseline; gap:8px; margin:14px 0 0; padding:8px 18px;",
      "  border-radius:999px; background:#ffd54a; color:#10201f; font-size:27px; font-weight:800;}",
      ".qcp-price span{font-size:13px; font-weight:700; letter-spacing:.02em;}",
      ".qcp-lead{margin:14px 0 0; font-size:15px; line-height:1.55; color:var(--muted,#5d716f);}",
      ".qcp-facts{margin:16px 0 0; padding:0; list-style:none; display:grid; gap:7px; text-align:left;}",
      ".qcp-facts li{display:flex; gap:9px; align-items:flex-start; font-size:14px;}",
      ".qcp-facts svg{width:17px; height:17px; flex:0 0 auto; margin-top:2px; color:var(--teal,#12a594);}",
      ".qcp-when{margin:16px 0 0; padding:11px 12px; border-radius:14px; background:var(--teal-wash,#eefaf7);",
      "  border:1px solid var(--teal-edge,#bfe9df); font-size:13.5px; color:var(--teal-deep,#0f4b47);}",
      ".qcp-when b{font-variant-numeric:tabular-nums;}",
      ".qcp-go{display:block; margin:18px 0 0; padding:15px 20px; border-radius:14px;",
      "  background:var(--teal-deep,#0f4b47); color:#fff; font-size:16px; font-weight:800;",
      "  text-decoration:none;}",
      ".qcp-go:hover{background:var(--teal-night,#0a2f2c);}",
      ".qcp-later{display:block; width:100%; margin:10px 0 0; padding:8px; border:0; background:none;",
      "  font:inherit; font-size:14px; font-weight:600; color:var(--muted,#5d716f); cursor:pointer;}",
      ".qcp-later:hover{color:var(--ink,#10201f);}",
      ".qcp-x{position:absolute; top:12px; right:12px; width:36px; height:36px; border-radius:50%;",
      "  border:0; background:var(--panel,#f5f9f9); color:var(--muted,#5d716f); font-size:19px;",
      "  line-height:1; cursor:pointer;}",
      ".qcp-x:hover{background:var(--line-2,#eef3f3); color:var(--ink,#10201f);}",

      /* The flag on the Solo card, for someone who closed the pop-up and scrolled on. */
      ".qcp-flag{display:inline-block; margin:0 0 10px; padding:5px 12px; border-radius:999px;",
      "  background:#ffd54a; color:#10201f; font-size:12.5px; font-weight:800;}",

      /* On a phone the bar would take two tall lines and keep a tenth of the screen
         for a week, so it is tightened and the written link drops out — the whole
         bar is a button, and the yellow flag is the invitation. */
      "@media (max-width:520px){.qcp-bar{gap:8px; padding:8px 12px; font-size:12.5px;}",
      "  .qcp-bar b{font-size:12px; padding:2px 8px;} .qcp-bar u{display:none;}}",
      "@media (max-width:480px){.qcp-card{padding:26px 20px 20px;} .qcp-card h2{font-size:26px;}",
      "  .qcp-eyebrow{font-size:11px; letter-spacing:.07em; padding:0 24px;}}",
      "@media (prefers-reduced-motion:no-preference){.qcp-card{animation:qcp-in .22s ease-out;}",
      "  @keyframes qcp-in{from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:none;}}}"
    ].join("");
    var tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  var veil = null, bar = null, lastFocus = null, ticker = null;

  function tick() {
    if (!running()) { stop(); return; }
    var exact = document.getElementById("qcp-exact");
    if (exact) exact.textContent = exactLeft();
    var rough = document.getElementById("qcp-rough");
    if (rough) rough.textContent = roughLeft();
  }

  function stop() {
    if (ticker) { clearInterval(ticker); ticker = null; }
    closePopup();
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = null;
    var header = document.querySelector("header");
    if (header) header.style.top = "";          // the page's header goes back to the very top
    var flag = document.querySelector(".qcp-flag");
    if (flag && flag.parentNode) flag.parentNode.removeChild(flag);
  }

  /* The page's header is sticky at the top as well, so it is asked to stop just
     below the offer bar instead of underneath it. The bar gets taller when its
     text wraps on a narrow phone, so this is measured, never assumed. */
  function fitHeader() {
    var header = document.querySelector("header");
    if (!header || !bar) return;
    var wanted = bar.offsetHeight + "px";
    if (header.style.top !== wanted) header.style.top = wanted;
  }

  function check(label) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true">'
         + '<path d="M20 6L9 17l-5-5"/></svg><span>' + label + "</span>";
  }

  function openPopup() {
    if (veil || !running()) return;
    lastFocus = document.activeElement;
    veil = document.createElement("div");
    veil.className = "qcp-veil";
    veil.innerHTML =
      '<div class="qcp-card" role="dialog" aria-modal="true" aria-labelledby="qcp-title">'
      + '<button class="qcp-x" type="button" aria-label="Close">&times;</button>'
      + '<p class="qcp-eyebrow">' + EYEBROW + "</p>"
      + '<h2 id="qcp-title">' + HEADLINE + "</h2>"
      + '<p class="qcp-price">' + PRICE + "<span>for 2 keys</span></p>"
      + '<p class="qcp-lead">' + LEAD + "</p>"
      + '<ul class="qcp-facts">'
      + FACTS.map(function (f) { return "<li>" + check(f) + "</li>"; }).join("")
      + "</ul>"
      + '<p class="qcp-when">Promo runs ' + DATES + " · <b id=\"qcp-exact\">" + exactLeft() + "</b> left</p>"
      + '<a class="qcp-go" href="#buy">' + CTA + "</a>"
      + '<button class="qcp-later" type="button">Not now</button>'
      + "</div>";

    veil.addEventListener("click", function (event) {
      if (event.target === veil) closePopup();            // a click outside the card
    });
    veil.querySelector(".qcp-x").addEventListener("click", closePopup);
    veil.querySelector(".qcp-later").addEventListener("click", closePopup);
    veil.querySelector(".qcp-go").addEventListener("click", closePopup);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(veil);
    remember(SEEN);
    var go = veil.querySelector(".qcp-go");
    if (go && go.focus) go.focus();
  }

  function closePopup() {
    if (!veil) return;
    document.removeEventListener("keydown", onKey);
    if (veil.parentNode) veil.parentNode.removeChild(veil);
    veil = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(event) {
    if (event.key === "Escape" || event.key === "Esc") closePopup();
  }

  function showBar() {
    bar = document.createElement("button");
    bar.type = "button";
    bar.className = "qcp-bar";
    bar.setAttribute("aria-label", BAR_LABEL + ". See the offer.");   // the written link hides on a phone
    bar.innerHTML = "<b>Buy 1, get 1 free</b>"
      + "<span>" + PRICE + " for 2 licence keys · <span id=\"qcp-rough\">" + roughLeft() + "</span></span>"
      + "<u>See the offer</u>";
    bar.addEventListener("click", openPopup);
    document.body.insertBefore(bar, document.body.firstChild);
    // Measured again once the page has settled: before the web fonts arrive the
    // bar's text wraps differently, and a height read too early is the wrong one.
    fitHeader();
    window.requestAnimationFrame(fitHeader);
    window.addEventListener("load", fitHeader);
    window.addEventListener("resize", fitHeader);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(fitHeader).catch(function () { /* older browser: the others cover it */ });
    }
  }

  /* A small flag on the Solo card: it is the card the offer applies to. The price
     itself is left exactly as the page writes it — this file never edits prices. */
  function flagSoloCard() {
    var card = document.querySelector("#pricing .plans .plan");
    if (!card || card.querySelector(".qcp-flag")) return;
    var flag = document.createElement("span");
    flag.className = "qcp-flag";
    flag.textContent = "Buy 1, get 1 free · until 11 Oct";
    card.insertBefore(flag, card.firstChild);
  }

  whenReady(function () {
    if (!running()) return;
    styles();
    showBar();
    flagSoloCard();
    if (!remembered(SEEN)) openPopup();
    ticker = setInterval(tick, 1000);
  });
}());
