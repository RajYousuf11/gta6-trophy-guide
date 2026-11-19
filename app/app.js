/* Leonida Legend — trophy tracker logic.
   Loads app/data/trophies.json, renders the checklist, keeps earned state in
   localStorage, and offers export / import of that progress. No network calls
   besides the local data file fetch. */
(function () {
  "use strict";

  var STORAGE_KEY = "leonida-legend-earned-v1";
  var SPOILER_KEY = "leonida-legend-spoilers-v1";
  var DATA_URL = "data/trophies.json";

  var trophies = [];
  var earned = loadEarned();
  var openGuideId = null;

  var listEl = document.getElementById("trophyList");
  var emptyEl = document.getElementById("emptyNote");
  var searchEl = document.getElementById("searchBox");
  var gradeEl = document.getElementById("gradeFilter");
  var kindEl = document.getElementById("kindFilter");
  var statusEl = document.getElementById("statusFilter");
  var missableEl = document.getElementById("missableFilter");
  var spoilerEl = document.getElementById("spoilerToggle");
  var progressFill = document.getElementById("progressFill");
  var progressText = document.getElementById("progressText");
  var gradeCountsEl = document.getElementById("gradeCounts");
  var resultCountEl = document.getElementById("resultCount");
  var saveNoteEl = document.getElementById("saveNote");
  var missableBanner = document.getElementById("missableBanner");

  function loadEarned() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function saveEarned() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
      saveNoteEl.textContent = "Progress saved in this browser.";
    } catch (err) {
      saveNoteEl.textContent = "Could not save in this browser (storage unavailable).";
    }
  }

  function readParams() {
    var params = new URLSearchParams(window.location.search);
    var grade = params.get("grade");
    if (grade && ["platinum", "gold", "silver", "bronze"].indexOf(grade) !== -1) {
      gradeEl.value = grade;
    }
    var spoiler = params.get("spoiler");
    if (spoiler === "off" || spoiler === "false" || spoiler === "0") {
      spoilerEl.checked = false;
    } else if (spoiler === "on" || spoiler === "true" || spoiler === "1") {
      spoilerEl.checked = true;
    } else {
      try {
        var stored = localStorage.getItem(SPOILER_KEY);
        if (stored === "off") spoilerEl.checked = false;
      } catch (err) { /* keep default */ }
    }
    var open = params.get("open");
    if (open) openGuideId = parseInt(open, 10);
    if (params.get("view") === "roadmap") {
      var section = document.getElementById("roadmapSection");
      if (section) section.scrollIntoView();
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isSpoilerHidden(trophy) {
    return spoilerEl.checked && trophy.spoiler && !earned[trophy.id];
  }

  function trophyMatches(trophy) {
    var query = searchEl.value.trim().toLowerCase();
    if (query) {
      var hay = (trophy.name + " " + trophy.description + " " + trophy.guide).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    if (gradeEl.value !== "all" && trophy.grade !== gradeEl.value) return false;
    if (kindEl.value !== "all" && trophy.kind !== kindEl.value) return false;
    if (statusEl.value === "earned" && !earned[trophy.id]) return false;
    if (statusEl.value === "unearned" && earned[trophy.id]) return false;
    if (missableEl.checked && !trophy.missable) return false;
    return true;
  }

  function renderProgress() {
    var total = trophies.length;
    var done = trophies.filter(function (t) { return earned[t.id]; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    progressFill.style.width = pct + "%";
    progressText.textContent = done + " of " + total + " trophies earned — " + pct + "% to the platinum";
    var counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    var doneCounts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    trophies.forEach(function (t) {
      counts[t.grade] += 1;
      if (earned[t.id]) doneCounts[t.grade] += 1;
    });
    gradeCountsEl.textContent =
      "Platinum " + doneCounts.platinum + "/" + counts.platinum +
      " · Gold " + doneCounts.gold + "/" + counts.gold +
      " · Silver " + doneCounts.silver + "/" + counts.silver +
      " · Bronze " + doneCounts.bronze + "/" + counts.bronze;
    var missable = trophies.filter(function (t) { return t.missable; });
    var missed = missable.filter(function (t) { return !earned[t.id]; });
    missableBanner.textContent = missed.length
      ? "Missable warning: " + missed.map(function (t) { return t.name; }).join(", ") +
        " — do the Chapter 1 balcony meditation before finishing Chapter 1. Every other trophy can be earned after the story."
      : "Missable warning: the one possibly missable trophy (Positive Mental Attitude) is earned. Nothing else in the list can be missed.";
  }

  function renderList() {
    var shown = trophies.filter(trophyMatches);
    listEl.innerHTML = "";
    shown.forEach(function (trophy) {
      var li = document.createElement("li");
      li.className = "trophy-card" +
        (earned[trophy.id] ? " earned" : "") +
        (trophy.missable ? " missable-card" : "");
      li.id = "trophy-" + trophy.id;

      var hidden = isSpoilerHidden(trophy);
      var nameHtml = hidden
        ? '<span class="spoiler-hidden">Hidden story trophy — earn it (or turn spoilers on) to reveal its name.</span>'
        : escapeHtml(trophy.name);
      var descHtml = hidden
        ? '<span class="spoiler-hidden">Description hidden until earned.</span>'
        : escapeHtml(trophy.description);

      var tags = '<span class="tag">' + escapeHtml(trophy.kind) + '</span>' +
        '<span class="tag points-tag">' + trophy.points + ' pts</span>';
      if (trophy.secret) tags += '<span class="tag secret-tag">Hidden on PSN</span>';
      if (trophy.missable) tags += '<span class="tag missable-tag">MISSABLE</span>';

      var guideOpen = openGuideId === trophy.id;
      var guideHtml = "";
      if (guideOpen) {
        var sourceLinks = trophy.sources.map(function (s) {
          return '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' +
            escapeHtml(s.site) + '</a>';
        }).join(" &middot; ");
        guideHtml = '<div class="trophy-guide"><p>' + escapeHtml(trophy.guide) + '</p>' +
          '<p class="sources">Sources: ' + sourceLinks + '</p></div>';
      }

      li.innerHTML =
        '<div class="card-head">' +
          '<input type="checkbox" class="earned-box" data-id="' + trophy.id + '"' +
            (earned[trophy.id] ? " checked" : "") +
            ' aria-label="Mark ' + escapeHtml(trophy.name) + ' as earned">' +
          '<div class="card-main">' +
            '<h3 class="card-title">' + nameHtml +
              '<span class="grade-badge grade-' + trophy.grade + '">' + trophy.grade + '</span></h3>' +
            '<p class="official-desc">Official: ' + descHtml + '</p>' +
            '<div class="card-tags">' + tags + '</div>' +
            (trophy.missable
              ? '<p class="missable-note">Missable: ' + escapeHtml(trophy.missable_note) + '</p>'
              : "") +
            '<button type="button" class="guide-toggle" data-id="' + trophy.id + '">' +
              (guideOpen ? "Hide guide" : "Show guide") + '</button>' +
            guideHtml +
          '</div>' +
        '</div>';
      listEl.appendChild(li);
    });
    emptyEl.hidden = shown.length !== 0;
    resultCountEl.textContent = "Showing " + shown.length + " of " + trophies.length + " trophies.";
    renderProgress();
  }

  function toggleGuide(id) {
    openGuideId = openGuideId === id ? null : id;
    renderList();
    if (openGuideId !== null) {
      var card = document.getElementById("trophy-" + openGuideId);
      if (card) card.scrollIntoView({ block: "nearest" });
    }
  }

  function exportProgress() {
    var payload = {
      app: "leonida-legend",
      exported_at: new Date().toISOString(),
      earned_ids: trophies.filter(function (t) { return earned[t.id]; }).map(function (t) { return t.id; })
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "gta6-trophy-progress.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    saveNoteEl.textContent = "Exported " + payload.earned_ids.length + " earned trophies.";
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        var ids = parsed.earned_ids || parsed.earned || parsed;
        if (!Array.isArray(ids)) throw new Error("bad file");
        var known = {};
        trophies.forEach(function (t) { known[t.id] = true; });
        var added = 0;
        ids.forEach(function (id) {
          var num = Number(id);
          if (known[num] && !earned[num]) { earned[num] = true; added += 1; }
        });
        saveEarned();
        renderList();
        saveNoteEl.textContent = "Imported progress: " + added + " new trophies marked earned.";
      } catch (err) {
        saveNoteEl.textContent = "Import failed: that file is not a Leonida Legend progress export.";
      }
    };
    reader.readAsText(file);
  }

  listEl.addEventListener("change", function (event) {
    var box = event.target;
    if (box.classList && box.classList.contains("earned-box")) {
      var id = Number(box.getAttribute("data-id"));
      earned[id] = box.checked;
      if (!box.checked) delete earned[id];
      saveEarned();
      renderList();
    }
  });

  listEl.addEventListener("click", function (event) {
    var btn = event.target;
    if (btn.classList && btn.classList.contains("guide-toggle")) {
      toggleGuide(Number(btn.getAttribute("data-id")));
    }
  });

  [searchEl, gradeEl, kindEl, statusEl, missableEl].forEach(function (el) {
    el.addEventListener("input", renderList);
    el.addEventListener("change", renderList);
  });

  spoilerEl.addEventListener("change", function () {
    try {
      localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? "on" : "off");
    } catch (err) { /* ignore */ }
    renderList();
  });

  document.getElementById("exportButton").addEventListener("click", exportProgress);
  document.getElementById("importButton").addEventListener("click", function () {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", function (event) {
    if (event.target.files && event.target.files[0]) importProgress(event.target.files[0]);
    event.target.value = "";
  });
  document.getElementById("resetButton").addEventListener("click", function () {
    if (window.confirm("Clear all earned checkmarks?")) {
      earned = {};
      saveEarned();
      renderList();
    }
  });

  readParams();
  fetch(DATA_URL)
    .then(function (response) {
      if (!response.ok) throw new Error("trophies.json not found");
      return response.json();
    })
    .then(function (data) {
      trophies = data.trophies || data;
      renderList();
    })
    .catch(function () {
      progressText.textContent = "Could not load the trophy list. Open this guide from its own folder (node serve.ts).";
    });
})();
