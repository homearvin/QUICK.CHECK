/* Class list import panel (templates/_import_panel.html).
   Reads a file, pasted cells or another class through /classes/import/preview,
   shows what was found, lets the teacher fix columns and sections, then adds
   the learners: straight into a class book, or into the class wizard's lists. */
(function () {
  var LAYOUT_LABELS = {
    columns: 'A name column and a sex column',
    sections: 'MALE and FEMALE headings above each group',
    side_by_side: 'Boys and girls in separate columns',
    names_only: "Names only — I'll choose the sections"
  };
  var COLUMN_FIELDS = {
    columns: [['name', 'Full name'], ['last', 'Surname (if separate)'], ['first', 'First name'], ['middle', 'Middle name'], ['sex', 'Sex']],
    sections: [['name', 'Names']],
    names_only: [['name', 'Full name'], ['last', 'Surname (if separate)'], ['first', 'First name'], ['middle', 'Middle name']],
    side_by_side: [['M', 'Boys'], ['F', 'Girls']]
  };
  var SEX_LABELS = { M: 'Boys', F: 'Girls' };

  function make(tag, props, text) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) { node[k] = props[k]; });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  document.querySelectorAll('[data-import-panel]').forEach(function (panel) {
    var q = function (sel) { return panel.querySelector(sel); };
    var source = 'file';
    var last = null;
    var readButton = q('[data-read]');

    function showError(message) {
      var box = q('[data-error]');
      box.textContent = message;
      box.hidden = !message;
    }

    panel.querySelectorAll('[data-source]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        source = tab.dataset.source;
        panel.querySelectorAll('[data-source]').forEach(function (t) { t.classList.toggle('on', t === tab); });
        panel.querySelectorAll('[data-pane]').forEach(function (p) { p.hidden = p.dataset.pane !== source; });
        showError('');
      });
    });

    function formData(extra) {
      var fd = new FormData();
      fd.append('source', source);
      fd.append('target', panel.dataset.target || '');
      if (source === 'file') {
        var file = q('[data-file]').files[0];
        if (!file) { showError('Choose a file first.'); return null; }
        fd.append('file', file);
      } else if (source === 'paste') {
        fd.append('text', q('[data-text]').value);
      } else {
        fd.append('class_name', q('[data-class]').value);
      }
      if (extra && extra.sheet !== undefined && extra.sheet !== null) fd.append('sheet', extra.sheet);
      if (extra && extra.mapping) fd.append('mapping', JSON.stringify(extra.mapping));
      return fd;
    }

    function post(url, fd) {
      return fetch(url, { method: 'POST', body: fd, credentials: 'same-origin',
                          headers: { 'X-CSRF-Token': panel.dataset.csrf } })
        .then(function (r) {
          return r.json().then(function (data) { return { ok: r.ok, data: data }; },
                               function () { return { ok: false, data: {} }; });
        });
    }

    function read(extra) {
      var fd = formData(extra);
      if (!fd) return;
      showError('');
      readButton.disabled = true;
      readButton.textContent = 'Reading…';
      post(panel.dataset.previewUrl, fd).then(function (res) {
        if (!res.ok || res.data.error) { showError(res.data.error || 'That list could not be read.'); return; }
        last = res.data;
        render(res.data);
      }).catch(function () {
        showError('That list could not be read.');
      }).finally(function () {
        readButton.disabled = false;
        readButton.textContent = 'Read the list';
      });
    }
    readButton.addEventListener('click', function () { read(null); });

    function columnSelect(current, onChange) {
      var select = make('select');
      select.appendChild(make('option', { value: '-1' }, '(none)'));
      last.columns.forEach(function (col) {
        select.appendChild(make('option', { value: String(col.index), selected: col.index === current }, col.label));
      });
      select.addEventListener('change', function () { onChange(parseInt(select.value, 10)); });
      return select;
    }

    function field(label, control) {
      var wrap = make('div');
      wrap.appendChild(make('label', {}, label));
      wrap.appendChild(control);
      return wrap;
    }

    function reread(changes) {
      var mapping = JSON.parse(JSON.stringify(last.mapping));
      Object.keys(changes).forEach(function (k) { mapping[k] = changes[k]; });
      read({ sheet: last.sheet, mapping: mapping });
    }

    function renderMap(data) {
      var map = q('[data-map]');
      map.innerHTML = '';
      if (!data.mapping) return;                      // a DepEd record or another class: nothing to choose
      if (data.sheets.length > 1) {
        var sheetSelect = make('select');
        data.sheets.forEach(function (name, i) {
          sheetSelect.appendChild(make('option', { value: String(i), selected: i === data.sheet }, name));
        });
        sheetSelect.addEventListener('change', function () { read({ sheet: parseInt(sheetSelect.value, 10) }); });
        map.appendChild(field('Sheet', sheetSelect));
      }
      var layoutSelect = make('select');
      Object.keys(LAYOUT_LABELS).forEach(function (key) {
        layoutSelect.appendChild(make('option', { value: key, selected: key === data.mapping.layout }, LAYOUT_LABELS[key]));
      });
      layoutSelect.addEventListener('change', function () {
        var changes = { layout: layoutSelect.value };
        if (layoutSelect.value === 'side_by_side' && !data.mapping.side) {
          var first = data.columns[0] ? data.columns[0].index : 0;
          var second = data.columns[1] ? data.columns[1].index : first;
          changes.side = { M: first, F: second };
        }
        if (layoutSelect.value !== 'side_by_side' && data.mapping.name === undefined) {
          changes.name = data.mapping.side ? data.mapping.side.M : 0;
        }
        reread(changes);
      });
      map.appendChild(field('The list has', layoutSelect));
      (COLUMN_FIELDS[data.mapping.layout] || []).forEach(function (pair) {
        var key = pair[0];
        if (data.mapping.layout === 'side_by_side') {
          map.appendChild(field(pair[1], columnSelect(data.mapping.side[key], function (value) {
            var side = { M: data.mapping.side.M, F: data.mapping.side.F };
            side[key] = value;
            reread({ side: side });
          })));
        } else {
          var current = data.mapping[key] === null || data.mapping[key] === undefined ? -1 : data.mapping[key];
          map.appendChild(field(pair[1], columnSelect(current, function (value) {
            var change = {};
            change[key] = value < 0 ? null : value;
            reread(change);
          })));
        }
      });
    }

    function render(data) {
      q('[data-result]').hidden = false;
      var c = data.counts;
      var parts = ['Found ' + c.M + ' boy' + (c.M === 1 ? '' : 's') + ' and ' + c.F + ' girl' + (c.F === 1 ? '' : 's')];
      if (c.unknown) parts.push(c.unknown + ' without a section');
      q('[data-summary]').textContent = parts.join(', ') + ' — from ' + data.source + '.';
      renderMap(data);

      var body = q('[data-rows]');
      body.innerHTML = '';
      data.learners.forEach(function (learner) {
        var tr = make('tr');
        var check = make('input', { type: 'checkbox', checked: !learner.exists });
        check.dataset.pick = '1';
        var name = make('input', { type: 'text', value: learner.name });
        name.dataset.name = '1';
        var sex = make('select');
        sex.dataset.sex = '1';
        [['', '—'], ['M', 'Boys'], ['F', 'Girls']].forEach(function (o) {
          sex.appendChild(make('option', { value: o[0], selected: o[0] === learner.sex }, o[1]));
        });
        var td1 = make('td'); td1.appendChild(check);
        var td2 = make('td'); td2.appendChild(name);
        var td3 = make('td'); td3.appendChild(sex);
        var td4 = make('td');
        if (learner.exists) td4.appendChild(make('span', { className: 'imp-exists' }, 'Already in this class'));
        [td1, td2, td3, td4].forEach(function (td) { tr.appendChild(td); });
        body.appendChild(tr);
      });
      q('[data-bulk-row]').hidden = !c.unknown;
      q('[data-all]').checked = true;
      updateChosen();
    }

    function rows() { return Array.prototype.slice.call(q('[data-rows]').querySelectorAll('tr')); }

    function updateChosen() {
      var chosen = rows().filter(function (tr) { return tr.querySelector('[data-pick]').checked; }).length;
      q('[data-chosen]').textContent = chosen + ' selected';
      q('[data-add]').textContent = 'Add ' + chosen + ' learner' + (chosen === 1 ? '' : 's');
    }
    q('[data-rows]').addEventListener('change', updateChosen);
    q('[data-all]').addEventListener('change', function (e) {
      rows().forEach(function (tr) { tr.querySelector('[data-pick]').checked = e.target.checked; });
      updateChosen();
    });
    panel.querySelectorAll('[data-bulk]').forEach(function (button) {
      button.addEventListener('click', function () {
        rows().forEach(function (tr) {
          var sex = tr.querySelector('[data-sex]');
          if (!sex.value) sex.value = button.dataset.bulk;
        });
      });
    });

    q('[data-add]').addEventListener('click', function () {
      var noSexAllowed = typeof window.qcImportAllowsNoSex === 'function' && window.qcImportAllowsNoSex();
      var picked = rows().filter(function (tr) { return tr.querySelector('[data-pick]').checked; }).map(function (tr) {
        return { name: tr.querySelector('[data-name]').value.trim(), sex: tr.querySelector('[data-sex]').value };
      }).filter(function (l) { return l.name; });
      if (!picked.length) { showError('Select at least one learner to add.'); return; }
      if (!noSexAllowed && picked.some(function (l) { return !l.sex; })) {
        showError('Choose Boys or Girls for every selected learner, or use the buttons above.');
        return;
      }
      showError('');
      if (panel.dataset.mode === 'wizard') {
        var added = window.qcImportAdd ? window.qcImportAdd(picked) : 0;
        q('[data-result]').hidden = true;
        q('[data-summary]').textContent = '';
        showError('');
        var note = make('p', { className: 'imp-hint' }, 'Added ' + added + ' learner' + (added === 1 ? '' : 's') + ' to the list below.');
        panel.appendChild(note);
        setTimeout(function () { note.remove(); }, 6000);
        return;
      }
      var fd = new FormData();
      fd.append('learners', JSON.stringify(picked));
      post(panel.dataset.applyUrl, fd).then(function (res) {
        if (!res.ok || res.data.error) { showError(res.data.error || 'The learners could not be added.'); return; }
        // The edit page redirects to itself (#learners); a hash-only change would not reload it.
        var target = new URL(res.data.redirect, window.location.href);
        if (target.pathname === window.location.pathname) {
          window.location.hash = target.hash;
          window.location.reload();
        } else {
          window.location.href = target.href;
        }
      }).catch(function () { showError('The learners could not be added.'); });
    });
  });
})();
