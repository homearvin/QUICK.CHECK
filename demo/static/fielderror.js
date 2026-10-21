/* A mistake shown right under the field it belongs to (design/form-fields-audit.md).
 *
 * qcFieldError(field, message) gives the field a coral edge (aria-invalid), puts the reason
 * underneath (linked with aria-describedby so a screen reader reads it) and moves the
 * cursor there. It builds the same markup as the field_error macro in _il.html, so a
 * mistake found by the server and one found in the page look alike.
 *
 * Either kind clears as soon as the teacher changes that field.
 */
(function () {
  'use strict';

  var ICON = '<svg class="ui-i" aria-hidden="true"><use href="#ui-alert"/></svg>';

  function messageId(field) { return 'err-' + (field.name || field.id); }

  function clear(field) {
    var id = field.getAttribute('aria-describedby');
    var note = id && document.getElementById(id);
    if (note && note.classList.contains('il-field-error')) note.remove();
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }

  function clearOnChange(field) {
    function once() {
      clear(field);
      field.removeEventListener('input', once);
      field.removeEventListener('change', once);
    }
    field.addEventListener('input', once);
    field.addEventListener('change', once);
  }

  window.qcFieldError = function (field, message) {
    clear(field);
    var note = document.createElement('p');
    note.className = 'il-field-error';
    note.id = messageId(field);
    note.setAttribute('role', 'alert');
    note.innerHTML = ICON;
    var text = document.createElement('span');
    text.textContent = message;
    note.appendChild(text);
    // A field inside a small group (e.g. a box with its Add button) puts the message after the group.
    (field.closest('[data-error-after]') || field).insertAdjacentElement('afterend', note);
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', note.id);
    field.focus();
    clearOnChange(field);
  };

  // A note that is not about one field (e.g. why Save cannot go ahead yet), right after
  // the button it explains. A newer note next to the same button replaces the old one.
  window.qcNoteAfter = function (anchor, message) {
    var old = anchor.nextElementSibling;
    if (old && old.classList.contains('il-field-error')) old.remove();
    var note = document.createElement('p');
    note.className = 'il-field-error';
    note.setAttribute('role', 'alert');
    note.innerHTML = ICON;
    var text = document.createElement('span');
    text.textContent = message;
    note.appendChild(text);
    anchor.insertAdjacentElement('afterend', note);
  };

  document.querySelectorAll('[aria-invalid="true"]').forEach(clearOnChange);
})();
