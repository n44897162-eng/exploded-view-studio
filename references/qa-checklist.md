# QA checklist

Run in this order. Do not call a page finished from a single screenshot.

## 1. Static checks

```powershell
node --check assets/template/design.js
node --check assets/template/engine.js
node --check scripts/validate-spec.mjs
node --check scripts/scaffold.mjs
node --check scripts/audit.mjs
node --check scripts/check-assembly.mjs
node scripts/validate-spec.mjs examples/x450/scene.json
node scripts/validate-spec.mjs examples/audio/scene.json
node scripts/check-assembly.mjs examples/audio/scene.json
node scripts/scaffold.mjs examples/camera/scene.json ..\qa-camera
node scripts/audit.mjs ..\qa-camera
```

Required results:

```text
OK    scene.json  |  10 modules  |  78 parts  |  1502 g
PASS  assembly  |  0 unapproved  |  review passed
OK    scaffolded ...\qa-camera
      10 modules · 78 parts · 1502 g
      assembly clean · research similar-product
PASS  ...\qa-camera
      10 modules · 78 parts · 1502 g · 171.1 KB source · 987.6 KB standalone
      design atelier | research similar-product | local fonts/icons | offline standalone | no remote URLs | no debug branches
      assembly 0 unapproved | 5 internal modules | 63 internal overlaps | review passed
```

If `node --check` fails, fix syntax before any browser work. If the checker reports an unapproved pair, fix the geometry or declare a real mate/internal module; do not jump to `review.status = "passed"`.

## 1b. Assembly and research gate

- `research.mode` is honest. `public-reference`/`similar-product` cite at least one real source with `usedFor`; `concept` lists assumptions. The page never fetches source URLs.
- Every intentional cross-module contact is either a real mate with an interface-specific reason or a genuinely enclosed module in `assembly.internal`.
- No visible poke-through is hidden by a mate. No module is marked internal if it is visible through an opening.
- `review.status` is `passed` only after the visual review below; `reviewedAt` is present.
- Checker PASS alone is not enough: inspect assembled, 50%, and 100% views from front, side, top, and a low three-quarter angle. Verify the floor does not cut through the lowest module.
- Negative-test the gate if you changed it: overlapping external boxes + pending review must fail; a legitimate mate/internal must pass.

## 2. Exact viewport screenshots

Use Puppeteer. Do **not** trust Chrome `--window-size` for layout QA on Windows: `1600×1000` produces an inner viewport around `1582×848`, and the image is vertically stretched. A screenshot taken that way can make a visible summary card look clipped.

Install the QA tool in a temporary folder outside the deliverable:

```powershell
npm install puppeteer-core@24.16.0 --prefix ..\.qa-tools --no-fund --no-audit
```

Launch Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`:

```js
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader',
         '--enable-unsafe-swiftshader', '--hide-scrollbars']
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
await page.goto('file:///C:/path/to/qa-camera/index.html', { waitUntil: 'load' });
await page.waitForFunction(() => window.__STUDIO__);
await new Promise(resolve => setTimeout(resolve, 2000));
await page.screenshot({ path: 'qa-1600.png' });
```

Capture at least:

- **1600×1000** assembled;
- **1600×1000** exploded (100%);
- **1366×768** assembled;
- **390×844** mobile (and 900×1000 for a stacked check when useful).
- Assembled, 50%, and 100% for each archetype when identity/stage changed.

For a new or changed theme system, also capture each preset at 1600×1000. A contact sheet is useful: the themes should differ in mode, layout, typography, corner radius, and backdrop, not only accent color.

Wait for the boot overlay to be removed before screenshotting. The template removes `#boot` about 1.6 s after load.

## 3. Visual checks

### Theme

- `document.body.dataset` has the expected `theme`, `mode`, `layout`, `density`, `corners`, `backdrop`, `typography`, and `chrome` values.
- Light themes (`foundry`, `atelier`, `pulse`) have readable muted text, borders, module rows, and pin labels on the light stage.
- Dark themes (`aerolab`, `nocturne`, `signal`) separate the product from the background; dark parts are lit by a neutral key, not only by accent-colored lights.
- The backdrop is appropriate: `rings`/`horizon` show a floor; `grid` shows the CSS grid and a soft contact shadow; `plain` has no synthetic floor.
- Local fonts loaded: the display face matches the preset (serif, mono, or sans) and there are no fallback jumps or network font requests.
- The inline icon sprite renders in the brand, view controls, dock, module rows, inspector actions, and status bar; `currentColor` follows the active theme.
- Typography actually changes: editorial pages read as a display serif, technical pages as monospace, humanist pages as a neutral sans.
- Corner radius and layout density match the preset; a `focus` layout should visibly narrow the side rails.

