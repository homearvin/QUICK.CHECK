/*
 * shrink.js — Shrink answer-sheet photos in the browser before uploading.
 *
 * Why: a phone camera makes a 2.4 MB, 3264-pixel-wide photo. One class of 40
 * papers is roughly 96 MB pushed across Wi-Fi, and the teacher waits for all
 * of it before checking even starts. QuickCheck's reader works from a much
 * smaller image anyway — tested on 15 real papers at 1600 px, every one of the
 * 750 answers came out identical to the full-size photo.
 *
 * So we resize to 1600 px on the long edge before sending: about 8x less to
 * upload, 8x less disk used, and no change to what the reader sees.
 *
 * Anything unexpected (an old browser, a PDF, a zip, a huge image that won't
 * decode) falls straight back to uploading the original file untouched.
 */
(function () {
  "use strict";

  var MAX_EDGE = 1600;      // long edge, in pixels
  var QUALITY = 0.85;       // JPEG quality
  var MIN_BYTES = 400 * 1024;   // don't bother with files already small

  // Old browser? Do nothing at all — the form keeps working as before.
  var supported = typeof FileReader !== "undefined" &&
                  typeof DataTransfer !== "undefined" &&
                  !!document.createElement("canvas").getContext;

  function shrinkOne(file) {
    return new Promise(function (resolve) {
      if (!file.type || file.type.indexOf("image/") !== 0 || file.size < MIN_BYTES) {
        resolve(file);                       // PDFs, zips, already-small images
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        try {
          var longest = Math.max(img.width, img.height);
          if (longest <= MAX_EDGE) { URL.revokeObjectURL(url); resolve(file); return; }
          var scale = MAX_EDGE / longest;
          var canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          var ctx = canvas.getContext("2d");
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          canvas.toBlob(function (blob) {
            // Only keep the smaller version if it really is smaller.
            if (!blob || blob.size >= file.size) { resolve(file); return; }
            var name = file.name.replace(/\.(png|heic|heif|webp|bmp|tiff?)$/i, ".jpg");
            resolve(new File([blob], name, { type: "image/jpeg",
                                             lastModified: file.lastModified }));
          }, "image/jpeg", QUALITY);
        } catch (e) {
          URL.revokeObjectURL(url);
          resolve(file);
        }
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function note(form, text) {
    var el = form.querySelector(".shrink-note");
    if (!el) {
      el = document.createElement("div");
      el.className = "shrink-note";
      el.style.cssText = "margin-top:10px;font-size:13px;color:#5b7066";
      form.appendChild(el);
    }
    el.textContent = text;
  }

  function wire(form) {
    if (form.dataset.shrinkWired) return;
    form.dataset.shrinkWired = "1";

    form.addEventListener("submit", function (event) {
      if (form.dataset.shrinkDone === "1") return;      // second pass: let it go

      var inputs = [];
      form.querySelectorAll('input[type="file"]').forEach(function (input) {
        if (input.files && input.files.length &&
            (input.accept || "").indexOf("image") !== -1) {
          inputs.push(input);
        }
      });
      if (!inputs.length) return;

      event.preventDefault();
      var buttons = form.querySelectorAll('button[type="submit"], button:not([type])');
      buttons.forEach(function (b) { b.disabled = true; });

      var jobs = [], total = 0;
      inputs.forEach(function (input) {
        Array.prototype.forEach.call(input.files, function (f) { total += f.size; });
        jobs.push(Promise.all(Array.prototype.map.call(input.files, shrinkOne))
          .then(function (files) {
            var box = new DataTransfer();
            files.forEach(function (f) { box.items.add(f); });
            input.files = box.files;
          }));
      });

      note(form, "Preparing photo(s) for upload…");

      Promise.all(jobs).then(function () {
        var after = 0;
        inputs.forEach(function (input) {
          Array.prototype.forEach.call(input.files, function (f) { after += f.size; });
        });
        if (after < total) {
          note(form, "Uploading " + (after / 1048576).toFixed(1) + " MB instead of " +
                     (total / 1048576).toFixed(1) + " MB — this is much faster.");
        } else {
          note(form, "Uploading…");
        }
      })["catch"](function () { /* fall through and send the originals */ })
        .then(function () {
          form.dataset.shrinkDone = "1";
          buttons.forEach(function (b) { b.disabled = false; });
          if (typeof form.requestSubmit === "function") form.requestSubmit();
          else form.submit();
        });
    });
  }

  if (!supported) return;
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('form[enctype="multipart/form-data"]').forEach(wire);
  });
})();
