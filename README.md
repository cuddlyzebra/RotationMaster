# RotationMaster (fork)

This is a fork of [RotationMaster](https://github.com/Ellamental2/RotationMaster) by Ellamental2 — an Alt1 toolkit app for building and overlaying boss/combat ability rotation "cheat sheets" in RuneScape 3.

## Changes in this fork

- **Duplicate ability colour-coding** — when an ability appears more than once in a rotation, each occurrence gets its own small coloured dot in the corner of its icon. Every instance of that same ability shares its colour (e.g. every "Varanus's Mercy" is the same shade), while a different repeated ability gets a different colour. This makes it easier to keep your place in a long rotation without your eyes accidentally jumping to a different occurrence of the same ability further down the sequence.

- **Phase detection rework** — phase/wave transitions are now tracked using coloured status circles plus direct on-screen phase reading, replacing the earlier ability-greying based detection. This gives more reliable phase advancement during fights where the old approach could misfire.

### Example

![Rotation preview with duplicate-ability colour coding](src/assets/testingimg1.png)

## Credit

All core functionality (rotation building, the Alt1 overlay, wave/phase detection, settings) is from the original [RotationMaster](https://github.com/Ellamental2/RotationMaster) project. This fork only adds the changes described above.

## Deploying this fork (for maintainers)

GitHub Pages for this repo serves the `docs/` folder on `master`. There is no automatic build step — after any source change, the site must be rebuilt and redeployed manually:

```
npx ng build --base-href /RotationMaster/
```

Then copy the fresh build output into `docs/`, replacing the old hashed files but leaving `appconfig.json`, `detect-libc.js`, and `sharp.js` untouched (these aren't build output — they're stub files referenced by an import map in `index.html` that redirect Node-only modules to browser-safe versions):

```
Remove-Item docs\main-*.js, docs\polyfills-*.js, docs\styles-*.css
Copy-Item dist\RotationMaster\browser\* docs\ -Recurse -Force
```

Then commit and push `docs/` to `master` as usual. Note that GitHub Pages' CDN can take a few minutes to pick up a fresh `index.html` after a deploy — if the live site looks unchanged right after pushing, wait a few minutes or append a cache-busting query string (e.g. `?v=2`) before assuming something's broken.
