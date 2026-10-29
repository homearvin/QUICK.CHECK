/* QuickCheck Mobile: inside the Android app, a page's Print opens the phone's own
   print screen (printers, or Save as PDF). window.QuickCheckApp is added by the app
   (MainActivity.PageBridge); in an ordinary browser it does not exist and Print is
   left as it is. Loaded in <head>, before any page script can call print(). */
if (window.QuickCheckApp) {
  window.print = function () { window.QuickCheckApp.print(document.title || "QuickCheck"); };

  /* Typing: the app makes the page shorter by the keyboard's height
     (MainActivity.fitAroundBarsAndKeyboard). While the keyboard is up, the bottom buttons
     step aside so they don't take the little room left, and the field being typed in is
     kept in sight. "Keyboard up" = the page lost over a quarter of its tallest height. */
  (function () {
    var tallest = window.innerHeight;
    var style = document.createElement("style");
    style.textContent = "body.qc-typing .tabbar { display: none !important; }";
    document.head.appendChild(style);

    function typingIn() {
      var el = document.activeElement;
      return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) ? el : null;
    }

    // The field in the middle of what is left: clear of the sticky bars at the top and the
    // Save bar at the bottom. Measured by hand — older phones' WebView ignores
    // scrollIntoView's "center" and puts the field at the very top, under a sticky bar.
    function keepInSight() {
      var field = typingIn();
      if (!field || !document.body.classList.contains("qc-typing")) return;
      var r = field.getBoundingClientRect();
      window.scrollBy(0, (r.top + r.height / 2) - window.innerHeight * 0.45);
    }

    window.addEventListener("resize", function () {
      tallest = Math.max(tallest, window.innerHeight);
      var keyboardUp = window.innerHeight < tallest * 0.75;
      if (document.body) document.body.classList.toggle("qc-typing", keyboardUp);
      // While typing, the WebView's own "show the focused field" also keeps a margin at the
      // top and bottom (where pages have sticky bars), instead of putting it at the very edge.
      document.documentElement.style.scrollPaddingTop = keyboardUp ? "30%" : "";
      document.documentElement.style.scrollPaddingBottom = keyboardUp ? "30%" : "";
      if (keyboardUp) {
        // Again once the page has settled: hiding the bottom buttons moves it once more, and
        // on some phones the WebView makes its own move a moment later.
        [100, 450, 1000].forEach(function (wait) { window.setTimeout(keepInSight, wait); });
      }
    });
    document.addEventListener("focusin", function () { window.setTimeout(keepInSight, 100); });
  })();
}
