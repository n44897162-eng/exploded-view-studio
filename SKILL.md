---
name: exploded-view-studio
description: Generate polished, offline Three.js exploded-view product pages from a declarative scene JSON, with product-specific construction grammar, adaptive art direction, and a single-file mobile build.
whenToUse: Use when the user asks for a 3D product teardown, exploded assembly, interactive parts diagram, or a Three.js technical product page with selection, specs, and an explode control. 中文场景：产品爆炸图、拆解图、分解图、部件示意图、爆炸装配动画。
---

# Exploded View Studio

Build a self-contained product workbench: procedural Three.js product, 8–12 selectable modules, 3D pins, inspector, exploded view, orbit/zoom, responsive layout. No framework, build step, CDN, external model, or network request.

Style is data-driven: a `design` block (or product-name inference) selects palette, layout, density, corners, backdrop, typography, chrome, pattern, and motif. A second layer, `identity`, selects **how the product is constructed and operated**: stage atmosphere, camera views, explode order, connector paths, and action language.

**Default output: `<output-dir>/<project-name>`.** Pick any local folder and pass it as the scaffold target; nothing is written outside it. Skill source: this repository. Exemplars: `examples/camera`, `examples/x450`, `examples/audio`.

## Quick start

```bash
cd exploded-view-studio
node scripts/validate-spec.mjs examples/camera/scene.json
node scripts/check-assembly.mjs examples/camera/scene.json
node scripts/scaffold.mjs examples/camera/scene.json ../my-camera-view
node scripts/audit.mjs ../my-camera-view
```

The scaffold creates `index.html` and a mobile-ready `standalone.html`. It refuses a non-empty folder, unresolved collisions, or a pending assembly review. Both builds work from `file://`.

## Output contract

- `index.html`: modular page with local CSS, Three.js, spec, design, engine.
- `standalone.html`: one offline HTML with CSS, base64 fonts, Three.js, spec, engine, licenses.
- `scene.json` + `check-assembly.mjs`: source and collision reviewer, kept for self-review.
- `README.md`: theme, modules/parts, mass, research mode, assembly result, how to open.

Never require a server, CDN, Google Fonts, remote icons, or remote models. `audit.mjs` rejects remote URLs.

## Mobile and zoom

- DPR cap: **2.5** compact/coarse pointer, **1.75** desktop; recalculate on resize/visualViewport.
- Compact pins: show only selected/hovered pin and label; all dots are hidden in overview.
- Touch: one finger orbits, two fingers pinch. Keep `touch-action:none` and the pinch handler.
- **Never remove zoom clamps.** The rendered radius stays between `minVisibleRadius` and `maxVisibleRadius`; maximum zoom-out must keep the product and stage visible. Do not override with extreme camera specs.
- At ≤980 px: stage first, then modules, then inspector; status bar static; `100dvh` plus `100vh` fallback.
- QA at 390×844, 1366×768, 1600×1000: no overflow, all rows reachable, selected-only pins on mobile, model visible at both zoom limits.

## Art direction

| Preset | Character | Layout | Type | Backdrop |
|---|---|---|---|---|
| `aerolab` | dark aerospace, orange/cyan | workbench | industrial | rings |
| `foundry` | warm light industrial | workbench | industrial | grid |
| `atelier` | light editorial optical | focus | editorial | horizon |
| `pulse` | clinical white/teal | panorama | humanist | horizon |
| `terrain` | light field/expedition | panorama | humanist | grid |
| `studio` | light audio/furniture | atlas | editorial | plain |
| `nocturne` | dark warm luxury | focus | editorial | plain |
| `signal` | dark performance, lime/pink | panorama | technical | grid |

Inference (first match): camera/lens/optic → `atelier`; medical/clinical/wearable → `pulse`; outdoor/field/expedition/tactical → `terrain`; audio/speaker/furniture/lamp → `studio`; watch/luxury/jewel/perfume → `nocturne`; drone/sport/racing → `signal`; tool/robot/industrial → `foundry`; else `aerolab`.

```json
"design": {
  "preset": "foundry",
  "layout": "workbench",
  "density": "compact",
  "corners": "soft",
  "backdrop": "grid",
  "typography": "industrial",
  "chrome": "technical",
  "pattern": "hatch",
  "colors": { "accent": "#b06a2c", "alt": "#2d6d68" }
}
```

Enums: layout `workbench|focus|panorama|atlas`; density `compact|comfortable|airy`; corners `square|soft|round`; backdrop `rings|grid|horizon|plain`; typography `industrial|editorial|humanist|technical`; chrome `technical|minimal`; pattern `grid|dots|hatch|contour|none`; motif `orbit|settings-2|focus|activity|sparkles|gauge|compass|audio-lines`.

