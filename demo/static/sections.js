/* Section links on a long page (Settings: Profile · Reports · Records …) show which
 * section is in view, in the same mint "here" look as tabs (design/navigation-audit.md).
 *
 * Mark the links' container with data-sections; each link points at a section id (#…).
 * Does nothing on pages without one.
 */
(function () {
  'use strict';

  var nav = document.querySelector('nav[data-sections]');
  if (!nav || !('IntersectionObserver' in window)) return;
  var links = Array.prototype.filter.call(nav.querySelectorAll('a[href^="#"]'), function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  });
  if (!links.length) return;

  function mark(id) {
    links.forEach(function (a) {
      var here = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-here', here);
      if (here) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }

  // The section whose top has most recently passed the upper third of the screen is "here".
  var seen = new IntersectionObserver(function (entries) {
    var top = entries.filter(function (e) { return e.isIntersecting; })
                     .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; })[0];
    if (top) mark(top.target.id);
  }, { rootMargin: '0px 0px -66% 0px' });
  links.forEach(function (a) { seen.observe(document.getElementById(a.getAttribute('href').slice(1))); });
})();
