# Free Ink

The website for **Free Ink** — an open-source collective building the software, firmware, and
hardware for e-paper readers. An open ecosystem anyone can build on.

Light mode by default with a manual dark-mode toggle, an e-ink "paper" palette, a single Red Hat
red accent, and dot-matrix schematic graphics throughout.

Built with **React 19**, **Vite**, and **Tailwind CSS v4**.

## Getting started

Requires **Node.js 20+**.

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

The production build is a fully static site in `dist/` — it can be served from any static host or CDN.

## Project structure

```
index.html               entry HTML, font links, meta tags
src/
  main.jsx               React entry; applies the saved light/dark theme before paint
  App.jsx                page composition (section order)
  index.css              theme tokens (fonts, flame palette), dot-matrix utilities, dark mode
  components/
    Header.jsx           sticky nav, mobile menu, theme toggle, GitHub menu
    Hero.jsx             headline, CTAs, exploded e-reader blueprint
    TechStrip.jsx        scrolling marquee of supported tech
    Software.jsx         CrossPoint Reader feature grid
    Hardware.jsx         de-link board specs + PCB block diagram
    Manifesto.jsx        values band
    Stats.jsx            by-the-numbers + dot chart
    Community.jsx        contribute CTA
    Footer.jsx           link columns + legal
    Brand.jsx            logo mark + wordmark
    Schematics.jsx       dot-matrix blueprint graphics (hero device, PCB diagram, chart)
    icons.jsx            inline Heroicons + brand icons
    ui.jsx               shared Button / Eyebrow / Section / TextLink primitives
    GitHubMenu.jsx       repository dropdown
    repos.js             repository links (single source of truth)
    ThemeToggle.jsx      light/dark toggle, persisted to localStorage
public/
  favicon.svg
```

## Design notes

- **Fonts** — Red Hat Display (headlines), Inter (body, loaded from rsms.me for optical sizing and
  OpenType features), IBM Plex Mono (technical labels, schematics, code).
- **Color** — warm `stone` neutrals for the e-ink paper feel, with a single Red Hat red `flame`
  accent (custom palette defined in `src/index.css`).
- **Dark mode** — class-based (`.dark` on `<html>`); defaults to light and is persisted to
  `localStorage`.
- **Graphics** — dot-matrix textures and the engineering "blueprint" SVGs are drawn entirely in
  `Schematics.jsx`. There are no raster image assets.

## Content

Copy and product details are drawn from the sibling Free Ink projects:

- **Software / firmware** — CrossPoint Reader and CrossPoint Tools
- **Hardware** — de-link, the open-hardware e-paper board

Repository links live in `src/components/repos.js`.

## License

See [`LICENSE`](LICENSE).
