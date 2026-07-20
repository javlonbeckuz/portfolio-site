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

  // Cascade: give each .reveal directly inside a .reveal-group an incremental
  // index so its transition-delay staggers (see --reveal-i in styles.css),
  // making cards/items animate in one-by-one instead of all at once.
  Array.prototype.slice.call(document.querySelectorAll(".reveal-group")).forEach(function (group) {
    var items = Array.prototype.slice.call(group.querySelectorAll(":scope > .reveal"));
    items.forEach(function (el, i) { el.style.setProperty("--reveal-i", i); });
  });

  /* ---------- Text-assemble headings (blur-in per letter / word) ----------
     Split heading text into per-character (short) or per-word (long) spans so
     each unit can materialize from blurred -> sharp. Accessibility is preserved:
     we wrap existing text nodes (never remove them), so the real words stay in
     the DOM for screen readers and SEO. Char-split headings (single words split
     into letters) get their letters aria-hidden + an aria-label with the full
     text, so AT reads the word, not the letters; word-split units are whole
     words and remain read normally. Gradient-clipped words (hero-name accent,
     contact emphasis) animate as one piece to keep their gradient intact. */
  (function () {
    function makeUnit(text) {
      var s = document.createElement("span");
      s.className = "assemble-unit";
      s.textContent = text;
      return s;
    }

    // Replace one text node with an inline .assemble-line wrapper containing
    // per-char / per-word units (and plain whitespace text nodes for spacing).
    function splitTextNode(parent, node, mode, units) {
      var text = node.nodeValue;
      if (!text || !text.trim()) return; // leave pure-whitespace nodes as-is
      var line = document.createElement("span");
      line.className = "assemble-line";
      if (mode === "char") {
        for (var i = 0; i < text.length; i++) {
          var ch = text.charAt(i);
          var code = text.charCodeAt(i);
          if (code === 32 || code === 160 || /\s/.test(ch)) { // space / nbsp / any ws
            line.appendChild(document.createTextNode(ch));
          } else {
            var u = makeUnit(ch);
            units.push(u);
            line.appendChild(u);
          }
        }
      } else {
        var parts = text.split(/(\s+)/);
        for (var j = 0; j < parts.length; j++) {
          var p = parts[j];
          if (p === "") continue;
          if (/^\s+$/.test(p)) {
            line.appendChild(document.createTextNode(p));
          } else {
            var w = makeUnit(p);
            units.push(w);
            line.appendChild(w);
          }
        }
      }
      parent.replaceChild(line, node);
    }

    function walk(node, mode, units) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          splitTextNode(node, child, mode, units);
        } else if (child.nodeType === 1) {
          if (child.tagName === "BR") return;
          var cl = child.classList;
          if (cl && cl.contains("eyebrow-rule")) return; // decorative hairline
          if (cl && (cl.contains("hero-name-accent") || cl.contains("contact-title-em"))) {
            cl.add("assemble-unit");            // blur the gradient word as one unit
            units.push(child);
            return;
          }
          walk(child, mode, units);             // recurse into other inline spans
        }
      });
    }

    function assemble(el) {
      var label = (el.textContent || "").replace(/\s+/g, " ").trim();
      var mode;
      if (el.classList.contains("eyebrow")) mode = "word";
      else if (el.classList.contains("hero-name")) mode = "char";
      else mode = (label.split(" ").length > 1) ? "word" : "char";

      var units = [];
      walk(el, mode, units);
      units.forEach(function (u, i) { u.style.setProperty("--u", i); });

      // A11y: char-mode splits a word into single letters, which a screen
      // reader would spell out — so hide the letters and expose the full text
      // via aria-label (reliable on headings). Word-mode units are whole words
      // and stay readable as-is (no aria-label needed), which also keeps the
      // generic <p> eyebrow labels accessible.
      if (mode === "char") {
        units.forEach(function (u) { u.setAttribute("aria-hidden", "true"); });
        if (label && !el.hasAttribute("aria-label")) el.setAttribute("aria-label", label);
      }
    }

    Array.prototype.slice
      .call(document.querySelectorAll(".hero-name, .section-title, .eyebrow"))
      .forEach(assemble);
  })();

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");   // CSS handles the staggered delay
          io.unobserve(entry.target);
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
