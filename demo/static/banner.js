/* Home's banner (_phone_home.html; Arvin, 11 Nov 2026): what QuickCheck can do, one slide at a time.
 *
 * - One dot per slide, the one in view filled; a dot shows its slide. A swipe works as well.
 * - It moves on by itself every SLIDE_SECONDS, back to the first after the last, and waits while
 *   the pointer or the keyboard is on it or the tab is hidden.
 * - With "reduce motion" on in Windows or Android it never moves by itself, and a dot jumps
 *   straight to its slide (the stylesheet stills the drifting light: iconlook.css).
 * - The slide in view gets .is-in, which lets its words rise in (phone.css).
 */
(function () {
  'use strict';

  var SLIDE_SECONDS = 5;
  var box = document.querySelector('.qc-banner-box');
  var strip = box && box.querySelector('.qc-banner');
  var dots = box && box.querySelector('.qc-dots');
  if (!strip || !dots) return;
  var slides = strip.children;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function at() { return Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth)); }
  function show(n) { strip.scrollTo({ left: n * strip.clientWidth, behavior: still ? 'auto' : 'smooth' }); }

  function mark() {
    var n = at();
    Array.prototype.forEach.call(dots.children, function (d, k) {
      d.classList.toggle('on', k === n);
      d.setAttribute('aria-current', k === n ? 'true' : 'false');
    });
    Array.prototype.forEach.call(slides, function (s, k) { s.classList.toggle('is-in', k === n); });
  }

  if (slides.length > 1) {
    for (var i = 0; i < slides.length; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      var title = slides[i].querySelector('b');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1) + (title ? ': ' + title.textContent : ''));
      dot.addEventListener('click', show.bind(null, i));
      dots.appendChild(dot);
    }
  }
  strip.addEventListener('scroll', mark, { passive: true });
  mark();
  box.classList.add('is-live');                 // from now on the slides out of view wait, words lowered
  if (still || slides.length < 2) return;

  var paused = false;
  ['mouseenter', 'focusin', 'touchstart'].forEach(function (e) {
    box.addEventListener(e, function () { paused = true; }, { passive: true });
  });
  ['mouseleave', 'focusout'].forEach(function (e) { box.addEventListener(e, function () { paused = false; }); });
  window.setInterval(function () {
    if (!paused && !document.hidden) show((at() + 1) % slides.length);
  }, SLIDE_SECONDS * 1000);
})();