Color overrides accept any theme token; custom hex accent/alt derive soft/line/wash. `design.scene` overrides background/fog/floor/dust/exposure/lighting/ring opacity, `bodyRoughness`, `bodyMetalness`. Keep saturated lights low: neutral key/ambient + one subtle accent light; put color in UI, accent parts, and rings. Strong lime/pink keys make dark PBR surfaces maroon.

## Construction grammar

`identity` makes the page specific to the object. Omit it and the engine infers from name/category/preset, but explicit is better.

```json
"identity": {
  "archetype": "camera",
  "construction": "optical",
  "stage": "aperture",
  "views": [
    { "label": "MACRO", "theta": 0.64, "phi": 1.08, "zoom": 0.82 },
    { "label": "TOP", "theta": 0.02, "phi": 0.16, "zoom": 0.96 },
    { "label": "FRONT", "theta": 0, "phi": 1.32, "zoom": 0.9 }
  ],
  "motion": { "stagger": 0.055, "order": "optical", "connectors": true },
  "actions": { "explode": "拆解光路", "assemble": "合拢镜组" }
}
```

Defaults:

| Archetype | Stage | Construction | Views |
|---|---|---|---|
| camera | aperture | optical | MACRO / TOP / FRONT |
| quadrotor | rotor | radial | FLIGHT / TOP / NOSE |
| audio | waveform | layered | DETAIL / TOP / REAR |
| watch | turntable | circular | DETAIL / TOP / SIDE |
| robot | cell | kinematic | HERO / TOP / DETAIL |
| medical | scan | scan | SCAN / TOP / DETAIL |
| generic | grid | linear | ISO / TOP / FRONT |

- `stage`: `aperture|rotor|waveform|turntable|cell|scan|grid`; it selects a CSS generative stage layer, not just a color.
- `construction` and `motion.order`: `optical|radial|layered|circular|kinematic|scan|linear`; this controls module stagger.
- `views`: 1–3 entries; merges by array index (iso/top/front); `zoom` 0.42–1.6; optional absolute `target`.
- `connectors: true` draws one line segment per module from assembled origin to current position while exploding.
- `atlas` turns the module rail into a 4-column bottom filmstrip; use it for frontal products such as speakers. Up to 8 modules fill a 4×2 grid; 9–12 modules become a horizontally scrollable filmstrip so cards stay readable. Focus/panorama suit optical and radial products.

Construction grammar should be **earned by the object**, not applied as decoration. A camera moves along its optical axis; a rotor explodes root-to-tip around the hub; a speaker separates front-to-back by acoustic layers.

## Research before modeling

For recognizable products, consult official pages/spec sheets, manuals, dimensioned drawings, repair/teardown photos, patents, or credible open models of the same or similar product. Prefer two sources.

```json
"research": {
  "mode": "public-reference",
  "confidence": "medium",
  "sources": [
    { "title": "Official specifications", "url": "https://…", "usedFor": "dimensions, module stack, material cues" }
  ],
  "assumptions": ["Original concept recreation; no logos or proprietary CAD copied."]
}
```

- Modes: `public-reference` (same product), `similar-product` (class analogue), `concept` (no usable reference).
- References inform proportions, module hierarchy, material cues, and visible construction. Do not copy trademarks, trade dress, textures, or proprietary CAD; runtime geometry stays original.
- If no reliable source exists, use `concept` and state assumptions. Never invent a citation.
- URLs are provenance only and never fetched; all runtime assets stay local. Never substitute remote images for modeling.
- Details: `references/research.md`.

## Workflow

1. **Research** the real product or closest analogue; record sources, confidence, assumptions.
2. **Collect facts**: name/model, 8–12 modules, masses, 3–4 specs/module, components, one insight. Label concept values.
3. **Plan modules** with clear functions and silhouettes from primitives; avoid arbitrary fragments.
4. **Write `scene.json`**: meta/product/camera/research, optional design, an `identity` when the object has a distinct construction logic, modules with base/offset/anchor/parts.
5. **Validate**: `validate-spec.mjs`, then `check-assembly.mjs`; fix collisions before adding mates.
6. **Scaffold** to `<output-dir>/<project>`; **audit**.
7. **Self-review** assembled and 50%/100% views from front/side/top/close-ups; confirm no cross-module clipping, then set `review.status = "passed"`.
8. **Open** `standalone.html` on phone and desktop; record the QA result.

## Minimal spec

Start from `examples/camera/scene.json`. Required top-level keys: `meta`, `product`, `camera`, `modules`; include `research` and `assembly` before scaffolding. Each of 8–12 modules needs `id`, `title`, `en`, `mass`, `base`, `offset`, `anchor`, `description`, `specs`, `components`, `insight`, and `parts`.

