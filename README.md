# Javlonbek Yokubov — Portfolio

A self-contained, static personal portfolio. Concept: **"Renaissance mind, modern machine"** — a Florentine-editorial site for an AI engineer. No build step, no dependencies.

## How to open

Just **double-click `index.html`** — it opens in any modern browser.

Optionally, to view it over a local server (recommended so the CV download and fonts behave exactly like production):

```bash
# from this folder
python -m http.server 8000
# then open http://localhost:8000
```

Fonts load from Google Fonts with a system-serif / system-sans fallback, so it still looks correct offline.

## Files

| File | Purpose |
|---|---|
| `index.html` | All content and structure |
| `styles.css` | Full Florentine-editorial design system |
| `script.js` | Reveal-on-scroll, nav, scroll-spy, parallax (all respect reduced-motion) |
| `assets/Javlonbek-Yokubov-CV.pdf` | CV, linked from every "Download CV" button |
| `.design/taste-profile.md` | Locked creative direction |
| `.design/tokens.md` | Color / type / spacing tokens |

---

## ⚠️ 3 placeholders you must swap

Search the codebase for the comment marker `SWAP:` — each is flagged inline. Details:

### 1. Hero photo
- **File:** `index.html`
- **Find:** the comment `<!-- SWAP: user photo -->` (in the `<figure class="hero-portrait">` block, `id="heroPhoto"`).
- **Do:** replace the `src="data:image/svg+xml,..."` value with the path to your photo, e.g. `src="assets/portrait.jpg"`. Keep the `alt` text.
- The frame is a classical arch; a **portrait-orientation** image (roughly 52:68 / 3:4) fills it best.

### 2. GitHub profile URL
- **File:** `index.html`, Contact section.
- **Find:** the comment `<!-- SWAP: link -->` above `<a ... data-link="github" ...>`.
- **Do:** set `href="#"` to your GitHub profile URL (e.g. `https://github.com/yourname`). You can also update the visible text `Add profile` to your handle.

### 3. Per-project links (4 of them)
- **File:** `index.html`, Projects section.
- **Find:** four comments `<!-- SWAP: link -->`, each above an `<a ... data-link="repo" ...>` inside a project card.
- **Do:** set each `href="#"` to that project's repo or live URL.

> Tip: opening the file and doing Find (Ctrl+F) for `SWAP:` walks you through all six spots (photo + GitHub + four projects) in order.

---

## Notes
- Email shown on site is `javlonbekyoqubov721@gmail.com` (the 721 address), phone `+998 90 343 7463`, LinkedIn is live.
- Fully responsive (mobile-first), keyboard-navigable, semantic HTML, and honours `prefers-reduced-motion`.
