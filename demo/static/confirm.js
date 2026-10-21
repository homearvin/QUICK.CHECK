/* QuickCheck's own "Are you sure?" (design/dialogs-audit.md), in place of the browser's
 * OK / Cancel box.
 *
 * Mark a form or a submit button:
 *   data-confirm="Delete Grade 10 – Emerald? Every score in it is deleted too."
 *   data-confirm-action="Delete class"        the coral button's words
 *   data-confirm-sets="confirm"               optional: field set to "yes" once agreed
 *   data-confirm-tone="go"                    optional: a green button, for a question that
 *                                             is not about losing anything (e.g. Save all)
 *   data-confirm-build="functionName"         optional: a page function, given the button,
 *                                             that returns {question, detail, action, tone}
 *                                             or false (stop: it explains why itself)
 * The text up to the first "?" is the question; the rest explains what happens.
 *
 * "Keep it" has the cursor, so Enter never deletes by accident. Escape, Keep it and a
 * click on the dim background all keep things as they are; the cursor goes back to
 * the button that asked. Load this BEFORE busy.js, so a question that is kept never
 * leaves a button saying "Saving…".
 *
 * Pages can also ask directly: qcConfirm({question, detail, action}).then(ok => …).
 */
(function () {
  'use strict';

  var KEEP = 'Keep it';
  var ASKED = 'qcConfirmed';
  var dialog = null;

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'il-dialog il-confirm';
    dialog.setAttribute('aria-labelledby', 'qcConfirmQuestion');
    dialog.setAttribute('aria-describedby', 'qcConfirmDetail');
    dialog.innerHTML =
      '<h2 id="qcConfirmQuestion"></h2><p class="il-dialog-lead" id="qcConfirmDetail"></p>' +
      '<div class="il-dialog-actions"><button type="button" class="btn ghost" data-keep></button>' +
      '<button type="button" class="btn danger" data-go></button></div>';
    dialog.querySelector('[data-keep]').textContent = KEEP;
    document.body.appendChild(dialog);
  }

  function split(text) {
    var cut = text.indexOf('?');
    if (cut < 0) return { question: text, detail: '' };
    return { question: text.slice(0, cut + 1), detail: text.slice(cut + 1).trim() };
  }

  window.qcConfirm = function (ask) {
    var full = ask.question + (ask.detail ? '\n\n' + ask.detail : '');
    if (typeof HTMLDialogElement !== 'function') return Promise.resolve(window.confirm(full));
    if (!dialog) build();
    var opener = document.activeElement;
    dialog.querySelector('#qcConfirmQuestion').textContent = ask.question;
    dialog.querySelector('#qcConfirmDetail').textContent = ask.detail || '';
    var go = dialog.querySelector('[data-go]');
    go.textContent = ask.action || 'Continue';
    go.className = 'btn ' + (ask.tone === 'go' ? 'primary' : 'danger');
    return new Promise(function (resolve) {
      function finish(agreed) {
        dialog.removeEventListener('click', onClick);
        dialog.removeEventListener('cancel', onCancel);
        dialog.close();
        if (opener && opener.focus) {
          var menu = opener.closest && opener.closest('details:not([open])');
          (menu ? menu.querySelector('summary') : opener).focus();
        }
        resolve(agreed);
      }
      function outside(event) {     // a click on the dim background, not on the box's own padding
        var box = dialog.getBoundingClientRect();
        return event.target === dialog && (event.clientX < box.left || event.clientX > box.right ||
                                           event.clientY < box.top || event.clientY > box.bottom);
      }
      function onClick(event) {
        if (event.target.closest('[data-go]')) finish(true);
        else if (event.target.closest('[data-keep]') || outside(event)) finish(false);
      }
      function onCancel(event) { event.preventDefault(); finish(false); }   // Escape
      dialog.addEventListener('click', onClick);
      dialog.addEventListener('cancel', onCancel);
      dialog.showModal();
      dialog.querySelector('[data-keep]').focus();
    });
  };

  function question(source) {
    var builder = source.getAttribute('data-confirm-build');
    if (builder) return window[builder](source);
    var parts = split(source.getAttribute('data-confirm'));
    parts.action = source.getAttribute('data-confirm-action');
    parts.tone = source.getAttribute('data-confirm-tone');
    return parts;
  }

  function askThenSend(event, form, button, source) {
    event.preventDefault();
    var ask = question(source);
    if (!ask) return;
    window.qcConfirm(ask).then(function (agreed) {
      if (!agreed) return;
      var sets = source.getAttribute('data-confirm-sets');
      if (sets && form.elements[sets]) form.elements[sets].value = 'yes';
      form.dataset[ASKED] = '1';
      if (button) form.requestSubmit(button); else form.requestSubmit();
    });
  }

  // A submit button that asks: catch the press (a mouse click, Enter or Space).
  document.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-confirm], button[data-confirm-build]');
    if (!button || !button.form || button.disabled) return;
    askThenSend(event, button.form, button, button);
  });

  // A form that asks, whichever button sent it.
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (form.dataset[ASKED]) { delete form.dataset[ASKED]; return; }   // already agreed
    var button = event.submitter;
    if (button && (button.hasAttribute('data-confirm') || button.hasAttribute('data-confirm-build'))) {
      askThenSend(event, form, button, button);   // Enter in a field on a form whose default button asks
      return;
    }
    if (form.hasAttribute('data-confirm')) askThenSend(event, form, button, form);
  });
})();
