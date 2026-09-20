# ArcadeAgent

Local-first AI coding assistant. Describe an app or game in natural language; the agent writes HTML, CSS, and JavaScript and runs it in a live preview.

Bring your own Gemini API key. Nothing is sent to a backend of ours.

## Features

- Chat brief → agent loop with `create_file`, `read_file`, `list_files`, `edit_file` (max 15 steps)
- Monaco editor with file tabs
- Live iframe preview
- Persian (default, RTL) and English
- Light / Dark / System themes
- Multiple Gemini keys with rotation on 429/403
- Windows (Electron) and Android (Capacitor) wrappers

## Web

```bash
npm install
npm run dev
```

Open the app, add a Gemini key in the key dialog, then write a brief and press **Build**.

Without a key you can still **Load sample** to try the editor and preview.

## Desktop (Windows EXE)

```bash
npm install
npm run build
npx esbuild electron/main.ts electron/preload.ts --outdir=electron --platform=node --format=cjs --external:electron
npx electron-builder --win nsis
```

The installer is written to `release/`.

## Android (APK)

```bash
npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/filesystem
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Environment

- No paid API is bundled. You supply a Gemini key.
- No server is required for the agent; calls go from the client to Google.

## License

Private project.
