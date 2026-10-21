/*
 * hint.js — the "?" buttons.
 *
 * Teachers told us the pages were too much to read. So the words that explain a
 * step are not on the screen any more: each one sits behind a "?" next to the
 * thing it explains. Press it, the words appear; press it again, click anywhere
 * else, or press Escape, and they are gone.
 *
 * Only one is ever open, so the screen never fills up with text again.
 * The markup comes from the `hint` macro in _ui.html.
 */
(function () {
  "use strict";

  var open = null;   // the .ui-hintwrap whose words are showing

  function close() {
    if (!open) return;
    var button = open.querySelector(".ui-hint");
    var pop = open.querySelector(".ui-pop");
    if (button) button.setAttribute("aria-expanded", "false");
    if (pop) pop.hidden = true;
    open.classList.remove("is-open");
    open = null;
  }

  // A hint near the right edge would be cut off, so it opens leftwards instead.
  function place(wrap, pop) {
    pop.classList.remove("is-left", "is-up");
    var box = pop.getBoundingClientRect();
    if (box.right > window.innerWidth - 12) pop.classList.add("is-left");
    if (box.bottom > window.innerHeight - 12) pop.classList.add("is-up");
  }

  document.addEventListener("click", function (e) {
    var button = e.target.closest && e.target.closest(".ui-hint");
    if (!button) { close(); return; }        // a click anywhere else puts it away

    e.preventDefault();
    var wrap = button.closest(".ui-hintwrap");
    var pop = wrap && wrap.querySelector(".ui-pop");
    if (!pop) return;
    var wasOpen = open === wrap;
    close();
    if (wasOpen) return;                      // pressing the same "?" closes it

    pop.hidden = false;
    wrap.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    open = wrap;
    place(wrap, pop);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  // Scrolling the page would leave the words floating next to nothing.
  window.addEventListener("scroll", close, true);
  window.addEventListener("resize", close);
}());
