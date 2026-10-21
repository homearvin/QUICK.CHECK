/* Warn before leaving a page whose typing has not been saved.

   A form opts in with data-unsaved. Its contents are remembered when the page
   opens; if they differ when the teacher tries to leave, the browser asks first.
   Submitting the form itself never asks — that IS saving. Nothing here saves
   anything: QuickCheck saves only when the teacher presses Save, and every page
   says so. */
(function () {
  'use strict';
  var forms = Array.prototype.slice.call(document.querySelectorAll('form[data-unsaved]'));
  if (!forms.length) return;

  function snapshot(form) {
    var parts = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'hidden' && el.name === '_csrf') return;
      if (el.type === 'checkbox' || el.type === 'radio') parts.push(el.name + '=' + (el.checked ? el.value : ''));
      else parts.push(el.name + '=' + el.value);
    });
    return parts.join('\u0001');
  }

  var leaving = false;

  function formChanged(form) {
    // "dirty": the page opened with work that is not saved yet — a table read from a
    // paste, or a form shown again after a mistake. Leaving it loses that work too.
    if (form.dataset.unsaved === 'dirty') return true;
    return form.dataset.unsavedStart !== undefined && snapshot(form) !== form.dataset.unsavedStart;
  }

  // The form's Save bar says "Unsaved changes" while there are some (class is-dirty).
  function mark(form) { form.classList.toggle('is-dirty', formChanged(form)); }

  forms.forEach(function (form) {
    // Read after other scripts have filled the form in (rows added, values worked out).
    setTimeout(function () { form.dataset.unsavedStart = snapshot(form); mark(form); }, 0);
    form.addEventListener('input', function () { mark(form); });
    form.addEventListener('change', function () { mark(form); });
    form.addEventListener('submit', function () { leaving = true; });
  });

  function changed() { return forms.some(formChanged); }
  window.qcHasUnsaved = changed;

  window.addEventListener('beforeunload', function (event) {
    if (leaving || !changed()) return;
    event.preventDefault();
    event.returnValue = '';            // the browser shows its own "Leave site?" question
  });
})();
