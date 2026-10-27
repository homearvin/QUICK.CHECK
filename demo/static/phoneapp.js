/* QuickCheck Mobile: inside the Android app, a page's Print opens the phone's own
   print screen (printers, or Save as PDF). window.QuickCheckApp is added by the app
   (MainActivity.PageBridge); in an ordinary browser it does not exist and Print is
   left as it is. Loaded in <head>, before any page script can call print(). */
if (window.QuickCheckApp) {
  window.print = function () { window.QuickCheckApp.print(document.title || "QuickCheck"); };
}
