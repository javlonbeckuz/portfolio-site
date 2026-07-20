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

  /* ---------- Terminal-decode headings ----------
     Split display headings (.hero-name, .section-title) into per-glyph units.
     When the heading is revealed, each glyph ciphers through random monospace
     characters and resolves to its real letter, settling left-to-right like a
     console decrypting the line — the site's signature motion.

     Accessibility is preserved: we wrap existing text nodes (never remove them),
     so the real characters stay in the DOM for SEO. The glyph units are marked
     aria-hidden and the heading gets an aria-label with the full text, so
     assistive tech reads the whole line — never the scrambled letters. Gradient
     words (hero-name accent, contact emphasis) are left intact and are NOT
     scrambled, so their continuous gradient survives (they fade in via CSS). */
  var decodeEls = [];

  function runDecode(el) {}      // assigned below (hoist-safe references)
  function finishDecode(el) {}

  (function () {
    var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}#*+=~".split("");
    function rndGlyph() { return GLYPHS[(Math.random() * GLYPHS.length) | 0]; }

    function makeUnit(ch) {
      var s = document.createElement("span");
      s.className = "decode-unit is-pending";
      s.textContent = ch;
      s._final = ch;
      s.setAttribute("aria-hidden", "true");
      return s;
    }

    // Replace one text node with an inline .decode-line wrapper of per-char
    // units; whitespace stays as plain text nodes (never scrambled).
    function splitTextNode(parent, node, units) {
      var text = node.nodeValue;
      if (!text || !text.trim()) return; // leave pure-whitespace nodes as-is
      var line = document.createElement("span");
      line.className = "decode-line";
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        if (/\s/.test(ch)) {
          line.appendChild(document.createTextNode(ch));
        } else {
          var u = makeUnit(ch);
          units.push(u);
          line.appendChild(u);
        }
      }
      parent.replaceChild(line, node);
    }

    function walk(node, units) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          splitTextNode(node, child, units);
        } else if (child.nodeType === 1) {
          if (child.tagName === "BR") return;
          var cl = child.classList;
          // gradient words fade in whole — never scrambled (keeps gradient continuous)
          if (cl && (cl.contains("hero-name-accent") || cl.contains("contact-title-em"))) return;
          walk(child, units);                   // recurse into other inline spans
        }
      });
    }

    function prep(el) {
      var label = (el.textContent || "").replace(/\s+/g, " ").trim();
      var units = [];
      walk(el, units);
      if (!units.length) return;
      // A11y: expose the whole heading via aria-label; glyphs are aria-hidden.
      if (label && !el.hasAttribute("aria-label")) el.setAttribute("aria-label", label);
      el._decodeUnits = units;
      decodeEls.push(el);
    }

    Array.prototype.slice
      .call(document.querySelectorAll(".hero-name, .section-title"))
      .forEach(prep);

    // Lock each glyph's final width once, so cipher glyphs of differing widths
    // never reflow the surrounding line while scrambling. Widths are font-
    // dependent, so (re)lock after web fonts load where supported.
    function lockWidths() {
      decodeEls.forEach(function (el) {
        el._decodeUnits.forEach(function (u) {
          if (u._done) return;                  // don't disturb resolved lines
          var w = u.getBoundingClientRect().width;
          if (w) u.style.width = w.toFixed(2) + "px";
        });
      });
    }
    lockWidths();                               // immediate (above-fold hero)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(lockWidths).catch(function () {});
    }

    // Instant, motion-free resolve (reduced-motion / no-IO fallback).
    finishDecode = function (el) {
      if (el._decodeDone) return;
      el._decodeDone = true;
      el._decodeStarted = true;
      el._decodeUnits.forEach(function (u) {
        u._done = true;
        u.textContent = u._final;
        u.style.width = "";
        u.classList.remove("is-pending", "is-scrambling", "is-done");
      });
    };

    // Animated decode: one rAF loop per heading, glyphs resolve left-to-right,
    // the loop stops the moment every glyph is done (no lingering timers).
    runDecode = function (el) {
      if (el._decodeStarted) return;
      el._decodeStarted = true;
      var units = el._decodeUnits;
      var n = units.length;
      var perChar = Math.max(22, Math.min(60, 900 / n)); // fit line into ~0.5–1.1s
      var SCRAMBLE = 260;                                 // cipher window per glyph
      var start = performance.now();
      var lastSwap = 0;

      function tick(now) {
        var t = now - start;
        var swap = (now - lastSwap) > 45;                // throttle glyph churn
        if (swap) lastSwap = now;
        var remaining = 0;

        for (var i = 0; i < n; i++) {
          var u = units[i];
          if (u._done) continue;
          var revealAt = i * perChar;
          var resolveAt = revealAt + SCRAMBLE;
          if (t >= resolveAt) {
            u._done = true;
            u.style.width = "";
            u.textContent = u._final;
            u.classList.remove("is-pending", "is-scrambling");
            u.classList.add("is-done");
          } else {
            remaining++;
            if (t >= revealAt) {
              if (u.classList.contains("is-pending")) {
                u.classList.remove("is-pending");
                u.classList.add("is-scrambling");
              }
              if (swap) u.textContent = rndGlyph();
            }
          }
        }

        if (remaining > 0) requestAnimationFrame(tick);
        else el._decodeDone = true;              // fully resolved — loop ends
      }
      requestAnimationFrame(tick);
    };
  })();

  // Reveal a container and kick off the decode of any display heading inside it.
  function activate(container) {
    container.classList.add("in");             // CSS handles the staggered delay
    Array.prototype.slice
      .call(container.querySelectorAll(".hero-name, .section-title"))
      .forEach(function (h) { if (h._decodeUnits) runDecode(h); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
    decodeEls.forEach(finishDecode);           // resolve headings instantly, no motion
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activate(entry.target);
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
