/* Wide tables that scroll sideways inside their card (design/tables-audit.md).
 *
 * For every table on the page, find the box that scrolls it sideways and mark it
 * .il-tablebox. Then, while the table is wider than its box:
 *   - .is-more-right fades the right edge until the last column is in view
 *     (iconlook.css, phones), so it is clear there is more to see;
 * and when the table fits:
 *   - .is-fits lets the box stop clipping, so a long table's header row can stick
 *     to the top of the page instead of only inside the box.
 */
(function () {
  'use strict';

  function scrollBox(table) {
    for (var el = table.parentElement; el && el !== document.body; el = el.parentElement) {
      var overflow = getComputedStyle(el).overflowX;
      if (overflow === 'auto' || overflow === 'scroll') return el;
    }
    return null;
  }

  var boxes = [];
  document.querySelectorAll('main table').forEach(function (table) {
    var box = scrollBox(table);
    if (box && boxes.indexOf(box) < 0) { box.classList.add('il-tablebox'); boxes.push(box); }
    // The column of names stays in view when the table scrolls sideways; so does its header.
    var rowHead = table.querySelector('tbody th[scope=row]');
    if (rowHead && table.tHead) {
      Array.prototype.forEach.call(table.tHead.rows, function (row) {
        var cell = row.cells[rowHead.cellIndex];
        if (cell) cell.classList.add('il-stick-col');
      });
    }
  });
  if (!boxes.length) return;

  // A pinned name column wider than half the box would cover the columns it is meant to label.
  var PIN_AT_MOST = 0.5;

  function update(box) {
    box.classList.remove('is-fits');                 // measure with clipping on
    var wider = box.scrollWidth > box.clientWidth + 1;
    box.classList.toggle('is-fits', !wider);
    box.classList.toggle('is-more-right', wider && box.scrollLeft + box.clientWidth < box.scrollWidth - 2);
    var name = box.querySelector('tbody th[scope=row]');
    box.classList.toggle('no-pin', !!name && name.offsetWidth > box.clientWidth * PIN_AT_MOST);
  }

  boxes.forEach(function (box) {
    update(box);
    box.addEventListener('scroll', function () { update(box); }, { passive: true });
  });
  var pending = null;
  window.addEventListener('resize', function () {
    clearTimeout(pending);
    pending = setTimeout(function () { boxes.forEach(update); }, 150);
  });
})();
