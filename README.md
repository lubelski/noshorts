# NoShorts

<img src="assets/mascot.png" width="192" alt="A relaxed capybara in three-quarter view wearing a teal Hawaiian shirt and no shorts">

**Less scrolling. More subscriptions.**

A tiny Manifest V3 Chrome extension for desktop YouTube:
- Home (including the YouTube logo) redirects to Subscriptions; Home sidebar entries are hidden.
- The English “Most relevant” shelf on Subscriptions is hidden, leaving the chronological feed.
- Shorts shelves, cards, sidebar entries, and linked channel tabs are hidden.
- Direct Shorts video links open in the standard player; timestamps are preserved.
- No settings, analytics, storage, backend, remote code, or background worker.

## Install locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository's **extension** directory.
4. Reload existing YouTube tabs. Disable overlapping YouTube-customization extensions while testing.

Keep that folder in place. After changing files, click **Reload** on NoShorts in
Chrome's extension manager, then reload YouTube. Disable or remove it there to undo.

Desktop `youtube.com` and `www.youtube.com` only; Chrome 105+.
Subscriptions requires signing into YouTube. Signed-out users see YouTube's
normal sign-in prompt. This extension does not bypass login.

## Development

Node 20+ and Python 3 are needed only for development, not installation.

```sh
npm ci
npx playwright install chromium
npm test
npm run package
```

The zip is written to `dist/NoShorts-0.1.0.zip`, with manifest.json at its root.
Tests load the actual unpacked extension into Chromium and use intercepted
YouTube HTML fixtures. They cover redirects, SPA navigation, browser Back,
dynamic/recycled tiles, and keeping regular videos and unrelated sites intact.

The original mascot is editable in `assets/mascot.svg`. To regenerate PNGs:
```sh
node scripts/render-logo.js
uv run --no-project scripts/icons.py
```

## Scope and maintenance

YouTube regularly changes its HTML and experiments with different layouts.
Shorts selectors are structural, not English-text based, and CSS handles lazy-loaded
Shorts. A batched DOM observer identifies the English “Most relevant” shelf by its
heading, only on Subscriptions. Other interface languages are not yet supported
for that shelf. New layouts can need new selectors.
A Short presented solely as a regular watch link without Shorts markup may not
be detected. Mobile YouTube, embedded players, and the mobile app are not supported.

Live signed-out checks complement the fixture tests. Signed-in Subscriptions,
History, channel layouts, and account-specific experiments still need manual
testing in your own Chrome profile before store submission.

## Chrome Web Store

See [store/listing.md](store/listing.md) for draft copy and the release checklist.
Nothing has been submitted or published. Store approval is not guaranteed.
See [PRIVACY.md](PRIVACY.md) for the privacy statement.
