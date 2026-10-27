// Scan and Sort (templates/scan.html).
//
// Every photo is its own upload, sent the moment it is taken or chosen. A dropped
// Wi-Fi or a locked screen costs one photo, which is simply sent again — never the
// whole batch, which is what used to happen with one 100 MB upload of 50 photos.
// Each upload carries a client_id, so a retry after a lost answer is saved once.
// A photo waiting to be sent is also kept in this browser's own storage until the
// computer confirms it, so a phone that sleeps, a closed tab or a reload loses
// nothing; and when the computer can't be reached the page says so, keeps checking,
// and sends everything by itself the moment it is back.
// The phone vibrates, ticks and counts for every paper that arrives, so the teacher
// knows it was taken and never has to wonder whether to take it again.
(function () {
  var cfg = window.QC_SCAN;
  var rows = cfg.rows || [];
  var counts = cfg.counts || { ready: 0, check: 0, retake: 0 };
  var jobs = [];              // photos on this phone that are not in QuickCheck yet
  var active = 0;
  var MAX_AT_ONCE = 2;        // two uploads side by side keep the Wi-Fi busy without choking it
  var MAX_TRIES = 6;
  var bulk = { total: 0, done: 0 };
  var LINK_CHECK_MS = 4000;   // how often a lost computer is looked for again
  var link = 'up';            // 'up', 'down' (computer not answering) or 'signin' (phone must sign in again)

  var $ = function (id) { return document.getElementById(id); };
  // A mouse or trackpad means a computer (focus.css uses the same test): files in, no camera.
  var onComputer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---- feedback: a vibration and a short tick for every paper that arrives ----------
  var audio = null;
  function wakeAudio() {
    if (audio || !(window.AudioContext || window.webkitAudioContext)) return;
    try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audio = null; }
  }
  function tone(freq, start, length) {
    var osc = audio.createOscillator(), gain = audio.createGain();
    var t = audio.currentTime + start;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
    osc.connect(gain); gain.connect(audio.destination);
    osc.start(t); osc.stop(t + length + 0.01);
  }
  // A good photo: one short high tick and buzz. Take it again: two low ones.
  function tick(bad) {
    if (navigator.vibrate) { try { navigator.vibrate(bad ? [90, 70, 90] : 45); } catch (e) {} }
    if (!audio) return;
    try {
      if (bad) { tone(330, 0, 0.14); tone(262, 0.18, 0.18); } else { tone(1320, 0, 0.12); }
    } catch (e) {}
  }
  ['shootBtn', 'galleryBtn', 'chooseBtn', 'folderBtn', 'checkRetake'].forEach(function (id) {
    $(id).addEventListener('click', wakeAudio);        // browsers only allow sound after a tap
    $(id).addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wakeAudio(); this.click(); }
    });
  });

  // ---- the queue ----------------------------------------------------------------
  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }

  var retakeOf = null;         // the paper a "Take it again" photo takes the place of

  // ---- photos waiting on this phone are kept until the computer has them ------------
  // IndexedDB, one record per photo, for this test only. If the browser won't keep
  // them (private mode, no space), the page works exactly as before and warns before
  // being closed with photos unsent.
  var kept = (function () {
    var db = null, test = cfg.photoUrl;
    function open() {
      if (db || !window.indexedDB) return Promise.resolve(db);
      return new Promise(function (resolve) {
        try {
          var req = indexedDB.open('quickcheck-waiting-photos', 1);
          req.onupgradeneeded = function () { req.result.createObjectStore('photos', { keyPath: 'clientId' }); };
          req.onsuccess = function () { db = req.result; resolve(db); };
          req.onerror = req.onblocked = function () { resolve(null); };
        } catch (e) { resolve(null); }
      });
    }
    function run(mode, work) {
      return open().then(function (store) {
        if (!store) return null;
        return new Promise(function (resolve) {
          try {
            var tx = store.transaction('photos', mode), request = work(tx.objectStore('photos'));
            tx.oncomplete = function () { resolve(request ? request.result : true); };
            tx.onerror = tx.onabort = function () { resolve(null); };
          } catch (e) { resolve(null); }
        });
      });
    }
    return {
      put: function (job) {
        return run('readwrite', function (s) {
          return s.put({ clientId: job.clientId, test: test, file: job.file, name: job.file.name || 'photo.jpg',
                         replace: job.replace || null, at: Date.now() });
        }).then(function (ok) { job.kept = ok !== null; });
      },
      drop: function (job) { return run('readwrite', function (s) { return s['delete'](job.clientId); }); },
      list: function () {
        return run('readonly', function (s) { return s.getAll(); }).then(function (all) {
          return (all || []).filter(function (r) { return r.test === test; });
        });
      }
    };
  })();

  function add(files) {
    var list = Array.prototype.slice.call(files || []);
    if (!list.length) return;
    list.forEach(function (file, i) {
      var job = { file: file, clientId: newId(), state: link === 'up' ? 'waiting' : 'held', tries: 0, error: '',
                  replace: i === 0 ? retakeOf : null };
      jobs.push(job);
      kept.put(job);
    });
    retakeOf = null;
    if (list.length > 1 || bulk.total) { bulk.total += list.length; }
    render();
    pump();
  }

  function pump() {
    while (active < MAX_AT_ONCE && link === 'up') {
      var job = jobs.find(function (j) { return j.state === 'waiting'; });
      if (!job) break;
      send(job);
    }
    if (!active && !jobs.some(function (j) { return j.state === 'waiting' || j.state === 'retry'; })) {
      bulk = { total: 0, done: 0 };
      render();
    }
  }

  function send(job) {
    job.state = 'sending';
    active++;
    render();
    var form = new FormData();
    form.append('photo', job.file, job.file.name || 'photo.jpg');
    form.append('client_id', job.clientId);
    if (job.replace) form.append('replace', job.replace);
    fetch(cfg.photoUrl, { method: 'POST', body: form, credentials: 'same-origin',
                          headers: { 'X-CSRF-Token': qcCsrf() } })
      .then(function (r) {
        var json = /json/.test(r.headers.get('Content-Type') || '');
        return (json ? r.json() : Promise.resolve(null)).catch(function () { return null; })
          .then(function (d) { return { status: r.status, ok: r.ok, d: d }; });
      })
      .then(function (res) {
        active--;
        if (res.ok && res.d && (res.d.added || res.d.rows)) {
          // Only QuickCheck's own answer counts as "arrived" - never a page that
          // happened to load in its place.
          jobs.splice(jobs.indexOf(job), 1);
          kept.drop(job);
          if (bulk.total) bulk.done++;
          rows = res.d.rows || rows;
          counts = res.d.counts || counts;
          arrived(res.d.added || []);
        } else if (!res.d && res.status < 500) {
          // Not QuickCheck's answer: the computer wants this phone signed in again
          // (a security check or the PIN page). Retrying can't help until it is.
          job.state = 'held';
          setLink('signin');
        } else if (res.status >= 500) {
          retry(job);
        } else {
          job.state = 'failed';
          job.error = res.d.error || 'This photo could not be added.';
          kept.drop(job);
          qcToast(job.error, 'bad');
        }
        render();
        pump();
      })
      .catch(function () {
        // No answer at all: Wi-Fi gone, computer asleep or QuickCheck closed.
        active--;
        job.state = 'held';
        setLink('down');
        render();
      });
  }

  function retry(job) {
    job.tries++;
    if (job.tries >= MAX_TRIES) {
      // The computer answers but keeps failing on this photo: hold it (it is kept
      // on the phone) and look again, rather than ask the teacher to tap it.
      job.state = 'held';
      job.tries = 0;
      setLink('down');
      return;
    }
    job.state = 'retry';
    setTimeout(function () { job.state = 'waiting'; pump(); }, Math.min(15000, 800 * Math.pow(2, job.tries)));
  }

  // ---- is the computer there? ----------------------------------------------------
  var linkTimer = null;
  function setLink(state) {
    link = state;
    clearTimeout(linkTimer);
    if (state === 'down') linkTimer = setTimeout(lookForComputer, LINK_CHECK_MS);
    showLink();
  }
  function lookForComputer() {
    if (link !== 'down') return;
    fetch(cfg.healthUrl, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (r) { if (r.ok) backAgain(); else setLink('down'); })
      .catch(function () { setLink('down'); });
  }
  function backAgain() {
    var waiting = jobs.filter(function (j) { return j.state === 'held'; }).length;
    jobs.forEach(function (j) { if (j.state === 'held') { j.state = 'waiting'; j.tries = 0; } });
    setLink('up');
    if (waiting) qcToast('Connected again - sending ' + waiting + (waiting === 1 ? ' photo' : ' photos'));
    render();
    pump();
  }
  function showLink() {
    var bar = $('linkBar');
    if (!bar) return;
    var held = jobs.filter(function (j) { return j.state === 'held'; }).length;
    var photos = held === 1 ? 'Your photo is' : 'Your ' + held + ' photos are';
    bar.hidden = link === 'up';
    bar.className = 'fx-conn ' + (link === 'signin' ? 'is-signin' : 'is-down');
    $('linkTitle').textContent = link === 'signin' ? 'Sign this phone in again' : "Can't reach your computer";
    $('linkText').textContent = link === 'signin'
      ? 'Your computer is asking for the PIN again. ' + (held ? photos + ' kept on this phone and will send once you are signed in.' : '')
      : 'Keep QuickCheck open on the computer and stay on the same Wi-Fi. ' +
        (held ? photos + ' kept on this phone and will send by themselves.' : 'Checking again every few seconds.');
    $('linkAction').hidden = link !== 'signin';
  }
  // A phone waking, coming back to this tab or finding Wi-Fi again: look at once.
  function wake() {
    if (document.hidden) return;
    if (link === 'down') { clearTimeout(linkTimer); lookForComputer(); }
    else if (link === 'up') {
      jobs.forEach(function (j) { if (j.state === 'held') j.state = 'waiting'; });
      pump();
    }
  }
  window.addEventListener('online', wake);
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('pageshow', wake);

  function arrived(added) {
    var row = added[0];
    tick(row && row.status === 'retake');
    if (!row) return;
    var pill = $('barPill');
    pill.hidden = false;
    pill.textContent = 'Paper ' + row.n + (row.status === 'retake' ? ' ✗' : ' ✓');
    pill.className = 'fx-pill' + (row.status === 'retake' ? ' is-bad' : '');
    if (bulk.total) return;                     // a whole gallery: the list says it all
    // On a phone, one paper at a time: a photo that was read opens its checked view —
    // the marks, the score, whose it is, anything to decide — with Save & next paper.
    // A photo that couldn't be read still says "Take it again" right here.
    if (!onComputer && row.status !== 'retake' && row.glance) {
      location.href = row.glance + (row.glance.indexOf('?') < 0 ? '?' : '&') + 'back=camera';
      return;
    }
    showCheck(row);
  }

  // ---- straight after each photo: green, amber or red, full screen ----------------
  // The phone's own camera can't show QuickCheck's guide while the photo is taken (a
  // browser only lets a page use the camera itself on a secure address), so the check
  // comes the moment the photo arrives — about a second — with the four corner squares
  // showing which ones the photo caught.
  var WORTH_A_LOOK = { sheet: true, many_unclear: true, blurry: true };
  var checkTimer = null;

  function showCheck(row) {
    var box = $('check');
    var kind = row.status === 'retake' ? 'bad' : WORTH_A_LOOK[row.reason_code] ? 'warn' : 'good';
    box.className = 'fx-check' + (kind === 'bad' ? ' is-bad' : kind === 'warn' ? ' is-warn' : '');
    var found = row.found || [];
    $('checkMap').querySelectorAll('i').forEach(function (square, i) {
      square.className = 'c' + i + (found.indexOf(i) >= 0 ? ' is-found' : ' is-missing');
    });
    if (kind === 'good') {
      $('checkTitle').textContent = 'Good photo ✓';
      $('checkText').textContent = 'Paper ' + row.n + ' · ' +
        (row.status === 'ready' ? 'every answer read' : 'read · ' + row.tag.toLowerCase() + ' later');
    } else {
      $('checkTitle').textContent = kind === 'bad' ? 'Take it again' : 'Read, but check this photo';
      $('checkText').textContent = row.reason;
    }
    if (kind === 'good' && onComputer) {
      qcToast($('checkText').textContent);
      return;
    }
    $('checkActions').hidden = kind === 'good';
    box.dataset.paper = row.id;
    box.hidden = false;
    clearTimeout(checkTimer);
    if (kind === 'good') checkTimer = setTimeout(closeCheck, 1400);
    else $('checkRetake').focus();
  }

  function closeCheck() {
    clearTimeout(checkTimer);
    $('check').hidden = true;
  }

  $('check').addEventListener('click', function () { if ($('checkActions').hidden) closeCheck(); });
  $('checkSkip').addEventListener('click', closeCheck);
  $('checkRetake').addEventListener('click', function () {
    retakeOf = $('check').dataset.paper;         // the new photo takes this paper's place
    closeCheck();
  });
  ['shootBtn', 'galleryBtn', 'chooseBtn', 'folderBtn'].forEach(function (id) {
    $(id).addEventListener('click', function () { retakeOf = null; });
  });

  // ---- drawing the screen -----------------------------------------------------------
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function rowNode(r) {
    var node = el('a', 'fx-row');
    node.href = r.glance;
    node.appendChild(el('i', 'fx-thumb'));
    node.appendChild(el('span', 'fx-who', 'Paper ' + r.n + (r.name ? ' · ' + r.name : '')));
    var em;
    if (r.status === 'ready') em = el('em', 'fx-ok', 'Ready ' + r.score + '/' + r.total);
    else if (r.status === 'retake') em = el('em', 'fx-bad', r.tag);
    else em = el('em', 'fx-warn', r.tag);
    node.appendChild(em);
    return node;
  }

  function jobNode(job, n) {
    var node = el(job.state === 'failed' ? 'button' : 'div', 'fx-row');
    node.appendChild(el('i', 'fx-thumb'));
    node.appendChild(el('span', 'fx-who', 'Paper ' + n));
    var words = { waiting: ['Waiting', 'fx-wait'], sending: ['Sending…', 'fx-wait'],
                  retry: ['Wi-Fi slow · trying again', 'fx-warn'],
                  held: ['Kept on this phone · will send', 'fx-warn'],
                  failed: ['Not added · tap to try again', 'fx-bad'] }[job.state];
    node.appendChild(el('em', words[1], words[0]));
    if (job.state === 'failed') {
      node.type = 'button';
      node.style.width = '100%';
      node.style.font = 'inherit';
      node.style.cursor = 'pointer';
      node.title = job.error;
      node.addEventListener('click', function () { job.state = 'waiting'; job.tries = 0; pump(); render(); });
    }
    return node;
  }

  function render() {
    var reading = bulk.total > 0;
    document.body.classList.toggle('is-reading', reading);
    $('scanMode').hidden = reading && !onComputer;     // a computer keeps its drop area in view
    $('barTitle').textContent = reading ? 'Reading your papers' : 'QuickCheck';
    if (reading) {
      $('barPill').hidden = false;
      $('barPill').className = 'fx-pill';
      $('barPill').textContent = bulk.done + ' / ' + bulk.total;
    }
    $('meter').hidden = !reading;
    $('meterBar').style.width = (reading ? Math.round(100 * bulk.done / bulk.total) : 0) + '%';

    var list = $('rows');
    list.textContent = '';
    // Newest first while photos are coming in, so the one just taken is on top.
    var pending = jobs.map(function (job, i) { return jobNode(job, rows.length + i + 1); }).reverse();
    pending.forEach(function (node) { var li = el('li'); li.appendChild(node); list.appendChild(li); });
    rows.slice().reverse().forEach(function (r) { var li = el('li'); li.appendChild(rowNode(r)); list.appendChild(li); });

    var any = rows.length + jobs.length > 0;
    $('batch').hidden = !any;
    $('batchTitle').textContent = reading ? 'Sorting as they arrive' : 'Your papers';
    $('counter').textContent = cfg.savedCount + ' of ' + cfg.classSize + ' learners recorded · ' + rows.length + ' papers waiting';
    $('bottom').hidden = !rows.length;
    var waiting = counts.check + counts.retake;
    var go = !rows.length ? 'Check and save'
      : waiting ? 'Check and save · ' + counts.ready + ' ready, ' + waiting + ' to look at'
      : 'Save ' + counts.ready + ' ready ' + (counts.ready === 1 ? 'paper' : 'papers');
    $('goDone').firstChild.textContent = go;
    $('goDoneDesk').firstChild.textContent = go;
    showLink();
  }

  // ---- the two ways in ----------------------------------------------------------
  var PHOTO = /\.(jpe?g|jfif|png|bmp|webp|tiff?|pdf|zip)$/i;
  function addPhotos(files) {
    // A folder also holds things that aren't photos (Thumbs.db, notes); leave those out.
    var photos = Array.prototype.filter.call(files || [], function (f) { return PHOTO.test(f.name) || /^image\//.test(f.type); });
    if (!photos.length && files && files.length) qcToast("Those files aren't photos QuickCheck can read. Use JPG or PNG, a PDF or a .zip.", 'warn');
    add(photos);
  }
  ['camIn', 'galleryIn', 'folderIn'].forEach(function (id) {
    $(id).addEventListener('change', function () {
      addPhotos(this.files);
      this.value = '';        // the next photo is a new choice, never a replacement
    });
  });

  // ---- on a computer: drop the photos in (whole folders too) ------------------------
  var drop = $('dropZone');
  function entryFiles(entry) {
    return new Promise(function (resolve) {
      if (entry.isFile) { entry.file(function (f) { resolve([f]); }, function () { resolve([]); }); return; }
      if (!entry.isDirectory) { resolve([]); return; }
      var reader = entry.createReader(), found = [];
      (function more() {                          // a folder is read in chunks until one comes back empty
        reader.readEntries(function (batch) {
          if (!batch.length) {
            Promise.all(found.map(entryFiles)).then(function (lists) { resolve([].concat.apply([], lists)); });
            return;
          }
          found = found.concat(Array.prototype.slice.call(batch));
          more();
        }, function () { resolve([]); });
      })();
    });
  }
  ['dragenter', 'dragover'].forEach(function (type) {
    drop.addEventListener(type, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    drop.addEventListener(type, function () { drop.classList.remove('is-over'); });
  });
  drop.addEventListener('drop', function (e) {
    e.preventDefault();
    retakeOf = null;
    wakeAudio();
    var items = e.dataTransfer.items;
    var entries = items ? Array.prototype.map.call(items, function (it) { return it.webkitGetAsEntry && it.webkitGetAsEntry(); }).filter(Boolean) : [];
    if (!entries.length) { addPhotos(e.dataTransfer.files); return; }
    Promise.all(entries.map(entryFiles)).then(function (lists) { addPhotos([].concat.apply([], lists)); });
  });
  // Dropping a file anywhere else would open it in the window instead of adding it.
  ['dragover', 'drop'].forEach(function (type) {
    window.addEventListener(type, function (e) { if (!drop.contains(e.target)) e.preventDefault(); });
  });

  // ---- on a computer: papers sent from the phone show up here as they arrive ----------
  if (onComputer && cfg.stateUrl) {
    setInterval(function () {
      if (document.hidden || active || jobs.length) return;
      fetch(cfg.stateUrl, { cache: 'no-store', credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || !d.rows) return;
          var known = {};
          rows.forEach(function (r) { known[r.id] = true; });
          var fresh = d.rows.filter(function (r) { return !known[r.id]; }).length;
          rows = d.rows;
          if (typeof d.saved_count === 'number') cfg.savedCount = d.saved_count;
          if (typeof d.class_size === 'number') cfg.classSize = d.class_size;
          counts = d.counts || counts;
          render();
          if (fresh) qcToast(fresh === 1 ? '1 new paper from your phone' : fresh + ' new papers from your phone');
        })
        .catch(function () {});
    }, 4000);
  }

  // Closing the page only loses photos the browser would not keep.
  window.addEventListener('beforeunload', function (e) {
    if (jobs.some(function (j) { return !j.kept; })) { e.preventDefault(); e.returnValue = ''; }
  });

  // Photos kept from before (the phone slept, the tab was closed, the page reloaded):
  // carry on sending them. Their ids are the same, so one that had in fact arrived
  // is recognised by the computer and not added twice.
  kept.list().then(function (left) {
    var known = {};
    jobs.forEach(function (j) { known[j.clientId] = true; });
    left = left.filter(function (r) { return !known[r.clientId]; });
    if (!left.length) return;
    left.sort(function (a, b) { return a.at - b.at; }).forEach(function (r) {
      jobs.push({ file: r.file, clientId: r.clientId, state: 'waiting', tries: 0, error: '',
                  replace: r.replace, kept: true });
    });
    qcToast(left.length === 1 ? 'Sending 1 photo kept on this phone' : 'Sending ' + left.length + ' photos kept on this phone');
    render();
    pump();
  });

  if ($('linkAction')) $('linkAction').addEventListener('click', function () { location.reload(); });
  render();
})();
