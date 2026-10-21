/* Small accessibility and navigation enhancements; no data mutations. */
(function () {
  function debounce(callback, wait) {
    var timer = null;
    return function () {
      var args = arguments, context = this;
      clearTimeout(timer);
      timer = setTimeout(function () { callback.apply(context, args); }, wait);
    };
  }

  document.querySelectorAll('.nav a.active, .tabbar a.on').forEach(function (link) {
    link.setAttribute('aria-current', 'page');
  });
  document.querySelectorAll('[data-filter-list]').forEach(function (input) {
    var cards = Array.from(document.querySelectorAll(input.dataset.filterList));
    input.addEventListener('input', debounce(function () {
      var query = input.value.trim().toLowerCase(), count = 0;
      cards.forEach(function (card) {
        card.hidden = !card.dataset.search.includes(query);
        if (!card.hidden) count++;
      });
      var empty = document.getElementById('filterEmpty');
      if (empty) empty.hidden = count > 0;
    }, 100));
  });
  document.querySelectorAll('[data-filter-select]').forEach(function (input) {
    var select = document.getElementById(input.dataset.filterSelect);
    var options = Array.from(select.options);
    input.addEventListener('input', debounce(function () {
      var query = input.value.trim().toLowerCase();
      options.forEach(function (option) {
        option.hidden = Boolean(option.value && !option.selected && !option.textContent.toLowerCase().includes(query));
      });
    }, 100));
  });
}());
