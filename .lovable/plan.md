## Problem

The Android launcher icon currently shipped at every density is the **default Capacitor "C" placeholder**, not the Commodity Hub brand logo. Confirmed by inspecting the mipmap PNGs: `ic_launcher_foreground.png` (432×432) and `ic_launcher.png` (192×192 / 48×48 / etc.) do not match `public/icon.png` (the canonical 512×512 brand asset, identical to `public/icons/icon-512-playstore.png`).

Result: even after the package-ID fix, the device home-screen icon still shows the generic Capacitor logo instead of Commodity Hub.

## Goal

Regenerate every Android launcher density from the single canonical source (`public/icon.png`) so:
- The home-screen icon on every Android device shows the Commodity Hub logo.
- The adaptive icon (Android 8+) uses the same logo on the existing dark-blue background `#1e3a5f`.
- The Play Store 512×512 icon stays consistent with what users see on-device.

## Canonical source

`public/icon.png` — 512×512 RGBA, the Commodity Hub brand mark.
This becomes the single source of truth; all other icon files are derived from it.

## What will change

### 1. Regenerate Android mipmap PNGs (all densities)

Replace the placeholder PNGs in:

```text
android/app/src/main/res/
  mipmap-mdpi/      ic_launcher.png (48)    ic_launcher_round.png (48)    ic_launcher_foreground.png (108)
  mipmap-hdpi/      ic_launcher.png (72)    ic_launcher_round.png (72)    ic_launcher_foreground.png (162)
  mipmap-xhdpi/     ic_launcher.png (96)    ic_launcher_round.png (96)    ic_launcher_foreground.png (216)
  mipmap-xxhdpi/    ic_launcher.png (144)   ic_launcher_round.png (144)   ic_launcher_foreground.png (324)
  mipmap-xxxhdpi/   ic_launcher.png (192)   ic_launcher_round.png (192)   ic_launcher_foreground.png (432)
```

Generation rules (run as a Python/Pillow script during the build mode):
- `ic_launcher.png` (square legacy): downscale `public/icon.png` to the density size with high-quality Lanczos resampling, on the brand background `#1e3a5f`.
- `ic_launcher_round.png`: same as above but with a circular alpha mask.
- `ic_launcher_foreground.png` (adaptive): place the logo centered within the inner 66% safe-zone of a transparent canvas at the foreground size, leaving the surrounding bleed area transparent (Android composes it with the `ic_launcher_background` color via `mipmap-anydpi-v26/ic_launcher.xml`).

### 2. Keep the adaptive-icon XML and background color

No changes needed — they already reference the correct drawables:
- `mipmap-anydpi-v26/ic_launcher.xml` and `ic_launcher_round.xml` → `@mipmap/ic_launcher_foreground` over `@color/ic_launcher_background`
- `values/ic_launcher_background.xml` → `#1e3a5f` (matches brand)

### 3. Confirm Play Store icon parity

`public/icons/icon-512-playstore.png` is already byte-identical to `public/icon.png`. No change needed; just document it.

### 4. Add a launcher-icon regeneration script

Create `scripts/generate-android-icons.mjs` (or `.py`) that takes `public/icon.png` as input and rewrites every mipmap file deterministically. This becomes the "pipeline" so future logo updates are a single command:

```bash
node scripts/generate-android-icons.mjs
npx cap sync android
```

The script will be documented in `PRODUCTION_SETUP.md` under a new "Updating the launcher icon" section.

### 5. QA

After regeneration the script will dump a small contact-sheet PNG to `/tmp` showing every generated density side-by-side, and I'll visually inspect it to confirm the logo (not the Capacitor "C") appears correctly framed at every size before delivering.

## Files that will be created / edited

- **Replaced (10 PNGs)**: every `ic_launcher.png`, `ic_launcher_round.png`, `ic_launcher_foreground.png` under `android/app/src/main/res/mipmap-*`.
- **Created**: `scripts/generate-android-icons.mjs`.
- **Edited**: `PRODUCTION_SETUP.md` — add "Updating the launcher icon" section.

## What you'll need to do after approval

On your local machine:

```bash
git pull
npx cap sync android
```

Then in Android Studio: **Build → Clean Project → Rebuild → Run**.
Uninstall the previous APK first so Android picks up the new icon (Android caches launcher icons aggressively).
