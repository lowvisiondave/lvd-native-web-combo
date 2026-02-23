# Native + Web Bridge Template

A Turborepo monorepo demonstrating how to share a **Next.js** web app inside a **React Native (Expo)** shell using a typed WebView bridge. The same pages render standalone on the web and embedded inside a native app with native chrome, gestures, and modals.

## Quick Start

```bash
pnpm install
pnpm dev
```

- **Web** — [http://localhost:3000](http://localhost:3000)
- **Native** — Expo dev server (press `i` for iOS simulator, `a` for Android emulator)

To point the native app at a specific web server (e.g. on a physical device):

```bash
EXPO_PUBLIC_WEB_URL=http://192.168.x.x:3000 pnpm dev:native
```

## What It Does

The native app wraps the Next.js web content in a WebView with a native header and tab bar. The web app also runs standalone with its own navigation. Both share the same page components.

**Features demonstrated:**

- **Shared counter** — tap +/− on the web page, watch the badge update in the native header bar (bidirectional state sync)
- **Native detail drawer** — tap an explore card on the web page, native shell opens a bottom sheet with native image loading
- **Native photo picker** — tap "Change photo" on the account page, native shell presents a camera/library action sheet via `expo-image-picker`
- **Full native screen** — the Notifications tab replaces the WebView entirely with a React Native screen featuring swipe-to-archive/delete gestures, layout animations, and a native detail modal

## Architecture

```
Native App (Expo)              Web App (Next.js)
┌─────────────────┐            ┌─────────────────┐
│  Native Header  │            │  Web Nav (black) │  ← hidden in native
│  [counter badge]│            ├─────────────────┤
├─────────────────┤            │                 │
│  WebView ────────── bridge ────── Page Content │
├─────────────────┤            │                 │
│  Native Tab Bar │            ├─────────────────┤
└─────────────────┘            │  Web Footer     │  ← hidden in native
                               └─────────────────┘
```

Routing is handled by Next.js middleware rewrites: requests with `x-native-app: 1` resolve to `/native/…`, all others to `/web/…`. Both share the same `[device]` layout that picks the right shell.

## Project Structure

```
apps/
  web/           Next.js 16 (App Router, Tailwind v4)
  native/        Expo (React Native, WebView)

packages/
  app-config/    Routes, nav items, design tokens
  bridge/        Typed messaging layer (native ↔ web)
```

## Bridge Messages

| Message              | Direction      | Purpose                                  |
| -------------------- | -------------- | ---------------------------------------- |
| `NATIVE_CONTEXT`     | Native → Web   | Tell the WebView it's running inside native |
| `NATIVE_NAV_ACTION`  | Native → Web   | Navigate when a native tab is pressed    |
| `COUNTER_SYNC`       | Native → Web   | Sync counter value back to the web page  |
| `PHOTO_PICKER_RESULT`| Native → Web   | Return a photo URI from the native picker |
| `WEB_NAV_STATE`      | Web → Native   | Report current path/title to native      |
| `COUNTER_ACTION`     | Web → Native   | Request counter increment/decrement      |
| `DETAIL_REQUEST`     | Web → Native   | Ask native to open the detail drawer     |
| `PHOTO_PICKER_REQUEST`| Web → Native  | Ask native to open the photo picker      |

All messages are fully typed in `packages/bridge/messages.ts` with runtime validation.

## Customization

**Routes & navigation** — `packages/app-config/app-routes.ts`

**Brand color** — `packages/app-config/tokens.ts` (native) and `apps/web/app/globals.css` (web CSS variable `--color-brand`)

## Tech Stack

- [Turborepo](https://turbo.build) — monorepo orchestration
- [Next.js 16](https://nextjs.org) — web app with App Router
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [Expo](https://expo.dev) — React Native toolchain
- [react-native-webview](https://github.com/nicepayments/nicepay-webview) — WebView bridge
- [pnpm](https://pnpm.io) — package management

## License

MIT
