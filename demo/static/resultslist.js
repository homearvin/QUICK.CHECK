/* The Results list (results.html, Arvin 11 Nov 2026): checked tests grouped by class.
 *
 * - Find: shows the tests whose name or class has every typed word; a class with none hides.
 * - Show a class: one class, or all of them.
 * - Sort: newest first (as the page comes), the lowest class average first, or A to Z;
 *   inside each class, so the classes stay where the teacher expects them.
 * - "No test matches" when nothing is left. Nothing is sent anywhere; it only shows and hides.
 */
(function () {
  'use strict';

  var find = document.getElementById('resFind');
  var only = document.getElementById('resClass');
  var sort = document.getElementById('resSort');
  var none = document.getElementById('resNone');
  var groups = Array.prototype.slice.call(document.querySelectorAll('.qc-rgroup'));
  if (!find || !only || !sort || !groups.length) return;

  var ORDER = {
    new: function (a, b) { return b.dataset.saved.localeCompare(a.dataset.saved); },
    low: function (a, b) { return parseFloat(a.dataset.mps) - parseFloat(b.dataset.mps); },
    name: function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); }
  };

  function apply() {
    var words = find.value.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    groups.forEach(function (group) {
      var list = group.querySelector('.qc-list');
      var rows = Array.prototype.slice.call(list.children).sort(ORDER[sort.value] || ORDER.new);
      rows.forEach(function (row) { list.appendChild(row); });
      var classOk = !only.value || group.dataset.class === only.value;
      var visible = 0;
      rows.forEach(function (row) {
        var ok = classOk && words.every(function (w) { return row.dataset.find.indexOf(w) !== -1; });
        row.hidden = !ok;
        if (ok) visible++;
      });
      group.hidden = visible === 0;
      shown += visible;
    });
    if (none) none.hidden = shown !== 0;
  }

  find.addEventListener('input', apply);
  only.addEventListener('change', apply);
  sort.addEventListener('change', apply);
})();
