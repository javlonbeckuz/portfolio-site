/* =========================================================
   Javlonbek Yokubov — Portfolio interactions
   All motion respects prefers-reduced-motion.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header: shadow/blur on scroll ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  onScrollHeader();

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

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          // stagger siblings gently
          var delay = Math.min(i * 70, 210);
          setTimeout(function () { el.classList.add("in"); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero role typing effect ---------- */
  var rolesEl = document.getElementById("heroRoles");
  if (rolesEl) {
    var textEl = rolesEl.querySelector(".hero-roles-text");
    var roles = (rolesEl.getAttribute("data-roles") || "").split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    if (textEl && roles.length) {
      // Keep the full list available to assistive tech; animate only the visual span.
      rolesEl.setAttribute("aria-label", roles.join(", "));
      textEl.setAttribute("aria-hidden", "true");

      if (reduceMotion) {
        // Static, readable fallback — no caret, no cycling.
        textEl.textContent = roles.join("  ·  ");
      } else {
        rolesEl.classList.add("is-typing");
        textEl.textContent = "";

        var rIndex = 0, cIndex = 0, deleting = false;
        var TYPE = 55, ERASE = 28, HOLD = 1500, GAP = 380;

        var typeTimer = function () {
          var word = roles[rIndex];
          if (!deleting) {
            cIndex++;
            textEl.textContent = word.slice(0, cIndex);
            if (cIndex === word.length) {
              deleting = true;
              setTimeout(typeTimer, HOLD);
              return;
            }
            setTimeout(typeTimer, TYPE);
          } else {
            cIndex--;
            textEl.textContent = word.slice(0, cIndex);
            if (cIndex === 0) {
              deleting = false;
              rIndex = (rIndex + 1) % roles.length;
              setTimeout(typeTimer, GAP);
              return;
            }
            setTimeout(typeTimer, ERASE);
          }
        };
        setTimeout(typeTimer, 700);
      }
    }
  }

  /* ---------- Active nav link (scroll spy) ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + id);
    });
  }
  if ("IntersectionObserver" in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Gentle parallax (transform only) ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;
  function applyParallax() {
    var y = window.scrollY;
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.05;
      el.style.transform = "translate3d(0," + (-y * speed).toFixed(2) + "px,0)";
    });
    ticking = false;
  }
  function onScroll() {
    onScrollHeader();
    if (!reduceMotion && parallaxEls.length && !ticking) {
      ticking = true;
      window.requestAnimationFrame(applyParallax);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
})();
