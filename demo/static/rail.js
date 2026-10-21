/* The left menu on a laptop (design/home-proposal.md): icons only, until the teacher asks.
 *
 * - The menu button (or the M key) grows the strip to the right, over the page, with every name.
 * - Choosing a place shrinks it first, then opens that page, so the teacher sees it close.
 * - A click on the shade, Escape, Tab out of the strip, or the button again also closes it.
 * - With "reduce motion" on in Windows the stylesheet makes all of this instant, and a chosen
 *   page opens at once.
 */
(function () {
  'use strict';

  var rail = document.getElementById('ilRail');
  var shade = document.getElementById('ilRailShade');
  var toggle = document.getElementById('ilRailToggle');
  if (!rail || !shade || !toggle) return;

  function isOpen() { return rail.classList.contains('is-open'); }

  function setOpen(open) {
    rail.classList.toggle('is-open', open);
    shade.classList.toggle('is-on', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.title = open ? 'Hide the names (M)' : 'Show the names (M)';
  }

  // How long closing takes: the --il-dur-move token, or nothing when motion is reduced.
  function closeTime() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--il-dur-move')) || 200;
  }

  toggle.addEventListener('click', function () { setOpen(!isOpen()); });
  shade.addEventListener('click', function () { setOpen(false); });

  rail.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link || !isOpen() || link.target === '_blank') return;
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setOpen(false);
    window.setTimeout(function () { window.location.href = link.href; }, closeTime());
  });

  // Tabbing out of the open strip closes it, so it never sits over the page unnoticed.
  rail.addEventListener('focusout', function (event) {
    if (isOpen() && event.relatedTarget && !rail.contains(event.relatedTarget)) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
      return;
    }
    if ((event.key === 'm' || event.key === 'M') && !event.ctrlKey && !event.metaKey && !event.altKey) {
      var t = event.target;
      if (t && (t.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))) return;
      if (getComputedStyle(rail).display === 'none') return;          // phones: no strip
      if (document.querySelector('dialog[open]')) return;              // a question is being asked
      // A page may use M itself (the Answer key's letter M): decide after it has seen the key.
      window.setTimeout(function () { if (!event.defaultPrevented) setOpen(!isOpen()); }, 0);
    }
  });

  // Coming back with the browser's Back button shows the strip closed.
  window.addEventListener('pageshow', function () { setOpen(false); });
})();
