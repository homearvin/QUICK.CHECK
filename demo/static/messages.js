/* Messages after an action, in the one area under the page header (base.html).
 *
 * - × dismisses any message.
 * - A "done" message fades after 6 seconds, unless the mouse or keyboard is on it.
 * - A problem stays until dismissed: there is time to read it.
 * - qcNotice(text, "error") lets a page add one without reloading.
 */
(function () {
  'use strict';

  var DONE_FOR = 6000;
  // How long a message takes to leave: the --il-dur-slow token (iconlook.css "Motion").
  var FADE = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--il-dur-slow')) || 300;
  var ICONS = { ok: '<svg class="ui-i" aria-hidden="true"><use href="#ui-check"/></svg>',
                bad: '<svg class="ui-i" aria-hidden="true"><use href="#ui-alert"/></svg>' };
  var area = document.getElementById('qcMessages');
  if (!area) return;

  // The message fades while its space closes, so the page below glides up instead of
  // jumping. It needs a fixed height to close from.
  function dismiss(message) {
    if (message.classList.contains('is-leaving')) return;
    message.style.height = message.offsetHeight + 'px';
    void message.offsetHeight;                       // start from that height, not from "auto"
    message.classList.add('is-leaving');
    window.setTimeout(function () { message.remove(); }, FADE);
  }

  function fadeLater(message) {
    window.setTimeout(function () {
      if (message.matches(':hover') || message.contains(document.activeElement)) { fadeLater(message); return; }
      dismiss(message);
    }, DONE_FOR);
  }

  area.addEventListener('click', function (event) {
    var close = event.target.closest('.il-msg-x');
    if (close) dismiss(close.closest('.il-msg'));
  });
  area.querySelectorAll('.il-msg.is-ok').forEach(fadeLater);

  window.qcNotice = function (text, kind) {
    var bad = kind === 'error';
    var message = document.createElement('div');
    message.className = 'il-msg ' + (bad ? 'is-bad' : 'is-ok');
    message.setAttribute('role', bad ? 'alert' : 'status');
    message.innerHTML = ICONS[bad ? 'bad' : 'ok'] + '<span></span>' +
      '<button type="button" class="il-msg-x" aria-label="Dismiss this message">&times;</button>';
    message.querySelector('span').textContent = text;
    area.appendChild(message);
    if (!bad) fadeLater(message);
    area.scrollIntoView({ block: 'nearest' });
  };
})();
