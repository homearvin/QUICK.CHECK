/* One "Saving…" state for every form that posts (design/buttons-audit.md).
 *
 * When a teacher presses a submit button, that button greys out and says "Saving…"
 * until the next page arrives, so a second click cannot send the form twice and the
 * teacher can see the press worked.
 *
 * - Forms that already handle this themselves (check.js, glance.js) are left alone:
 *   their button is already disabled by the time this runs.
 * - A form or button can opt out with data-busy="off", or choose its own word with
 *   data-busy="Deleting…".
 * - Danger buttons (Delete, Remove, Switch off) say "Working…" instead of "Saving…".
 * - Coming back with the browser's Back button puts every button back as it was.
 */
(function () {
  'use strict';

  var SAVING = 'Saving…';
  var WORKING = 'Working…';
  var OFF = 'off';
  var DANGER = '.danger, .ui-btn-danger, .is-danger';
  var busyButtons = [];

  function labelFor(button, form) {
    var own = button.getAttribute('data-busy') || form.getAttribute('data-busy');
    if (own) return own;
    return button.matches(DANGER) ? WORKING : SAVING;
  }

  function markBusy(button, form) {
    if (button.disabled) return;          // the page's own script already did it
    var label = labelFor(button, form);
    button.dataset.busyWas = button.tagName === 'INPUT' ? button.value : button.innerHTML;
    button.style.minWidth = button.offsetWidth + 'px';   // keep the button the same size
    if (button.tagName === 'INPUT') button.value = label;
    else button.textContent = label;
    button.disabled = true;
    busyButtons.push(button);
  }

  function restore() {
    busyButtons.forEach(function (button) {
      if (button.tagName === 'INPUT') button.value = button.dataset.busyWas;
      else button.innerHTML = button.dataset.busyWas;
      button.disabled = false;
      button.style.minWidth = '';
      delete button.dataset.busyWas;
    });
    busyButtons = [];
    document.querySelectorAll('form[data-busy-on]').forEach(function (form) {
      delete form.dataset.busyOn;
      form.removeAttribute('aria-busy');
    });
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (event.defaultPrevented) return;                       // cancelled, e.g. "Delete?" → No
    if ((form.getAttribute('method') || 'get').toLowerCase() !== 'post') return;
    if (form.target && form.target !== '_self') return;       // opens elsewhere; this page stays usable
    if (form.getAttribute('data-busy') === OFF) return;
    if (form.dataset.busyOn) { event.preventDefault(); return; }  // second click while sending

    var button = event.submitter;
    if (button && button.getAttribute('data-busy') === OFF) return;
    form.dataset.busyOn = '1';
    form.setAttribute('aria-busy', 'true');
    if (!button) return;                                       // sent by script: nothing to relabel
    // Wait one tick: disabling the button during this event would drop its name/value
    // from what the browser sends.
    window.setTimeout(function () { markBusy(button, form); }, 0);
  });

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) restore();
  });

  /* Downloads (design/motion-audit.md): a link marked data-download="Making PDF…" shows
   * that word, greyed, until the file has arrived. A slow PDF never looks frozen and is
   * never asked for twice. Without fetch, or on any surprise, the plain link still works.
   */
  function fileName(disposition) {
    if (!disposition) return '';
    var utf = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    if (utf) return decodeURIComponent(utf[1]);
    var plain = /filename="?([^";]+)"?/i.exec(disposition);
    return plain ? plain[1] : '';
  }

  function save(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-download]');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;   // the teacher's own choice
    if (!window.fetch || !window.URL || !URL.createObjectURL) return;
    event.preventDefault();
    if (link.getAttribute('aria-busy') === 'true') return;                        // second press while making

    var was = link.innerHTML;
    link.style.minWidth = link.offsetWidth + 'px';
    link.textContent = link.getAttribute('data-download');
    link.setAttribute('aria-busy', 'true');
    link.setAttribute('aria-disabled', 'true');
    function done() {
      link.innerHTML = was;
      link.style.minWidth = '';
      link.removeAttribute('aria-busy');
      link.removeAttribute('aria-disabled');
    }

    // A redirect means the server answered with a page instead of the file (for example
    // "no Edge or Chrome to make the PDF"): open the link normally so its message shows.
    fetch(link.href, { credentials: 'same-origin', redirect: 'manual' }).then(function (response) {
      var type = response.headers.get('Content-Type') || '';
      if (!response.ok || type.indexOf('text/html') === 0) { done(); window.location.href = link.href; return; }
      return response.blob().then(function (blob) {
        save(blob, fileName(response.headers.get('Content-Disposition')));
        done();
      });
    }).catch(function () { done(); window.location.href = link.href; });
  });
})();
