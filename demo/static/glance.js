// Glance (templates/glance.html): one paper, full screen.
//
// The items QuickCheck wants the teacher to decide are asked one at a time, and the
// sheet zooms to each one. The score follows every choice. "Save & next" needs a
// decision for each item asked, and the learner; it says which is missing instead of
// sitting greyed out. Pinch, double-tap, the mouse wheel, the + / − buttons or the
// keyboard (+, −, 0, arrows on the focused sheet) zoom and move the sheet.
(function () {
  var cfg = window.QC_GLANCE;
  var $ = function (id) { return document.getElementById(id); };
  var form = $('glForm');
  var decided = {};
  var current = 0;

  function value(q) { return $('a' + q).value; }
  function setValue(q, v) { $('a' + q).value = v; }

  function answerPoints(q, v) {
    if (!v || v === 'MULTI') return 0;
    var row = cfg.choicePoints && cfg.choicePoints[q];
    return row ? Number(row[v] || 0) : (v === cfg.key[q] ? Number(cfg.points[q] || 1) : 0);
  }

  // ---- the score, live -----------------------------------------------------------
  function score() {
    var total = 0;
    for (var q = 1; q <= cfg.numItems; q++) {
      var v = value(q);
      total += answerPoints(q, v);
    }
    if ($('score')) $('score').textContent = total;
  }

  // ---- zoom -------------------------------------------------------------------------
  var sheet = $('sheet'), img = $('sheetImg');
  var s = 1, tx = 0, ty = 0;
  function apply() {
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
    sheet.classList.toggle('is-zoomed', s > 1.01);
  }
  function clamp() {
    var w = sheet.clientWidth, h = sheet.clientHeight;
    if (s <= 1.001) { s = 1; tx = 0; ty = 0; return; }
    tx = Math.min(0, Math.max(w - w * s, tx));
    ty = Math.min(0, Math.max(h - h * s, ty));
  }
  function zoomAt(px, py, ns) {
    ns = Math.max(1, Math.min(5, ns));
    tx = px - (px - tx) * (ns / s);
    ty = py - (py - ty) * (ns / s);
    s = ns;
    clamp();
    apply();
  }
  // Centre a point of the SHEET (in sheet pixels) at the given zoom.
  function focusOn(x, y, ns) {
    if (!cfg.readable || !img.naturalWidth) return;
    var w = sheet.clientWidth, h = sheet.clientHeight;
    var fit = Math.min(w / cfg.sheetW, h / cfg.sheetH);
    var ox = (w - cfg.sheetW * fit) / 2, oy = (h - cfg.sheetH * fit) / 2;
    s = ns;
    tx = w / 2 - (ox + x * fit) * s;
    ty = h / 2 - (oy + y * fit) * s;
    clamp();
    // The glide is a class, so its length is the stylesheet's and "reduce motion" can stop it.
    img.classList.add('is-gliding');
    apply();
    setTimeout(function () { img.classList.remove('is-gliding'); }, 400);
  }
  var pointers = {}, pinch = null, lastTap = 0;
  sheet.addEventListener('pointerdown', function (e) {
    sheet.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);
    if (ids.length === 2) {
      var a = pointers[ids[0]], b = pointers[ids[1]];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), s: s };
    } else {
      var now = Date.now();
      if (now - lastTap < 300) {
        var r = sheet.getBoundingClientRect();
        if (s > 1.01) { s = 1; clamp(); apply(); } else { zoomAt(e.clientX - r.left, e.clientY - r.top, 2.6); }
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }
    $('zoomHint').hidden = true;
  });
  sheet.addEventListener('pointermove', function (e) {
    if (!pointers[e.pointerId]) return;
    var prev = pointers[e.pointerId];
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);
    var r = sheet.getBoundingClientRect();
    if (ids.length === 2 && pinch) {
      var a = pointers[ids[0]], b = pointers[ids[1]];
      var dist = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, pinch.s * dist / pinch.dist);
    } else if (ids.length === 1 && s > 1) {
      tx += e.clientX - prev.x;
      ty += e.clientY - prev.y;
      clamp();
      apply();
    }
  });
  function lift(e) { delete pointers[e.pointerId]; if (Object.keys(pointers).length < 2) pinch = null; }
  sheet.addEventListener('pointerup', lift);
  sheet.addEventListener('pointercancel', lift);
  sheet.addEventListener('wheel', function (e) {
    e.preventDefault();
    var r = sheet.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, s * (e.deltaY < 0 ? 1.2 : 1 / 1.2));
  }, { passive: false });
  window.addEventListener('resize', function () { clamp(); apply(); });

  // Without a touch screen or a wheel: buttons and keys, zooming on the middle of the view.
  var ZOOM_STEP = 1.4, PAN_STEP = 60;
  function zoomMiddle(factor) { zoomAt(sheet.clientWidth / 2, sheet.clientHeight / 2, s * factor); $('zoomHint').hidden = true; }
  $('zoomIn').addEventListener('click', function () { zoomMiddle(ZOOM_STEP); });
  $('zoomOut').addEventListener('click', function () { zoomMiddle(1 / ZOOM_STEP); });
  $('zoomIn').addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  $('zoomOut').addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  sheet.addEventListener('keydown', function (e) {
    if (e.target !== sheet) return;
    var moves = { ArrowLeft: [PAN_STEP, 0], ArrowRight: [-PAN_STEP, 0], ArrowUp: [0, PAN_STEP], ArrowDown: [0, -PAN_STEP] };
    if (e.key === '+' || e.key === '=') zoomMiddle(ZOOM_STEP);
    else if (e.key === '-' || e.key === '_') zoomMiddle(1 / ZOOM_STEP);
    else if (e.key === '0') { s = 1; clamp(); apply(); }
    else if (moves[e.key] && s > 1.01) { tx += moves[e.key][0]; ty += moves[e.key][1]; clamp(); apply(); }
    else return;
    e.preventDefault();
  });
  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    $('zoomHint').textContent = 'Scroll to zoom';
  }

  // ---- the items to decide, one at a time ---------------------------------------
  function allDecided() { return cfg.asks.every(function (a) { return decided[a.q] !== undefined; }); }

  function showAsk(i) {
    if (!cfg.asks.length) return;
    current = i;
    var ask = cfg.asks[i];
    $('askText').textContent = ask.text;
    $('askCount').textContent = cfg.asks.length > 1 ? (i + 1) + ' of ' + cfg.asks.length : '';
    var box = $('askChoices');
    var hadFocus = box.contains(document.activeElement);
    box.textContent = '';
    ask.choices.concat(['']).forEach(function (choice) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = choice || 'None';
      b.setAttribute('aria-pressed', decided[ask.q] === choice ? 'true' : 'false');
      if (decided[ask.q] === choice) b.className = 'is-on';
      b.addEventListener('click', function () { decide(ask.q, choice); });
      box.appendChild(b);
    });
    if (hadFocus) (box.querySelector('.is-on') || box.firstChild).focus();
    if (img.complete) focusOn(ask.x, ask.y, 2.4);
    else img.addEventListener('load', function () { focusOn(ask.x, ask.y, 2.4); }, { once: true });
  }

  function decide(q, choice) {
    decided[q] = choice;
    setValue(q, choice);
    score();
    drawAll();
    var next = cfg.asks.findIndex(function (a, i) { return i > current && decided[a.q] === undefined; });
    if (next < 0) next = cfg.asks.findIndex(function (a) { return decided[a.q] === undefined; });
    if (next >= 0) {
      setTimeout(function () { showAsk(next); }, 160);
    } else {
      showAsk(current);
      $('askText').textContent = '✓ Done';
      $('askCount').textContent = '';
      s = 1; clamp(); apply();
    }
  }

  // ---- whose paper ---------------------------------------------------------------
  var who = $('whoSelect');
  $('whoBtn').addEventListener('click', function () {
    var box = $('whoBox');
    box.hidden = !box.hidden;
    this.setAttribute('aria-expanded', box.hidden ? 'false' : 'true');
    if (!box.hidden) who.focus();
  });
  who.addEventListener('change', function () {
    $('learnerIn').value = who.value;
    var label = who.options[who.selectedIndex].text.split(' — ').pop();
    $('whoName').textContent = who.value ? label : 'Who?';
  });

  // ---- all answers (to change one QuickCheck was sure of) -----------------------
  function drawAll() {
    var grid = $('allGrid');
    if (!grid) return;
    var focused = grid.contains(document.activeElement) ? document.activeElement.id : null;
    grid.textContent = '';
    for (var q = 1; q <= cfg.numItems; q++) {
      (function (q) {
        var v = value(q);
        var row = document.createElement('label');
        var asked = cfg.asks.some(function (a) { return a.q === q; }) && decided[q] === undefined;
        row.className = 'gl-item' + (asked ? ' is-ask' : v === cfg.key[q] ? ' is-correct'
          : answerPoints(q, v) > 0 ? ' is-partial' : v ? ' is-wrong' : '');
        var n = document.createElement('b');
        n.textContent = q;
        var sel = document.createElement('select');
        sel.id = 'allA' + q;
        sel.setAttribute('aria-label', 'Answer for item ' + q);
        [''].concat(cfg.choices[q]).forEach(function (c) {
          var o = document.createElement('option');
          o.value = c;
          o.textContent = c || '— blank';
          if (c === v || (v === 'MULTI' && c === '')) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', function () {
          if (cfg.asks.some(function (a) { return a.q === q; })) decided[q] = sel.value;
          setValue(q, sel.value);
          score();
          drawAll();
          if (cfg.asks.length) showAsk(current);
        });
        row.appendChild(n);
        row.appendChild(sel);
        grid.appendChild(row);
      })(q);
    }
    if (focused && $(focused)) $(focused).focus();
  }
  // A real dialog: the page behind it cannot be reached, Tab stays inside, Escape
  // closes it, and the teacher lands back on the button that opened it.
  if ($('allBtn')) {
    var panel = $('allPanel');
    var openAll = function () {
      drawAll();
      panel.hidden = false;
      form.inert = true;
      $('allClose').focus();
    };
    var closeAll = function () {
      panel.hidden = true;
      form.inert = false;
      $('allBtn').focus();
    };
    $('allBtn').addEventListener('click', openAll);
    $('allClose').addEventListener('click', closeAll);
    panel.addEventListener('click', function (e) { if (e.target === panel) closeAll(); });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeAll(); return; }
      if (e.key !== 'Tab') return;
      var stops = panel.querySelectorAll('button, select');
      var first = stops[0], last = stops[stops.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // ---- saving: say what is missing instead of greying the button out ------------
  form.addEventListener('submit', function (e) {
    var action = e.submitter ? e.submitter.value : 'save';
    if (action !== 'save') return;
    if (!allDecided()) {
      e.preventDefault();
      var i = cfg.asks.findIndex(function (a) { return decided[a.q] === undefined; });
      showAsk(i);
      qcToast('Decide item ' + cfg.asks[i].q + ' first.', 'warn');
      return;
    }
    if (!$('learnerIn').value) {
      e.preventDefault();
      $('whoBox').hidden = false;
      who.focus();
      qcToast('Choose whose paper this is first.', 'warn');
      return;
    }
    if (cfg.needsReplace && !$('replaceOk').checked) {
      e.preventDefault();
      $('replaceOk').focus();
      qcToast('Tick "Replace" to replace the saved score.', 'warn');
      return;
    }
    $('saveBtn').disabled = true;
    $('saveBtn').textContent = 'Saving…';
    if (cfg.camera) {
      e.preventDefault();
      saveThenNextPhoto();
    }
  });

  // ---- from the camera: Save & next paper = save this one AND open the camera -------
  // The camera can only open in the same tap that asked for it, so the save goes out
  // in the background while the camera opens. The next photo is sent once the save
  // is known to be done; a failed save shows this paper again with what went wrong.
  function saveThenNextPhoto() {
    var body = new FormData(form);
    body.append('action', 'save');
    var saved = fetch(location.href, { method: 'POST', body: body, credentials: 'same-origin' })
      .then(function (r) { return { ok: r.ok && r.url.indexOf('/glance/') < 0, url: r.url }; })
      .catch(function () { return { ok: false, url: location.href }; });
    var next = $('nextIn');
    var settled = false;
    function afterSave(then) {
      saved.then(function (res) {
        if (!res.ok) { location.href = res.url; return; }      // shows this paper and the problem
        then();
      });
    }
    next.addEventListener('change', function () {
      settled = true;
      var file = next.files && next.files[0];
      next.value = '';
      if (!file) { afterSave(function () { location.href = cfg.scanUrl; }); return; }
      afterSave(function () { sendNextPhoto(file); });
    }, { once: true });
    next.addEventListener('cancel', function () {             // the teacher closed the camera
      settled = true;
      afterSave(function () { location.href = cfg.scanUrl; });
    }, { once: true });
    next.click();
    // A browser without the cancel event: once saved, come back here and stay put.
    saved.then(function (res) {
      if (!res.ok) location.href = res.url;
      else window.addEventListener('focus', function () {
        setTimeout(function () { if (!settled) location.href = cfg.scanUrl; }, 600);
      }, { once: true });
    });
  }

  function sendNextPhoto(file) {
    qcToast('Saved. Reading the next paper…');
    var data = new FormData();
    data.append('photo', file, file.name || 'photo.jpg');
    data.append('client_id', Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
    fetch(cfg.photoUrl, { method: 'POST', body: data, credentials: 'same-origin', headers: { 'X-CSRF-Token': qcCsrf() } })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        var row = res.ok && res.d.added && res.d.added[0];
        if (!row) { qcToast((res.d && res.d.error) || "That photo couldn't be added. Try again.", 'bad'); location.href = cfg.scanUrl; return; }
        if (navigator.vibrate) { try { navigator.vibrate(row.status === 'retake' ? [90, 70, 90] : 45); } catch (e) {} }
        location.href = row.glance + (row.glance.indexOf('?') < 0 ? '?' : '&') + 'back=camera';
      })
      .catch(function () { qcToast("The photo couldn't be sent. Try again.", 'bad'); location.href = cfg.scanUrl; });
  }

  // ---- retake: a new photo takes this paper's place --------------------------------
  $('retakeBtn').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('retakeIn').click(); }
  });
  $('retakeIn').addEventListener('change', function () {
    var file = this.files && this.files[0];
    this.value = '';
    if (!file) return;
    qcToast('Sending the new photo…');
    var data = new FormData();
    data.append('photo', file, file.name || 'photo.jpg');
    data.append('replace', cfg.paperId);
    data.append('client_id', Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
    fetch(cfg.photoUrl, { method: 'POST', body: data, credentials: 'same-origin', headers: { 'X-CSRF-Token': qcCsrf() } })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok && res.d.added && res.d.added[0]) {
          if (navigator.vibrate) { try { navigator.vibrate(45); } catch (e) {} }
          var url = res.d.added[0].glance;
          location.href = cfg.camera ? url + (url.indexOf('?') < 0 ? '?' : '&') + 'back=camera' : url;
        } else {
          qcToast((res.d && res.d.error) || "The new photo couldn't be added. Try again.", 'bad');
        }
      })
      .catch(function () { qcToast("The new photo couldn't be sent. Check the Wi-Fi and try again.", 'bad'); });
  });

  // ---- keyboard: answer the asked item with its letter, Enter saves & goes next ----
  // Ignored while typing or choosing in a field, and while the all-answers dialog is open.
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))) return;
    if ($('allPanel') && !$('allPanel').hidden) return;
    var k = e.key.toUpperCase();
    if (cfg.asks.length) {
      var ask = cfg.asks[current];
      if (ask.choices.indexOf(k) >= 0) { e.preventDefault(); decide(ask.q, k); return; }
      if (k === 'N' || k === 'BACKSPACE') { e.preventDefault(); decide(ask.q, ''); return; }
    }
    if (e.key === 'ArrowLeft' && $('prevPaper')) { e.preventDefault(); location.href = $('prevPaper').href; return; }
    if (e.key === 'ArrowRight' && $('nextPaper')) { e.preventDefault(); location.href = $('nextPaper').href; return; }
    if (e.key === 'Enter' && !(t && /^(BUTTON|A|LABEL)$/.test(t.tagName))) {
      e.preventDefault();
      if (!$('saveBtn').disabled) form.requestSubmit($('saveBtn'));
    }
  });

  score();
  if (cfg.asks.length) showAsk(0);
})();
