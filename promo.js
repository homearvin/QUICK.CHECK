/* The ₱299 launch price, and the countdown to its end.

   Until the end of 25 September 2026 (Philippine time) every page that loads this file shows:
     - a pop-up with the countdown, once per visit — close it with ×, "Not now", Esc or a click outside;
     - a slim bar at the top that stays while the visitor scrolls, counting down too.
       Tapping the bar opens the pop-up again.
   The deadline is one fixed moment for everyone, so the countdown is the same on every
   phone and computer and never restarts for a new visitor.

   From that moment on, all of this switches itself off, and the prices marked in the
   page (data-price) read the regular price, while the "launch price" extras
   (data-promo-only: the struck-out ₱999, the "Launch price" flag) disappear.
   To end the promotion early or move it, change ENDS below. */
(function () {
  var ENDS = Date.parse('2026-09-25T23:59:59+08:00');   // end of 25 Sept 2026, Philippine time
  var PROMO = '₱299';
  var REGULAR = '₱999';
  var LAST_DAY = '25 September';
  var BACK_ON = '26 September';
  var SEEN = 'qc-promo-popup-seen';

  function msLeft() { return ENDS - Date.now(); }

  function whenReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  // ---- after the deadline: the page shows the regular price ----------------------------
  function regularPrice() {
    document.querySelectorAll('[data-price]').forEach(function (el) { el.textContent = REGULAR; });
    document.querySelectorAll('[data-promo-only]').forEach(function (el) { el.style.display = 'none'; });
    var bar = document.getElementById('qcp-bar'); if (bar) bar.remove();
    var pop = document.getElementById('qcp-back'); if (pop) pop.remove();
  }
  if (msLeft() <= 0) { whenReady(regularPrice); return; }

  // ---- the look: the page's own colours, light and dark -------------------------------
  var css = [
    '#qcp-bar{position:sticky;top:0;z-index:60;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;',
    '  padding:9px 16px;background:var(--teal-deep,#0f4b47);color:#fff;font:600 14px/1.35 var(--body,system-ui,sans-serif);text-align:center;cursor:pointer}',
    '#qcp-bar .qcp-when{font-variant-numeric:tabular-nums;font-weight:800;background:rgba(255,255,255,.14);padding:3px 9px;border-radius:99px;white-space:nowrap}',
    '#qcp-bar .qcp-go{color:#06302c;background:#2fe0c4;padding:6px 14px;border-radius:99px;font-weight:800;text-decoration:none;white-space:nowrap}',
    '#qcp-bar .qcp-go:focus-visible,#qcp-bar:focus-visible{outline:3px solid #fff;outline-offset:2px}',
    '#qcp-bar.is-urgent{background:#8d2f22}',
    '#qcp-bar.is-urgent .qcp-go{background:#fff;color:#8d2f22}',
    '#qcp-back{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:16px;background:rgba(7,24,22,.62);',
    '  animation:qcp-fade .18s ease-out}',
    '#qcp-back[hidden]{display:none}',
    '.qcp-card{position:relative;width:100%;max-width:440px;background:var(--surface,#fff);color:var(--ink,#17272b);border-radius:24px;',
    '  padding:30px 26px 24px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.35);font-family:var(--body,system-ui,sans-serif)}',
    '.qcp-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border:0;border-radius:50%;background:var(--surface-2,#f7fafb);',
    '  color:var(--muted,#6f8087);font-size:22px;line-height:1;cursor:pointer}',
    '.qcp-eye{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:#8d2f22;',
    '  background:#ffe9e0;padding:5px 12px;border-radius:99px}',
    '.qcp-card h2{margin:14px 0 6px;font-size:24px;line-height:1.2;text-wrap:balance}',
    '.qcp-card h2 b{color:var(--teal-d,#0e8b7d)}',
    '.qcp-clock{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0 16px}',
    '.qcp-clock div{background:var(--teal-deep,#0f4b47);color:#fff;border-radius:14px;padding:12px 4px 9px}',
    '.qcp-clock b{display:block;font-size:30px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}',
    '.qcp-clock span{display:block;margin-top:5px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;opacity:.8}',
    '.qcp-card p{margin:0 0 18px;font-size:15px;line-height:1.55;color:var(--muted,#6f8087)}',
    '.qcp-card p strong{color:var(--ink,#17272b)}',
    '.qcp-buy{display:block;background:var(--teal-deep,#0f4b47);color:#fff;text-decoration:none;font-weight:800;font-size:17px;',
    '  padding:15px;border-radius:14px}',
    '.qcp-later{margin-top:10px;background:none;border:0;color:var(--muted,#6f8087);font:600 14px var(--body,system-ui,sans-serif);cursor:pointer;padding:8px}',
    '.qcp-buy:focus-visible,.qcp-later:focus-visible,.qcp-x:focus-visible{outline:3px solid var(--teal,#12a594);outline-offset:2px}',
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .qcp-clock div{background:#0c3a37}',
    '  :root:not([data-theme="light"]) .qcp-buy{background:#2fe0c4;color:#06302c}}',
    ':root[data-theme="dark"] .qcp-clock div{background:#0c3a37}',
    ':root[data-theme="dark"] .qcp-buy{background:#2fe0c4;color:#06302c}',
    '@media (max-width:420px){.qcp-card{padding:26px 16px 18px}.qcp-card h2{font-size:21px}.qcp-clock b{font-size:25px}',
    '  #qcp-bar{font-size:13px;gap:8px}#qcp-bar .qcp-long{display:none}}',
    '@keyframes qcp-fade{from{opacity:0}}',
    '@media (prefers-reduced-motion:reduce){#qcp-back{animation:none}}'
  ].join('\n');

  function two(n) { return (n < 10 ? '0' : '') + n; }
  function parts(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  }

  whenReady(function () {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var buyHref = document.getElementById('buy') ? '#buy' : 'index.html#buy';

    // The slim bar that stays at the top.
    var bar = document.createElement('div');
    bar.id = 'qcp-bar';
    bar.setAttribute('role', 'button');
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('aria-label', 'Launch price countdown. Open the details.');
    bar.innerHTML = '<span><b>' + PROMO + ' launch price</b> ends in</span> <span class="qcp-when" id="qcp-when"></span>' +
      '<span class="qcp-long">· back to ' + REGULAR + ' on ' + BACK_ON + '</span>' +
      '<a class="qcp-go" href="' + buyHref + '">Get it for ' + PROMO + '</a>';
    document.body.insertBefore(bar, document.body.firstChild);

    // The pop-up.
    var back = document.createElement('div');
    back.id = 'qcp-back';
    back.hidden = true;
    back.innerHTML =
      '<div class="qcp-card" role="dialog" aria-modal="true" aria-labelledby="qcp-title" aria-describedby="qcp-text">' +
      '  <button type="button" class="qcp-x" aria-label="Close">×</button>' +
      '  <span class="qcp-eye" id="qcp-eye">Launch price ends soon</span>' +
      '  <h2 id="qcp-title">QuickCheck Pro for <b>' + PROMO + '</b>, only until ' + LAST_DAY + '</h2>' +
      '  <div class="qcp-clock" role="timer" aria-label="Time left at the launch price">' +
      '    <div><b id="qcp-d">0</b><span>days</span></div><div><b id="qcp-h">00</b><span>hours</span></div>' +
      '    <div><b id="qcp-m">00</b><span>minutes</span></div><div><b id="qcp-s">00</b><span>seconds</span></div>' +
      '  </div>' +
      '  <p id="qcp-text">On <strong>' + BACK_ON + '</strong> the price goes back to <strong>' + REGULAR + '</strong>. ' +
      '  Buy now for ' + PROMO + ': one payment, yours for life, with a 7-day money-back guarantee.</p>' +
      '  <a class="qcp-buy" href="' + buyHref + '">Get it for ' + PROMO + '</a>' +
      '  <button type="button" class="qcp-later">Not now</button>' +
      '</div>';
    document.body.appendChild(back);

    var lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      back.hidden = false;
      back.querySelector('.qcp-buy').focus();
    }
    function close() {
      back.hidden = true;
      try { sessionStorage.setItem(SEEN, '1'); } catch (e) {}
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    back.querySelector('.qcp-x').addEventListener('click', close);
    back.querySelector('.qcp-later').addEventListener('click', close);
    back.querySelector('.qcp-buy').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !back.hidden) close(); });
    bar.addEventListener('click', function (e) { if (!e.target.closest('.qcp-go')) open(); });
    bar.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === bar) { e.preventDefault(); open(); }
    });

    function tick() {
      var ms = msLeft();
      if (ms <= 0) { regularPrice(); clearInterval(timer); return; }
      var t = parts(ms);
      document.getElementById('qcp-d').textContent = t.d;
      document.getElementById('qcp-h').textContent = two(t.h);
      document.getElementById('qcp-m').textContent = two(t.m);
      document.getElementById('qcp-s').textContent = two(t.s);
      document.getElementById('qcp-when').textContent =
        (t.d ? t.d + (t.d === 1 ? ' day ' : ' days ') : '') + two(t.h) + ':' + two(t.m) + ':' + two(t.s);
      var lastDay = ms < 86400000;
      bar.classList.toggle('is-urgent', lastDay);
      document.getElementById('qcp-eye').textContent = lastDay ? 'Last day at ' + PROMO : 'Launch price ends soon';
    }
    tick();
    var timer = setInterval(tick, 1000);

    // Once per visit: a visitor who closed it isn't shown it again on every page.
    var seen = false;
    try { seen = sessionStorage.getItem(SEEN) === '1'; } catch (e) {}
    if (!seen) setTimeout(open, 900);
  });
})();