### Identity and stage

- `document.body.dataset` also has `identity`, `stage`, `construction`, `pattern`, and `motif`.
- The stage skin matches the object: camera `aperture`, drone `rotor`, audio `waveform`, watch `turntable`, robot `cell`, medical `scan`, generic `grid`.
- `#stageMethod` reads `<identity label> / <stage>` (for example `OPTICAL BENCH / APERTURE`).
- View labels are product-specific (MACRO/TOP/FRONT for camera; FLIGHT/TOP/NOSE for drone; DETAIL/TOP/REAR for audio), not hardcoded ISO/FRONT.
- Stage signature is visible but does not overpower the product; `prefers-reduced-motion` stops its animation.
- `atlas` puts all 8 audio modules in a 4×2 bottom filmstrip with the inspector spanning the right side; a 9–12 module atlas spec becomes a horizontally scrollable filmstrip. At ≤980 both return to the normal stacked rail.
- Shell heights are correct: stage starts under the topbar, content ends at the status bar, no empty band on desktop.

### Assembled

- Recognizable silhouette at 100% view; the product is not a pile of primitives.
- Lens/optics or rotor discs are not clipped by the stage edges.
- Product sits on or above the stage floor; no part floats far away.
- At 0%, 50%, and 100% separation, no module's lowest point is below the visible floor. The floor must follow the lowest moving module, not stay fixed at the assembled min-Y.
- At 0% and close-up angles, no shell, ring, board, or fastener visibly passes through a neighboring module. Intended contacts are surface-only.
- Selected pin label sits over the product, not over the inspector or dock.
- All modules (8–12) are visible at 1366×768 or are clearly scrollable; an 8-module atlas shows all cards without scroll, while 9–12 show a readable horizontal filmstrip.
- System-weight summary is fully visible at 1600×1000.

### Exploded

- Every module is visibly separated; no module is lost behind another.
- Explosion does not leave the stage or collide with the dock.
- Labels remain readable and only the selected/hover label is shown.
- The exploded product is not tiny; aim for roughly 65–80% of stage width.
- Loose internals (sensor, boards, cooling) do not overlap the body shell.

### Responsive

- At 900 px, stage appears before the module list and inspector.
- No horizontal scrollbar.
- Text does not overflow module rows or inspector cards.
- The dock and status bar do not cover controls.

## 4. Interaction checks

Use `page.click` / `page.evaluate`, then inspect the DOM:

1. Select module `09` from `#moduleList`; check the active row, inspector title, and mass share.
2. Click a 3D pin; the same module should become active.
3. Hover a mesh; cursor/pin state should update and return to normal.
4. Click `#explodeBtn`; label flips to the product-specific assemble action (for camera `合拢镜组`), `aria-pressed=true`, readout reaches 100%.
5. Drag `#explodeRange`; readout and button state update.
6. Click each dynamic view (`MACRO/TOP/FRONT` or product-specific labels); active view changes and camera settles.
7. Toggle auto-orbit; confirm it turns off on manual drag and on explode.
8. At 50%/100%, connector lines are visible at low opacity and terminate at moving modules; at 0% they disappear.
9. Click each module then “独立查看”; only that group remains visible, and the label becomes `退出独立`.
10. Keyboard: arrows change module, `E` toggles explode, `R` resets, `F` focuses, `Space` toggles orbit, digits 1–0 select modules.

The test build should report:

```js
window.__STUDIO__.modules.length // 8–12, 10 for camera/x450, 8 for audio
window.__STUDIO__.countParts()   // 78 camera, 80 x450, 48 audio
```

No `pageerror` and no console `error` entries.

## 5. Performance checks

At 1600×1000, inspect `renderer.info`:

```js
const info = window.__STUDIO__.renderer.info;
({ calls: info.render.calls, triangles: info.render.triangles,
   geometries: info.memory.geometries, textures: info.memory.textures });
```

