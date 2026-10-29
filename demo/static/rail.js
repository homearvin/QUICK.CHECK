/* The left menu on a laptop (design/home-proposal.md): icons only, until the teacher clicks it.
 *
 * - A click anywhere on the closed strip — an icon or the space between — grows it to the right,
 *   over the page, with every name (Arvin, 29 Oct: no separate menu button). The M key does too.
 * - On the open strip, a name opens its page: the strip shrinks first, so the teacher sees it close.
 *   A click on its empty space, on the shade, Escape, or Tab out of the strip closes it.
 * - The keyboard (Tab to an icon, Enter) and the number keys open the page at once: they already
 *   say where to go, so they never need the names first.
 * - With "reduce motion" on in Windows the stylesheet makes all of this instant, and a chosen
 *   page opens at once.
 */
(function () {
  'use strict';

  var rail = document.getElementById('ilRail');
  var shade = document.getElementById('ilRailShade');
  if (!rail || !shade) return;

  function isOpen() { return rail.classList.contains('is-open'); }

  function setOpen(open) {
    rail.classList.toggle('is-open', open);
    shade.classList.toggle('is-on', open);
  }

  // How long closing takes: the --il-dur-move token, or nothing when motion is reduced.
  function closeTime() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--il-dur-move')) || 200;
  }

  shade.addEventListener('click', function () { setOpen(false); });

  rail.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;   // the teacher's own choice
    var link = event.target.closest('a[href]');
    var byKeyboard = event.detail === 0;          // Enter on a focused icon, or a number key
    if (!isOpen()) {
      if (link && byKeyboard) return;             // straight there
      event.preventDefault();
      setOpen(true);                              // first click: show the names
      return;
    }
    if (!link) { setOpen(false); return; }        // the open strip's empty space: close it
    if (link.target === '_blank') { setOpen(false); return; }
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
