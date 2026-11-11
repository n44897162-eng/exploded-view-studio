# Environment notes

Notes from building and validating the reference pages. They are here so the next run does not rediscover them.

## Runtime

| Item | Value |
|---|---|
| OS | Any desktop OS; developed and QA'd on Windows |
| Node | 20 or newer (`node` on PATH); the scripts use built-in modules only |
| npm | optional, only for the QA tooling below (on Windows, `cmd /c npm ...` if PowerShell blocks `npm.ps1`) |
| Browser | Chrome or Edge; set `executablePath` to your own install |
| Headless checks | `puppeteer-core` pointed at that installed browser (see below) |
| Three.js | r152.2 UMD, bundled at `assets/vendor/three.min.js` (633,338 B) |
| Runtime dependencies | none besides the bundled Three.js |

The generated page must run from `file://` with no server and no network. Do not add a CDN, remote font, remote texture, or model service.

## Exact viewport QA

Chrome headless on Windows has a window/viewport mismatch. Compensated `--window-size` values only approximate; the reliable approach is Puppeteer:

```powershell
npm install puppeteer-core@24.16.0 --prefix ..\.qa-tools --no-fund --no-audit
```

Then `page.setViewport({ width: 1600, height: 1000 })`. For 1366 use `{ width: 1366, height: 768 }`; for the stacked breakpoint use `{ width: 900, height: 1000 }`. For a theme change, also screenshot every preset at 1600×1000 and compare them as a contact sheet; a different accent alone is not enough differentiation.

`puppeteer-core` does **not** download Chromium; point `executablePath` at the installed Chrome. Do not ship `.qa-tools` with the page.

## Headless browser quirks

A blank screenshot is usually an environment problem, not a page bug. Check, in order:

1. Did the browser actually launch? A permission or named-pipe error at startup (for example `platform_channel.cc ... 拒绝访问 / access denied`) means the sandbox blocked the browser; run it with broader filesystem permissions.
2. Was the viewport set? `--window-size` on the command line is not the CSS viewport.
3. Did the page wait for the first frame? Screenshot after a `requestAnimationFrame` pair or a short delay.

Only after those three checks treat a blank render as a code failure.

## UTF-8 safety

**Never** rewrite JavaScript with:

```powershell
Get-Content -Raw app.js | Set-Content app.js
```

On this Chinese-locale system it can corrupt `›`, `·`, `—`, and Chinese punctuation into bytes such as `e2 80 3f`, producing:

```text
SyntaxError: Unexpected identifier
```

Use the editor's `edit` tool, or Python with explicit UTF-8:

```python
from pathlib import Path
Path('app.js').write_text(text, encoding='utf-8')
```

## Skill installation

A skill is just this folder. To install it for an agent, copy (or symlink) the whole directory into that agent's skills directory, keeping the directory name identical to the frontmatter `name`:

```text
<skills-dir>/exploded-view-studio/SKILL.md
```

The frontmatter `name` must stay `exploded-view-studio`. Some hosts watch the skills directory and pick the skill up on the next run; others need a restart. A directory symlink or junction is a convenient way to keep editing the source copy while the installed path stays stable.

Default project output root: anywhere you have write access. This repo keeps no output inside itself; generated pages live in the folder you pass to `scaffold.mjs`.


## Assembly and research validation

- `node scripts/validate-spec.mjs examples/camera/scene.json` validates schema/design/research/assembly.
- `node scripts/check-assembly.mjs examples/camera/scene.json` reports OBB intersections at 0% explode; exit 0 requires no unapproved pair and `assembly.review.status === "passed"`.
- `node scripts/scaffold.mjs ...` refuses a pending review or unresolved collision, copies `check-assembly.mjs` and `scene.json` into the project.
- `node scripts/audit.mjs <project>` repeats the collision gate and prints `assembly ... | review passed`.
- Research URLs are provenance only and are never fetched by the page. Do not add remote assets.

The checker is a conservative OBB aid, not a CAD kernel. Inspect assembled and 50%/100% exploded views from multiple angles; see `references/self-review.md` and `references/research.md`.

## Reference deliverables

- Camera exemplar: `examples/camera/` — 10 modules, 1,502 g, with `preview.png` and `preview-mobile.png`.
- Quadrotor exemplar: `examples/x450/` — 10 modules, 1,072 g, with `preview.png` and `preview-exploded.png`.

The exemplars use hand-built geometry; the skill template uses the declarative part system. They share the interaction grammar, but **not** one fixed visual style: the camera is `atelier` (light editorial) and the quadrotor is `signal` (dark performance). The template’s `assets/template/design.js` carries all eight presets, inference, patterns, copy tokens, and scene tokens; edit that file to add or tune an art direction.

## Performance budget

The template caps device pixel ratio at 2.5 on compact/coarse-pointer viewports and 1.75 on desktop, and uses a 1024² shadow map. The scaffold also emits a single-file `standalone.html` (CSS, base64 fonts, Three.js, design system, spec, engine, and licenses inlined). Reference camera example at 1600×1000 in headless Chrome:

- ~91 draw calls
- ~13k triangles
- 16 textures
- 140 floor points
- 60 FPS at 1366 in the camera exemplar, lower under software rendering at 1600

These are guidelines, not hard limits. A product with a complex lens or many detail parts may be higher; keep draw calls below ~700 and triangles below ~150k.

## Cleanup

The scaffold never deletes a non-empty output directory. For QA, use a fresh temp folder and remove it yourself after screenshots. Keep the delivered folder free of:

- `.chrome-*`, `.edge-*`, Chrome profiles;
- `qa.mjs`, screenshots, raw crops, dump DOM files;
- `.qa-tools`, `.qa-cache`, `node_modules`;
- debug hash branches and `#layoutdebug` code;
- temporary examples/scaffolds that are not the deliverable.

## No server required

Open `index.html` directly. The page uses a UMD Three.js build (not ES modules), so `file://` works. If a user insists on a server, any static server is fine, but it is not required and should not become a runtime dependency.