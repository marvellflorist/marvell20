# MARVELL 20

MARVELL 20 is a portrait booth web app. The app shell is static HTML, CSS, JavaScript, fonts, icons, and small static assets; the included local PowerShell server also provides the QR export handoff for guest phones.

Captured photos are processed in the browser with the camera and canvas. When `Export` is used from the local booth server, the finished PNG is saved to the local `exports/` folder so phones on the same network can open a download page from the QR code.

## Build

Install dependencies:

```powershell
npm install
```

Run locally:

```powershell
npm run dev
```

If Node/npm is not installed on the booth laptop, use the included static server instead:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 5503
```

To send print jobs directly to a specific Windows printer, pass its printer name:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 5503 -PrinterName "Your Printer Name"
```

If `-PrinterName` is omitted, direct printing uses the Windows default printer.

Then open:

```text
http://localhost:5503/
```

For phone QR downloads, keep this server running. The app posts the final portrait to `/api/portraits`, and the QR points phones to a short `/d/<token>` download page on the booth computer's LAN address.

If a booth iPad still shows the old `M20` session-code QR, open `/reset.html` once on that same booth URL. For example:

```text
http://192.168.110.157:5503/reset.html
```

That page clears the old service worker/cache and reloads the fresh QR export app.

Build the static GitHub Pages output:

```powershell
npm run build
```

The production files are written to `dist/`.

## GitHub Pages Deployment

This project is configured for GitHub Pages with Vite:

```js
base: "/marvell20/"
```

The included GitHub Actions workflow deploys automatically from the `main` branch:

```text
.github/workflows/deploy.yml
```

Repository setup:

1. Push the project to the GitHub repository for MARVELL 20.
   - Provided setup: `https://github.com/marvell20.git`
   - If GitHub rejects that URL, use the normal owner/repo format: `https://github.com/YOUR_USERNAME/marvell20.git`
2. In GitHub, open Settings > Pages.
3. Set Source to GitHub Actions.
4. Push to `main` or run the workflow manually from Actions.
5. Open the deployed HTTPS URL, usually:

```text
https://YOUR_USERNAME.github.io/marvell20/
```

GitHub Pages can host the app shell, but it cannot receive private canvas images from the booth device. Use the included local server, a trusted public upload endpoint, or another transfer service for scan-to-download QR delivery.

## Install On iPad Home Screen

1. Open the GitHub Pages HTTPS URL in Safari on the iPad.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch MARVELL 20 from the Home Screen icon.
5. Tap Begin before granting camera permission.

The app is configured for standalone display, portrait orientation, iOS PWA meta tags, an installable manifest, and an offline app-shell cache.

## Local Photo Processing

Photos stay in the booth environment:

- Camera access starts only after the user taps `Begin`.
- The app reads the iPad camera through `navigator.mediaDevices.getUserMedia`.
- Captures are drawn to local browser `canvas` elements.
- Tone, paper, preview, print, archive, and export preparation are all generated client-side.
- Completed sessions are saved locally in IndexedDB for operator fallback.
- Completed final portraits are also sent to the local `server.ps1` archive endpoint when the booth server is available.
- Print files are produced from local canvas data.
- QR export sends the final PNG to the local `server.ps1` process only.
- The local server writes guest-download portraits to `exports/`, which is ignored by git.

To confirm this in code:

- Search [app.js](app.js) for `fetch`, `XMLHttpRequest`, `sendBeacon`, or upload APIs. None are used for captured photos.
- Search [app.js](app.js) for `getUserMedia` to see the camera request starts from the local app flow.
- Search [service-worker.js](service-worker.js) to confirm it caches only static app-shell files.

## Operator Workflow

Final event flow:

```text
Home -> Camera -> Review -> Tone -> Paper -> Final Preview -> QR Export / Print -> Done -> Home
```

The home screen also includes `Archive`, which shows completed portraits saved by the local website server in `website-archive/`. If the server archive is unavailable, the view falls back to the browser's IndexedDB archive. These portraits are not downloaded to the device unless an operator explicitly uses another export/print flow.

When the final portrait is prepared, the app stores a completed session locally with:

- session ID
- timestamp
- final image
- selected filter
- selected paper
- export status
- print status

The primary Archive page reads from `website-archive/` on the booth server. The browser's IndexedDB archive is still kept as a fallback for local counting and operator review.

## QR Export Delivery

The QR screen is generated after the final portrait is ready:

1. The app renders the finished portrait as a PNG.
2. The app posts it to the local booth server at `/api/portraits`.
3. The server saves the PNG in `exports/` and returns a short URL like `http://192.168.1.20:5503/d/AB12CD34`.
4. The QR code opens that page on a phone, showing the portrait and a `Download portrait` button.

The phone must be able to reach the booth computer on the same Wi-Fi or network. A static GitHub Pages-only session cannot make an iPad-only canvas image downloadable by another phone without a transfer layer.

## Printing

The `Print` action prepares a print-ready 4x6 portrait file at `2400 x 3600` px using the same selected tone and paper. When the app is running from `server.ps1`, it posts the PNG to `/api/print`, and the local Windows server sends it directly to the configured/default printer.

This avoids the browser print page. Browsers and iPad PWAs cannot silently print by themselves; the local Windows server is the bridge to the printer driver.

The server keeps a local copy of each direct print in `prints/`, which is ignored by git.

## Static Assets

The app shell contains:

- `index.html`
- `styles.css`
- `app.js`
- `manifest.json`
- `service-worker.js`
- `icons/`
- `background.webp`
- `pattern.webp`
- `pattern2.webp`
- `envelope.webp`
- `qris-code.webp`
- local font files

The service worker caches the app shell for offline launch after the first successful HTTPS load.

## Invitation Video Optimization

The `invitation.html` page uses `lily.mp4` as a muted, autoplaying, looping background video. For smoother playback and faster loading, keep the file web-ready with H.264, `faststart`, and a broadly compatible pixel format:

```powershell
ffmpeg -i input.mp4 -vcodec libx264 -crf 24 -preset medium -movflags +faststart -pix_fmt yuv420p output.mp4
```

You can also create a WebM version for browsers that prefer VP9:

```powershell
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -c:a libopus output.webm
```

After creating optimized files, replace `lily.mp4` with the optimized MP4. If you add a WebM file, add it as a `<source>` before the MP4 source in `invitation.html`.
