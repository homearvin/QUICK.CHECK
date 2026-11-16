/* The verse line at the bottom of the page (_verse.html; Arvin, 16 Nov 2026).
 *
 * - The verse moves slowly from right to left, at the same reading speed (PIXELS_PER_SECOND)
 *   whatever its length, and starts again when it has gone by.
 * - Pointing at it or tapping it stops it, to read at leisure; another tap moves it on.
 * - × hides it until the next verse (this morning's, this afternoon's): remembered on this device.
 * - With "reduce motion" on in Windows or Android it never moves: the whole verse is shown
 *   in two lines instead (.is-still).
 */
(function () {
  'use strict';

  var PIXELS_PER_SECOND = 34;
  var HIDDEN_KEY = 'qc-verse-hidden';
  var line = document.querySelector('.qc-verse-line');
  if (!line) return;
  var run = line.querySelector('.qc-verse-run');
  var words = run && run.firstElementChild;
  if (!words) return;

  function remembered() { try { return localStorage.getItem(HIDDEN_KEY); } catch (e) { return null; } }
  function remember(value) { try { localStorage.setItem(HIDDEN_KEY, value); } catch (e) { /* private window */ } }

  if (remembered() === line.dataset.verse) {      // hidden until the next verse
    line.remove();
    return;
  }
  document.body.classList.add('has-verse-line');

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) {
    line.classList.add('is-still');
  } else {
    var measure = function () {
      var room = run.clientWidth, length = words.scrollWidth;
      run.style.setProperty('--qc-verse-from', room + 'px');
      run.style.setProperty('--qc-verse-secs', Math.max(12, (room + length) / PIXELS_PER_SECOND) + 's');
      line.classList.add('is-moving');
    };
    measure();
    window.addEventListener('resize', measure);
    run.addEventListener('click', function () { line.classList.toggle('is-paused'); });
  }

  line.querySelector('.qc-verse-x').addEventListener('click', function () {
    remember(line.dataset.verse);
    document.body.classList.remove('has-verse-line');
    line.remove();
  });
}());