Reference camera example: about 91 draw calls, 13k triangles, 2 textures, DPR 1 in headless. Stage skins and connectors add no textures; connectors add one draw call.

Guidelines:

- draw calls < 700;
- triangles < 150k;
- textures < 30;
- pixel ratio capped at 2.5 on compact/coarse-pointer viewports, 1.75 on desktop;
- shadow map 1024²;
- no postprocessing;
- render paused when `document.hidden`.

If the budget is exceeded, merge repeated details, reduce segments, or share materials/geometries. Do not remove the selected reticle or shadow unless the visual suffers.

## 6. Known pitfalls

- **PowerShell UTF-8 corruption.** Never use `Get-Content -Raw` + `Set-Content` to rewrite `app.js` or any file containing `›`, `·`, `—`, or Chinese text. It can emit invalid UTF-8 bytes and break `node --check`. Use the editor or Python `Path.write_text(..., encoding="utf-8")`.
- **Headless viewport mismatch.** Use Puppeteer `setViewport`, not `--window-size`.
- **Virtual time animation.** Headless virtual time may not advance the explode animation; set the state directly or wait in real time. Do not conclude the animation is broken from a 0% screenshot.
- **Boot ghost.** The boot overlay at partial opacity can look like huge 3D text across the product. Hide/remove `#boot` before judging geometry.
- **Pinned panel summary.** Verify with `getBoundingClientRect`; a screenshot may crop or stretch it. The summary can be fully inside the panel while the image says otherwise.
- **Labels.** Pin labels should be `display:none` unless `.part-pin:hover` or `.is-selected`; otherwise all labels stack over the model.
- **Colored-light tinting.** Strong lime/pink/cyan lights make dark metal and prop blades read muddy or maroon. Test with colored lights off. Prefer a neutral key/ambient plus low-intensity accent edge lights; keep saturated color in the UI, rings, and accent parts.
- **Hard shadow disk.** A large `ShadowMaterial` circle looks like a solid brown/gray disk under a product and can be mistaken for the floor. Use a soft radial contact-shadow plane for grid/plain themes, not a hard-edged shadow catcher.
- **All-in-one build.** Open `standalone.html` from `file://` on a phone-sized viewport. Confirm zero network requests, fonts load, icons render, and the page is usable without `index.html` or any adjacent assets.
- **Mobile pins.** At 390×844 with a coarse pointer, only the selected/hovered pin and label should be visible. Desktop should retain all 10 pins while still showing only the selected label.
- **Zoom bounds.** Push wheel/touch zoom to the maximum and minimum. The product must remain visible; the page must not turn into an empty/black stage. Verify `rig.maxVisibleRadius` is not exceeded.
- **Floor anchored only to the assembled bounds.** Negative explode offsets will sink through a fixed platform. The template now records `baseMinY` per module and moves the floor to the current lowest module every frame; do not revert this when customizing.
- **Collision whitelist abuse.** `assembly.mates` and `assembly.internal` are not a blanket pass. A mate must name the real interface; an internal module must be genuinely enclosed. If the pair is a visible poke-through, fix the geometry.
- **Research theater.** Do not invent citations or copy a proprietary CAD model. `research` records the sources that informed proportion/stack; the runtime model remains original procedural geometry and local-only.
- **Checker over-trust.** The OBB test is conservative but optional parts (`plane`/`tube`, `collision:false`) and partial protrusions can slip past. Inspect close-ups at 0%/50%/100% after a PASS.
- **Remote font or icon temptation.** Do not add a Google Fonts/CDN icon request. Bundle subsetted WOFF2 files and inline SVG symbols under the license files; audit will reject remote URLs.
- **Theme-driven 3D.** Setting CSS colors alone does not theme the scene. Check `DESIGN.scene` background, fog, lights, ring opacity, dust, and contact shadow.
- **Auto-fit.** If the assembled view is small but exploded is clipped, adjust `fitPadding` and the exploded offsets, not only the base radius.
- **Mass drift.** Always validate after editing modules; a single changed module mass breaks the summary.

## 7. Cleanup

Delete QA screenshots, notes, Chrome profiles, temporary scaffolds, and `.qa-tools` before delivering. Keep only the page files, `preview.png`, `vendor/`, and a short README. Re-run `node --check` and the static audit after cleanup.