`base` is module origin, `offset` displacement at 100%, `anchor` local pin. Module masses sum to `totalMass` within 0.5 g. Types: box/cylinder/cone/sphere/torus/ring/plane/tube. Materials: body/bodyLight/dark/black/prop/silver/steel/rubber/copper/pcb/pcbLight/chip/glass/sensor/accent/cyan/white/floor. Use `prop` for rotor blades and dark technical surfaces. Full rules: `references/spec-schema.md`.

## Camera and floor

Auto-fit frames assembled and exploded bounds with an explode ratio. `fitPadding` 1.08–1.14 suits dense products; raise it if exploded bounds clip. `theta` orbits Y; `phi≈1.1` is a low three-quarter view. Product-specific presets belong in `identity.views`; `zoom` multiplies the fitted radius.

The floor follows the lowest module every frame (`baseMinY + offset.y * state`) and sits 0.12 below it. This prevents downward modules from sinking through the platform. Never re-anchor the floor in `measureFit()`.

## Assembly review

`check-assembly.mjs` builds an OBB for every solid part and reports cross-module hits at the assembled state. Tolerance defaults to 4 mm. Nested parts are ignored; every other hit needs a fix or a declared structural interface.

```json
"assembly": {
  "tolerance": 0.004,
  "internal": ["02", "05"],
  "mates": [
    { "modules": ["01", "03"], "reason": "lens mount seated through the front shell" }
  ],
  "review": { "status": "passed", "reviewedAt": "2026-11-11", "notes": "0/50/100% inspected" }
}
```

- `internal` only for modules genuinely hidden inside a shell; overlaps are still reported, never a free pass. Never hide visible parts.
- `mates` only for real surface-contact joins. Never blanket-whitelist all modules or excuse a visible poke-through.
- Overlap within one module is allowed; cross-module contact must be surface-only.
- Run the checker, inspect 0%/50%/100% from several angles, fix what you can, then set `review.status = "passed"` with `reviewedAt` and review `notes`. Scaffold/audit refuse pending reviews or unapproved pairs.
- The checker is a conservative OBB aid, not a CAD kernel. Your eyes are the final check. Details: `references/self-review.md`.

## Quality gates

```text
OK    scene.json | 10 modules | 78 parts | 1502 g
PASS  assembly | 0 unapproved | review passed
PASS  <folder> | local fonts/icons | offline standalone | no remote URLs | no debug branches
```

Then confirm: research recorded; every collision fixed or reviewed; theme visibly distinct; **stage/identity/views are specific to the product, not just a recolored generic page**; construction order and connectors explain the assembly; light/dark contrast readable; silhouette recognizable; all rows + mass visible; explode clean at 0/50/100%; selection syncs list/pin/inspector; controls work; 390/1366/1600 have no overflow/console errors; standalone opens offline.

Use `references/qa-checklist.md` for exact Puppeteer checks. Headless Chrome `--window-size` is not the CSS viewport; use `page.setViewport()`.

## Memory and assets

- DPR caps 2.5 mobile / 1.75 desktop; 1024² shadow; no postprocessing.
- Pause rendering when hidden; share materials/geometries; 140 dust points.
- Keep under ~150k triangles and ~700 draw calls.
- Local fonts: Space Grotesk, Newsreader, Manrope, IBM Plex Mono (subset WOFF2). Local icons: inline Lucide 1.69.0. Licenses in `LICENSES/`.
- No remote model, texture, font, or icon requests.

## References

- `references/spec-schema.md` — spec/research/assembly/design/part contract.
- `references/design-rationale.md` — GitHub research, construction grammar, fusion decisions, trade-offs.
- `references/research.md` — public sources and honest concept labeling.
- `references/self-review.md` — collision/interface review at 0/50/100%.
- `references/archetypes.md` — composition patterns, identity defaults, theme recommendations.
- `references/qa-checklist.md` — browser/theme/mobile/stage/identity/floor/collision tests.
- `references/environment.md` — install, browser setup, performance budget.
- `examples/camera/`, `examples/x450/`, `examples/audio/` — scenes, previews, standalone examples.

Load a reference only when its detail is needed; this file is the working summary.

## Environment

- Node 20+, built-in modules only; Three.js r152.2 UMD.
- Chrome or Edge: point Puppeteer's `executablePath` at your own install.
- Never rewrite UTF-8 JS/docs with PowerShell `Get-Content`/`Set-Content`; use the editor or Python UTF-8.
- Values are conceptual approximations, not CAD measurements; say so in the README.