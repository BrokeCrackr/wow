# Install and deploy Armory

Armory is a Progressive Web App (PWA). It can have a home-screen icon and its own window without an app-store account or native mobile build. A hosting destination is still needed for a shareable HTTPS installation link.

## Create the release

From `/workspace/wow`:

```sh
npm ci --no-audit --no-fund
npm test
npm run build
```

Publish the **contents of `dist/` at the root of an HTTPS website** on a static host. There is no backend, database, or server-side secret. Hosts such as Netlify, Vercel, or a conventional HTTPS static web server can serve the build. The current asset paths, app scope, and start URL assume a site root, not a subdirectory.

The release must include `index.html`, `manifest.webmanifest`, `sw.js`, the `workbox-*.js` runtime, all files in `assets/`, and the icon files. Serve `.webmanifest` as `application/manifest+json` or `application/json`; serve `sw.js` as JavaScript. Avoid long-lived HTTP caching for `index.html`, `manifest.webmanifest`, and `sw.js` so app updates can be detected. Hashed assets can be cached long-term.

No deployment has been created automatically. Environment publication and website deployment are separate operations.

## Test production and offline behavior

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

On the machine running the preview, open the address Vite prints. Localhost is a browser-supported secure context for development; installing from a different phone or computer requires a hosted HTTPS address. The Codex onboarding chat does not expose an interactive browser preview to users.

1. Open the production app online. Wait for the **Armory is available offline** notice. Browser developer tools should show an active service worker and precached app files.
2. Choose a name and race. Confirm the HD portrait changes. Switch to Live Customisation to preview exact class, appearance, and equipment choices, then save a named preset.
3. Turn the browser's network offline and reload. The app should open with the current character restored; the saved preset should remain in My collection.
4. Continue editing and saving while offline. Restore the connection when finished.
5. Open **Get app** to view platform instructions, or **Install app** if your browser offers the native prompt. The browser decides when to make installation available. Automated tests verify the prompt behavior; an OS-level installation is a manual check on the target device.

The service worker is intentionally disabled under `npm run dev` so cached releases cannot interfere with source edits. Use the production preview or hosted release to test offline support.

## App updates and saved characters

The service worker precaches the app shell, code, fonts, icons, and artwork, including all six HD portraits. The first online visit downloads approximately 15 MB so every race remains available offline. Character data stays in localStorage. When a new version is detected, Armory offers **Update app**; it does not interrupt an active session with an automatic reload. Your current character is saved as you edit.

Presets belong to their browser and origin. Installing on a different device, using a different browser, moving to another domain, or clearing site storage can change which saved data is available. Export characters before moving or clearing data. Export produces JSON; importing it is not implemented.

Offline reopening requires a completed first online load and browser storage that has not been cleared or evicted. Browser and operating-system support for installation varies; the dashboard remains usable as a website where installation is unavailable.
