// Tells QuickCheck that its window is still on screen, so the program stays
// open while the teacher is working and closes when the window is closed.
// Read windowalive.py for why the window has to say this itself.
(function () {
  var EVERY_MS = 5000;

  function say(leaving) {
    // keepalive: the last word still gets out while the window is closing.
    fetch(leaving ? "/alive?closing=1" : "/alive",
          { cache: "no-store", keepalive: true }).catch(function () {});
  }

  say(false);
  setInterval(function () { say(false); }, EVERY_MS);

  // A window that was hidden (another app on top, minimised) speaks up the
  // moment it is back, without waiting for its turn — browsers slow down a
  // hidden page's timer, so its turn can be a long way off.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) say(false);
  });

  // The page is going: either the window is closing, or we are moving to the
  // next QuickCheck page, which says hello again straight away.
  window.addEventListener("pagehide", function () { say(true); });
}());
