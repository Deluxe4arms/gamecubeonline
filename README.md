# LEGO Star Wars Arcade

A fan-made browser arcade launcher with an integrated GameCube emulator. It uses original CSS illustrations and does not include LEGO/Lucasfilm artwork, game music, or game images. Visitors must provide their own authorized disc images.

## What is included

- Responsive arcade landing page and browser capability checks.
- The [wasm-dolphin](https://github.com/dougchansan/wasm-dolphin) player in `player/`.
- A local file picker that saves the selected game in browser storage and opens it in the emulator. Game files are not uploaded to this site.
- Hosting headers for cross-origin isolation.

LEGO Star Wars compatibility has not been independently verified. The emulator project's README describes broad GameCube boot coverage and identifies Super Smash Bros. Melee as its best-supported/most-tested title. Test the specific game and target hardware before advertising compatibility.

## Run locally

Install Node.js 18 or newer, then:

```bash
cd player
npm run play
```

The emulator's server serves the player with the cross-origin headers needed for SharedArrayBuffer. For a full local-site smoke test, serve the repository root with those same headers; opening `index.html` directly from disk will not work for emulation. The landing page's file is available to the player from the same origin when both are hosted together.

## Publish this repository on GitHub

1. Create a new **public** GitHub repository, for example `lego-star-wars-arcade`. Do not add a README, license, or `.gitignore` in GitHub since these files are already in this folder.
2. In Terminal, run the following from this folder, replacing `YOUR-USERNAME` with your GitHub username:

   ```bash
   git init
   git add .
   git commit -m "Add LEGO Star Wars browser arcade"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/lego-star-wars-arcade.git
   git push -u origin main
   ```

3. Keep personal game images and saves out of the repository. The included `.gitignore` excludes common disc-image and save-file extensions.

GitHub Pages does not provide the required COOP/COEP response headers for this emulator. Use GitHub as the source repository and deploy from it to a host that supports these headers, such as Vercel (configured by `vercel.json`) or Cloudflare Pages (configured by `_headers`). Verify the deployed headers on the player page and its assets before sharing the site.

## Browser and deployment requirements

Use a secure browser context and a desktop Chromium browser. The emulator requires cross-origin isolation for SharedArrayBuffer; WebGPU and gamepad availability depend on browser, operating system, graphics hardware, and controller. The hosting configuration sets:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

Keep emulator assets same-origin where possible. `require-corp` may block incompatible third-party resources.

## Game files and rights

Select your own game image locally in the browser. The site does not upload, store, or distribute ISO files. Only use game files you are authorized to use. Never add commercial game images to a public repository.

## Emulator license and attribution

The emulator is a separate project based on Dolphin and is licensed GPLv2-or-later. Its source, license, notices, and provenance materials are retained in `player/`; comply with applicable GPL source and notice requirements when distributing it or a combined derivative. Review the upstream project's current README and license before redistribution. This unofficial fan project is not endorsed by The LEGO Group, Lucasfilm, Nintendo, or the Dolphin Emulator Project.
