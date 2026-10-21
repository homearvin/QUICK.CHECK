(function () {
  'use strict';
  var root = document.getElementById('checkWorkspace');
  if (!root) return;
  var phone = document.getElementById('checkPhone');
  var phoneButton = document.getElementById('checkPhoneButton');
  if (phoneButton) phoneButton.addEventListener('click', function () {
    phone.hidden = !phone.hidden;
    phoneButton.setAttribute('aria-expanded', String(!phone.hidden));
  });
  var saving = false, fetching = false;
  var form = document.getElementById('checkSaveForm');
  if (form) form.addEventListener('submit', function (event) {
    if (saving) { event.preventDefault(); return; }
    saving = true;
    var button = document.getElementById('checkSaveButton');
    button.disabled = true; button.textContent = 'Saving…';
    form.setAttribute('aria-busy', 'true');
  });
  window.addEventListener('pageshow', function (event) { if (event.persisted) location.reload(); });
  var notice = document.getElementById('checkRefresh');
  var message = document.getElementById('checkRefreshText');
  document.getElementById('checkRefreshButton').addEventListener('click', function () { location.reload(); });
  function interacting() {
    return (phone && !phone.hidden) || root.querySelector('details[open]') ||
      root.contains(document.activeElement) && document.activeElement.matches('a,button,input,select,summary');
  }
  setInterval(function () {
    if (saving || fetching || document.hidden) return;
    fetching = true;
    fetch(root.dataset.stateUrl, {credentials:'same-origin', cache:'no-store'})
      .then(function (response) { if (!response.ok) throw new Error('refresh'); return response.json(); })
      .then(function (data) {
        if (!data.check_revision) throw new Error('refresh');
        if (data.check_revision !== root.dataset.revision) {
          message.textContent = 'Papers or scores changed. Refresh to see the current list.';
          notice.hidden = false;
          if (!interacting()) location.reload();
        } else { notice.hidden = true; }
      })
      .catch(function () {
        message.textContent = 'Updates are unavailable. The list below may be out of date. Refresh before continuing.';
        notice.hidden = false;
      })
      .finally(function () { fetching = false; });
  }, 4000);
})();
