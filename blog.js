/* =========================================================
   Javlonbek Yokubov — Blog interactions
   Self-contained (does NOT load script.js): header scroll,
   mobile nav, reveal-on-scroll, and the UZ/RU/EN language
   toggle. All motion respects prefers-reduced-motion.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Language toggle (UZ / RU / EN) ---------- */
  var LANGS = ["uz", "ru", "en"];
  var STORE_KEY = "jy-blog-lang";

  function safeGet() {
    try { return window.localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function safeSet(v) {
    try { window.localStorage.setItem(STORE_KEY, v); } catch (e) {}
  }

  var langBtns = Array.prototype.slice.call(document.querySelectorAll(".lang-btn"));

  function applyLang(lang) {
    if (LANGS.indexOf(lang) === -1) lang = "en";
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);              // real lang attr for a11y/SEO
    langBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    safeSet(lang);
  }

  if (langBtns.length) {
    langBtns.forEach(function (b) {
      b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
    });
    // Restore saved choice; fall back to the attribute already on <html>.
    var saved = safeGet();
    applyLang(saved || root.getAttribute("data-lang") || "en");
  }

  /* ---------- Header: blur/border on scroll ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Reading progress (article pages only) ----------
     Fills the top ink bar as a share of total page scroll. */
  var progressBar = document.querySelector(".read-progress");
  if (progressBar) {
    var updateProgress = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? doc.scrollTop / max : 0;
      progressBar.style.setProperty("--read-p", (p < 0 ? 0 : p > 1 ? 1 : p).toFixed(4));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  function closeMobile() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    mobileNav.hidden = true;
  }
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMobile();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobile();
    });
  }

  /* ---------- Reveal-on-scroll ----------
     Reuses the companion rise+fade defined in styles.css (.reveal -> .in)
     and the staggered --reveal-i cascade inside .reveal-group. */
  Array.prototype.slice.call(document.querySelectorAll(".reveal-group")).forEach(function (group) {
    var items = Array.prototype.slice.call(group.querySelectorAll(":scope > .reveal"));
    items.forEach(function (el, i) { el.style.setProperty("--reveal-i", i); });
  });

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
