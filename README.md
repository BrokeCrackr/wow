# Armory — Character Atelier

An installable, responsive World of Warcraft inspired character customization app built with React, TypeScript, and Vite. Original SVG artwork and bundled fonts keep the application independent of external APIs and image services. Install it on a phone or desktop, then reopen it offline after an initial online visit.

## Download and try it

The prebuilt [Armory app ZIP](downloads/armory-app.zip) contains the complete static website, ready to upload to an HTTPS host. On GitHub, open the ZIP and select **Download raw file**. Extract it, then upload the folder containing `index.html` to [Netlify Drop](https://app.netlify.com/drop) or your chosen static host. The host supplies the app link you can open on your computer or phone.

Downloading GitHub's source ZIP gives you the development project; the ZIP under `downloads/` is the ready-built deployment bundle. The bundle is a snapshot of the tested release. After source changes, rebuild with `npm run build` and create a fresh ZIP of the contents of `dist/` before deploying it.

## Install the app

The **Get app** button in the header opens installation instructions. When the browser offers a native installer, it changes to **Install app**.

- **Android, Windows, Linux, or Chrome on macOS:** use Chrome or Edge and choose Install app from the browser menu or Armory's install guide.
- **iPhone/iPad:** open the hosted app in Safari, tap Share, choose Add to Home Screen, then Add.
- **Safari on macOS:** choose File → Add to Dock.

A secure HTTPS deployment is required for installation on other devices. A published Codex environment is a development workspace, not a public app deployment. See [APP.md](APP.md) for deployment and offline testing.

## Develop

Use the existing `/workspace/wow` checkout. Cloud tasks are already isolated; a separate Git worktree is unnecessary.

Requires Node.js 22.12+ (Node.js 24 is verified) and npm.

```sh
cd /workspace/wow
npm ci --no-audit --no-fund
npm run dev -- --port 5173 --strictPort
```

The Vite server listens on port 5173. No database, credentials, environment variables, or Blizzard account are required.

## Validate and build

```sh
npm test
npm run build
```

The build includes TypeScript checking and produces `dist/`, a web manifest, and a precaching service worker. For a local production smoke test, run `npm run preview -- --port 4173 --strictPort` and request its root page. Scripts run from the repository root. Offline caching is enabled in production builds; development uses uncached live updates.

## Explore the dashboard

- **Identity:** name your character; choose from six races and six classes.
- **Appearance:** change armor, hair, skin, hairstyle, and magical glow.
- **Equipment:** equip or remove items in four slots; the artwork, item level, and illustrative stats update together.
- **Live preview:** turn and zoom your original illustrated character.
- **Presets:** save multiple builds, search your collection, load or delete them, and try three curated starter looks.
- **Export:** download the current character as JSON. Export is a portable backup; a JSON import feature is not included.

The current character and saved presets persist in this browser's local storage. They are not synchronized across devices or origins and can be removed by clearing browser data. Export important characters to keep a separate copy.

This fan-made creative sandbox allows all race/class combinations. Artwork, curated equipment, level 80, and stats are illustrative rather than a live-game character renderer, rules validator, or combat simulator. It does not connect to Blizzard or alter characters in-game. World of Warcraft belongs to Blizzard Entertainment.

## Project structure

- `src/App.tsx`: customization controls, collection, local persistence, and export.
- `src/data.ts`: character types, races, classes, equipment, palettes, and starter presets.
- `src/components/CharacterPortrait.tsx`: original parametric character artwork.
- `src/components/InstallApp.tsx`: native installation prompt and platform-specific instructions.
- `src/components/AppStatus.tsx`: offline status, cache readiness, and user-controlled app updates.
- `src/styles.css`: responsive interface and accessibility preferences.
- `src/App.test.tsx` and component tests: customization, equipment, presets, persistence, installation, and update interactions.

Only package downloads need network access (`registry.npmjs.org` under the existing package-manager policy). All application fonts, icons, artwork, and data are served locally.
