/* Every ⋯ and Download menu behaves the same way (design/dialogs-audit.md).
 *
 * A menu is <details class="il-dropmenu"> with its items in .il-dropmenu-panel.
 * - Opening one closes any other.
 * - A click outside it, Escape (the cursor goes back to its button), Tab past its
 *   last item, or choosing a link in it closes it.
 * - Near the left edge of the screen it opens to the right instead, so it is
 *   never cut off.
 */
(function () {
  'use strict';

  function openMenus() { return document.querySelectorAll('details.il-dropmenu[open]'); }

  function place(menu) {
    var panel = menu.querySelector('.il-dropmenu-panel');
    if (!panel) return;
    panel.classList.remove('is-left');
    if (panel.getBoundingClientRect().left < 8) panel.classList.add('is-left');
  }

  // "toggle" does not bubble, so listen while it travels down (capture).
  document.addEventListener('toggle', function (event) {
    var menu = event.target;
    if (!menu.classList || !menu.classList.contains('il-dropmenu') || !menu.open) return;
    openMenus().forEach(function (other) { if (other !== menu) other.open = false; });
    place(menu);
  }, true);

  document.addEventListener('click', function (event) {
    // Answering a question the menu asked (e.g. "Delete test?") is not a click outside it:
    // the menu stays, so the cursor can go back to the button that asked.
    if (event.target.closest('dialog')) return;
    openMenus().forEach(function (menu) {
      if (!menu.contains(event.target)) menu.open = false;
      else if (event.target.closest('.il-dropmenu-panel a')) menu.open = false;
    });
  });

  // Tabbing out of a menu closes it, so it never floats over the page (design/qa-crawl-audit.md).
  // Focus going into the menu's own question (a dialog), or away from the window, keeps it.
  document.addEventListener('focusout', function (event) {
    var menu = event.target.closest && event.target.closest('details.il-dropmenu[open]');
    var next = event.relatedTarget;
    if (!menu || !next || menu.contains(next) || next.closest('dialog')) return;
    menu.open = false;
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    openMenus().forEach(function (menu) {
      menu.open = false;
      menu.querySelector('summary').focus();
    });
  });
})();
