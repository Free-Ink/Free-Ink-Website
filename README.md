# Free Ink

Marketing site for **Free Ink**, an open-source collective building e-reader software,
firmware, and hardware: an open ecosystem anyone can build on.

Built with React 19, Vite, and Tailwind CSS v4. Light mode by default with a manual dark-mode
toggle, an e-ink "paper" palette, a Red Hat red accent, and dot-matrix schematic graphics throughout.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Structure

- `src/components/Brand.jsx` — logo mark + wordmark
- `src/components/Schematics.jsx` — dot-matrix blueprint graphics (hero device, PCB diagram, dot chart)
- `src/components/ui.jsx` — shared Button / Eyebrow / Section / TextLink primitives
- `src/index.css` — theme tokens (fonts, flame palette), dot-matrix utilities, class-based dark mode
- Sections: `Hero`, `TechStrip`, `Software`, `Hardware`, `Firmware`, `Manifesto`, `Stats`, `Community`, `Footer`

Copy and features are drawn from the CrossPoint Tools (software/firmware) and minRead / De-Link
(hardware) projects.
