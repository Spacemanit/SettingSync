# SettingSync

A small TypeScript app for keeping your preferences the same across browser tabs. It has a dark-mode switch, a font selector, four display languages (English, Spanish, Hindi, and Japanese), and a text-size slider.

## Run it locally

You'll need Node.js 22.12 or newer and npm.

```sh
npm install
npm run dev
```

Open the local address printed in the terminal. Click **Open another tab**, then change a setting in either tab. Both should update without a refresh. Use the same address in both tabs; `localhost` and `127.0.0.1` count as different sites.

Your choices stay saved in that browser after you close the tabs. A new tab starts with the saved theme, font, and text size. The language selector translates the interface.

## Other commands

```sh
npm run build     # Check TypeScript and build into dist/
npm run preview   # Serve the finished build locally
```

## A couple of things to know

Settings stay on this browser profile. They aren't shared across devices or private browsing sessions, and clearing site data removes them. If the browser blocks storage, the app shows a message instead of claiming your changes are saved.

The project uses Vite, TypeScript, and Tailwind CSS. There is no backend, account setup, or environment file to configure.
