/* Tells the Meta Pixel (in each page's <head>) when a visitor clicks a QuickCheck download, so ads can
 * be measured by downloads, not only visits.
 *
 * Any link to a Windows download (.exe or .zip) or the Android app (.apk) counts — wherever it is on
 * the page, now or added later. Each click sends two events:
 *   Lead      Meta's standard event, which an ad set can be set to aim for
 *   Download  a custom event with platform "Windows" or "Android", for reports per platform
 * Nothing else is sent: no names, no e-mail, no personal details.
 */
(function () {
  'use strict';

  function platformOf(href) {
    var path = (href || '').split(/[?#]/)[0].toLowerCase();
    if (/\.apk$/.test(path)) return 'Android';
    if (/\.(exe|zip)$/.test(path)) return 'Windows';
    return null;
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    var platform = link && platformOf(link.href);
    if (!platform || typeof window.fbq !== 'function') return;
    window.fbq('track', 'Lead', { content_name: 'QuickCheck for ' + platform });
    window.fbq('trackCustom', 'Download', { platform: platform });
  }, true);
}());
