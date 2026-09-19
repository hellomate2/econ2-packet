/* Econ 2 packet — progress, navigation, search. Shared by every page. */
(function () {
"use strict";

var KEY = "econ2packet.v2";
var THEME = "econ2packet.theme";
var M = window.MANIFEST || {};

function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
var state = load();

/* ---- totals across the whole packet, not just this page ---- */
function unitStat(n) {
  var q = (M[n] || {}).q || [], d = 0;
  for (var i = 0; i < q.length; i++) if (state[q[i]]) d++;
  return { done: d, total: q.length };
}
function allStat() {
  var d = 0, t = 0;
  for (var n in M) { var s = unitStat(n); d += s.done; t += s.total; }
  return { done: d, total: t };
}

/* ---- sidebar progress + per-unit ticks ---- */
var pbar = document.getElementById("pbar"), ptxt = document.getElementById("ptxt");
function paintNav() {
  var a = allStat();
  var pct = a.total ? Math.round(a.done / a.total * 100) : 0;
  if (pbar) pbar.style.width = pct + "%";
  if (ptxt) ptxt.textContent = a.done + " / " + a.total + " drills · " + pct + "%";
  document.querySelectorAll(".rail a[data-unit]").forEach(function (el) {
    var s = unitStat(el.getAttribute("data-unit"));
    el.classList.toggle("done", s.total > 0 && s.done === s.total);
  });
}

/* ---- checkboxes on a unit page ---- */
var boxes = [].slice.call(document.querySelectorAll(".chk"));
boxes.forEach(function (b) {
  if (state[b.id]) b.checked = true;
  b.addEventListener("change", function () {
    if (b.checked) state[b.id] = 1; else delete state[b.id];
    save(state); paintNav(); paintDash();
  });
});

/* ---- contents dashboard ---- */
function paintDash() {
  document.querySelectorAll("[data-unit-bar]").forEach(function (el) {
    var s = unitStat(el.getAttribute("data-unit-bar"));
    el.style.width = (s.total ? s.done / s.total * 100 : 0) + "%";
  });
  document.querySelectorAll("[data-unit-count]").forEach(function (el) {
    var s = unitStat(el.getAttribute("data-unit-count"));
    el.textContent = s.done + "/" + s.total;
    var card = el.closest(".ucard");
    if (card) card.classList.toggle("done", s.total > 0 && s.done === s.total);
  });
  (window.PARTS || []).forEach(function (p) {
    var d = 0, t = 0;
    p[2].forEach(function (n) { var s = unitStat(n); d += s.done; t += s.total; });
    var pct = t ? Math.round(d / t * 100) : 0;
    var ring = document.querySelector('[data-part-ring="' + p[0] + '"]');
    var lbl = document.querySelector('[data-part-pct="' + p[0] + '"]');
    if (ring) ring.style.background =
      "conic-gradient(var(--accent) " + (pct * 3.6) + "deg, var(--surface-2) 0deg)";
    if (lbl) lbl.textContent = pct + "%";
  });
  // "continue where you left off"
  var cta = document.getElementById("continue"), note = document.getElementById("ctanote");
  if (cta) {
    var next = null, a = allStat();
    for (var i = 1; i <= 28; i++) { var s = unitStat(i); if (s.total && s.done < s.total) { next = i; break; } }
    if (a.done === 0) {
      cta.textContent = "Start Unit 1"; cta.href = "u01.html";
      if (note) note.textContent = a.total + " drills ahead of you";
    } else if (next) {
      cta.textContent = "Continue · Unit " + next; cta.href = "u" + (next < 10 ? "0" : "") + next + ".html";
      if (note) note.textContent = a.done + " of " + a.total + " drills done";
    } else {
      cta.textContent = "Review Unit 25"; cta.href = "u25.html";
      if (note) note.textContent = "All " + a.total + " drills done. Go draw them from blank paper.";
    }
  }
}

paintNav(); paintDash();

var rb = document.getElementById("reset");
if (rb) rb.addEventListener("click", function () {
  if (!window.confirm("Clear drill progress for all 28 units?")) return;
  state = {}; save(state);
  boxes.forEach(function (b) { b.checked = false; });
  paintNav(); paintDash();
});

/* ---- mobile drawer ---- */
var rail = document.getElementById("rail"), menu = document.getElementById("menu"), scrim = null;
function closeRail() { if (rail) rail.classList.remove("open"); if (scrim) { scrim.remove(); scrim = null; } }
if (menu) menu.addEventListener("click", function () {
  if (rail.classList.contains("open")) return closeRail();
  rail.classList.add("open");
  scrim = document.createElement("button");
  scrim.className = "scrim"; scrim.setAttribute("aria-label", "Close navigator");
  scrim.addEventListener("click", closeRail);
  document.body.appendChild(scrim);
});
if (rail) rail.addEventListener("click", function (e) { if (e.target.closest("a")) closeRail(); });

/* ---- theme, remembered ---- */
try {
  var saved = localStorage.getItem(THEME);
  if (saved) document.documentElement.setAttribute("data-theme", saved);
} catch (e) {}
var tb = document.getElementById("theme");
if (tb) tb.addEventListener("click", function () {
  var cur = document.documentElement.getAttribute("data-theme");
  var dark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  var next = dark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem(THEME, next); } catch (e) {}
});

/* ---- search ---- */
var sw = document.getElementById("searchwrap"), si = document.getElementById("searchin"),
    sr = document.getElementById("searchres"), sbtn = document.getElementById("searchbtn");
var sel = 0, hits = [];

function openSearch() {
  if (!sw) return;
  sw.hidden = false; si.value = ""; sr.innerHTML = "";
  render(""); si.focus();
}
function closeSearch() { if (sw) sw.hidden = true; }

function render(q) {
  var data = window.SEARCH || [];
  q = q.trim().toLowerCase();
  hits = [];
  data.forEach(function (u) {
    if (!q) { hits.push({ u: u, why: u.m }); return; }
    var pool = [u.t, u.m].concat(u.h || []).concat(u.q || []);
    for (var i = 0; i < pool.length; i++) {
      if (String(pool[i]).toLowerCase().indexOf(q) > -1) {
        hits.push({ u: u, why: i < 2 ? u.m : pool[i] });
        return;
      }
    }
  });
  if (!hits.length) { sr.innerHTML = '<div class="sempty">Nothing matches &ldquo;' + q.replace(/</g, "&lt;") + '&rdquo;.</div>'; return; }
  sel = 0;
  sr.innerHTML = hits.slice(0, 40).map(function (h, i) {
    var n = h.u.n, pad = n < 10 ? "0" + n : n;
    return '<a class="sres' + (i === 0 ? " sel" : "") + '" href="u' + pad + '.html">' +
      "<b>" + pad + " · " + h.u.t + "</b>" +
      "<span>" + h.u.m + "</span>" +
      (h.why && h.why !== h.u.m ? "<em>" + h.why.slice(0, 130) + "…</em>" : "") +
      "</a>";
  }).join("");
}
function move(d) {
  var els = sr.querySelectorAll(".sres");
  if (!els.length) return;
  els[sel] && els[sel].classList.remove("sel");
  sel = (sel + d + els.length) % els.length;
  els[sel].classList.add("sel");
  els[sel].scrollIntoView({ block: "nearest" });
}

if (sbtn) sbtn.addEventListener("click", openSearch);
if (si) si.addEventListener("input", function () { render(si.value); });
if (sw) sw.addEventListener("click", function (e) { if (e.target === sw) closeSearch(); });

document.addEventListener("keydown", function (e) {
  var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  if (sw && !sw.hidden) {
    if (e.key === "Escape") { closeSearch(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); move(-1); return; }
    if (e.key === "Enter") {
      var el = sr.querySelector(".sres.sel");
      if (el) { e.preventDefault(); window.location.href = el.getAttribute("href"); }
      return;
    }
    return;
  }
  if (typing) return;
  if (e.key === "/") { e.preventDefault(); openSearch(); return; }
  // arrow keys walk the packet
  var pg = null;
  if (e.key === "ArrowRight") pg = document.querySelector(".pg.next");
  if (e.key === "ArrowLeft") pg = document.querySelector(".pg.prev");
  if (pg) window.location.href = pg.getAttribute("href");
});
})();
