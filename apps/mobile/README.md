# `@scoreboard/mobile`

Expo SDK 54 · Expo Router · **NativeWind v4** (Tailwind CSS 3).

From the monorepo root:

```bash
pnpm install
pnpm --filter @scoreboard/mobile dev
# ou: cd apps/mobile && pnpm ios | android | web
```

## NativeWind

Styling follows the [NativeWind installation guide for Expo](https://www.nativewind.dev/docs/getting-started/installation):

- `tailwind.config.js` — `content` globs + `presets: [require('nativewind/preset')]`
- `global.css` — `@tailwind base/components/utilities`
- `babel.config.js` — `babel-preset-expo` with `jsxImportSource: "nativewind"` + `nativewind/babel`
- `metro.config.js` — `withNativeWind(config, { input: './global.css' })`
- `app/_layout.tsx` — `import '../global.css'`
- `nativewind-env.d.ts` — `/// <reference types="nativewind/types" />`
- `app.json` — `expo.web.bundler`: `"metro"`

**pnpm:** `react-native-css-interop` is listed as a direct dependency so Metro resolves `react-native-css-interop/jsx-runtime` (hoisted monorepo layout).

Use `className` on React Native primitives, e.g. `<View className="flex-1 items-center">`.

## EAS

Project id is set under `expo.extra.eas` in `app.json`. Build with [EAS Build](https://docs.expo.dev/build/introduction/) from `apps/mobile`.
