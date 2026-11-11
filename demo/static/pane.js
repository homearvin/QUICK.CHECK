/* The laptop's sidebar (desktop.css, Arvin 11 Nov 2026): icons only, until the teacher clicks it.
 *
 * - A click anywhere on the closed bar, on an icon or the space between, slides it open over
 *   the page with every name. On the open bar a name opens its page; the bar closes first,
 *   so the teacher sees it go.
 * - A click on the open bar's empty space or on the shade, Escape, or Tab out of the bar
 *   closes it. Back to a page with the browser's Back button shows it closed.
 * - The keyboard (Tab to an icon, Enter) and the number keys open the page at once: they
 *   already say where to go, so they never need the names first. Ctrl/Shift-click is the
 *   teacher's own choice (a new tab) and is left alone.
 * - With "reduce motion" on in Windows the stylesheet makes all of this instant (iconlook.css),
 *   and a chosen page opens at once.
 */
(function () {
  'use strict';

  var pane = document.querySelector('.qc-pane');
  var shade = document.querySelector('.qc-pane-shade');
  if (!pane || !shade) return;

  function shown() { return getComputedStyle(pane).display !== 'none'; }   // not in a narrow window
  function isOpen() { return pane.classList.contains('is-open'); }

  function setOpen(open) {
    pane.classList.toggle('is-open', open);
    shade.classList.toggle('is-on', open);
  }

  // How long closing takes: the --il-dur-move token, or nothing when motion is reduced.
  function closeTime() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--il-dur-move')) || 200;
  }

  shade.addEventListener('click', function () { setOpen(false); });

  pane.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || !shown()) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var link = event.target.closest('a[href]');
    var byKeyboard = event.detail === 0;          // Enter on a focused icon
    if (!isOpen()) {
      if (link && byKeyboard) return;             // straight there
      event.preventDefault();
      setOpen(true);                              // first click: show the names
      return;
    }
    if (!link) { setOpen(false); return; }        // the open bar's empty space: close it
    if (link.target === '_blank') { setOpen(false); return; }
    event.preventDefault();
    setOpen(false);
    if (window.QCSkeleton && window.QCSkeleton.start) window.QCSkeleton.start(link.href);   // the page's grey shape
    window.setTimeout(function () { window.location.href = link.href; }, closeTime());
  });

  // Tabbing out of the open bar closes it, so it never sits over the page unnoticed.
  pane.addEventListener('focusout', function (event) {
    if (isOpen() && event.relatedTarget && !pane.contains(event.relatedTarget)) setOpen(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) setOpen(false);
  });

  window.addEventListener('pageshow', function () { setOpen(false); });
})();
