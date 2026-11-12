# Design rationale: from one workbench to a construction grammar

This document records the research, trade-offs, and fusion choices behind version 1.2. It is deliberately about **decisions**, not just features. The goal is a generator whose output changes with the product's construction logic, not only with its accent color.

## 1. Problem

The previous version had a strong visual system, but every product inherited the same:

- topbar + left rail + 3D stage + right inspector;
- ISO / TOP / FRONT camera buttons;
- one linear explode curve with index-based stagger;
- one stage atmosphere per theme;
- the same interaction promises regardless of whether the object is a camera, a rotorcraft, a speaker, a watch, or a robot.

That is a good generic product viewer, but a weak **product-specific** one. A camera should feel optical; a drone should feel radial and airborne; a speaker should feel frontal, layered, and acoustic; a watch should feel circular; a robot should feel kinematic.

## 2. What was studied

GitHub and public documentation were read as design references. No source code was copied, and no runtime dependency was added. Direct `raw.githubusercontent.com` access failed in this environment; the same public documents were read through jsDelivr mirrors.

| Source | License | Useful pattern | Adopted / rejected |
|---|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | Apache-2.0 | self-contained skill folder; short SKILL; scripts/resources; progressive disclosure | adopted folder contract and reference split; did not copy content |
| [google/model-viewer](https://github.com/google/model-viewer) | Apache-2.0 | first-class mobile, sensible defaults, explicit browser/fallback guidance | adopted mobile-first defaults and offline delivery; no web component dependency |
| [pmndrs/drei](https://github.com/pmndrs/drei) | MIT | `Bounds`/`Center`/`Stage`/`ContactShadows`/`Html`/adaptive quality | translated the *ideas* into vanilla Three.js auto-fit, contact shadow, pins, adaptive DPR; no React |
| [theatre-js/theatre](https://github.com/theatre-js/theatre) | Apache-2.0 core | authored motion scores, sequencing, micro-interactions | adopted the idea of a per-product motion score; did not add the editor/runtime |
| [juliangarnier/anime](https://github.com/juliangarnier/anime) | MIT | stagger, delay, keyframes, easing | implemented stagger/delay directly with damped values; no dependency |
| [motiondivision/motion](https://github.com/motiondivision/motion) | MIT | springs, gesture-led interactions, responsive motion | adopted gesture-friendly damping and reduced-motion respect; no React/Vue |

The synthesis is not “use these libraries.” It is: use their *observable principles* — progressive disclosure, mobile defaults, declarative framing, authored motion, stagger, and gesture affordance — inside the existing zero-dependency engine.

## 3. Chosen architecture

### 3.1 Identity resolution

A new optional `identity` block gives the product a construction grammar:

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

Resolution order:

1. explicit `identity` values;
2. product/name/category keyword inference;
3. design preset mapping;
4. `generic`.

This preserves a one-line quick start: a camera-like product name still gets the optical grammar without a large spec.

### 3.2 Stage skins, not just palettes

`data-stage` selects a **generative CSS layer** above the canvas. It is intentionally CSS, not textures or a postprocessing stack:

- `aperture` — conic shutter blades, dashed inner ring, breathing core;
- `rotor` — four arc groups, dashed rotor ring, horizon;
- `waveform` — masked equalizer fields and low-frequency glow;
- `turntable` — radial ticks, measurement circle, crosshair;
- `cell` — perspective envelope and sweeping gauge;
- `scan` — moving scan line, concentric rings, diamond target;
- `grid` — restrained construction crosshair.

Reasons:

- zero network/assets;
- no extra draw calls or textures;
- works at every DPR;
- reduced motion can disable all animation with one media query;
- themes can tune opacity/blend per light or dark mode.

The existing `backdrop` still controls the **3D floor**. The new layer controls the **stage atmosphere**. They are complementary, not duplicates.

### 3.3 Layout as product hierarchy

The new `atlas` layout makes the module list a 4×2 filmstrip under the stage, with the inspector as a full-height right dock. For 9–12 modules it becomes a horizontally scrollable filmstrip with readable card titles.

Why audio:

- a monitor is frontal, symmetrical, and read as a stack of drivers, crossover, and cabinet;
- a bottom filmstrip mirrors a rack/listening-room control surface;
- 8 modules fit without scroll;
- the stage keeps the product large and centered.

Why not camera/drone:

- the camera benefits from a left-to-right lens-to-body reading order and a large focus stage;
- the drone benefits from a wide panorama because its silhouette is radial.

This is the intended meaning of “product-specific UI”: **the same components are re-composed according to the object’s hierarchy**, not merely recolored.

### 3.4 Choreography

Construction order controls stagger:

- optical: front-to-back along +Z;
- radial: around the hub;
- layered: highest-to-lowest;
- circular: angular;
- scan: bottom-to-top;
- kinematic: base-to-tip;
- linear: index order.

The total stagger window is capped at 0.58 s. All modules still reach 1 at full explode. This avoids the “some modules never finish” trap and keeps the control legible.

### 3.5 Exploded-path connectors

One `LineSegments` buffer (two vertices per module) draws the vector from a module's assembled origin to its current position. It is visible only while exploding and uses the accent color at low opacity.

This is a genuine fusion feature:

- it visualizes the *construction logic*, not just the final arrangement;
- it costs one draw call and no textures;
- it makes a 50% state meaningful instead of just “halfway.”

### 3.6 Camera views

View presets are data, not hardcoded UI:

- camera: MACRO / TOP / FRONT;
- drone: FLIGHT / TOP / NOSE;
- audio: DETAIL / TOP / REAR.

The engine writes labels and respects per-view `zoom` and optional `target`. The reviewer can therefore ask “show me the nose” or “show me the rear port” rather than a generic front view.

## 4. Rejected options

| Option | Why rejected |
|---|---|
| Add React + drei components | Conflicts with the single-file, zero-framework, offline contract; increases bundle and cognitive cost |
| Add anime.js / Motion / Theatre runtime | The required stagger and damped gestures are small; a dependency would add weight without new user value |
| Add postprocessing (bloom/DOF/SSAO) | Mobile budget and DPR risk; CSS atmosphere gives most of the visual gain at near-zero cost |
| Add external HDRIs/textures/models | Violates offline/local-only and licensing simplicity |
| Random generative backgrounds | Determinism, accessibility, and auditability matter more than novelty |
| A separate layout per product | Maintenance explosion; `atlas` + existing families cover the hierarchy differences with one shared DOM |
| Whitelist all collisions | Hides visible poke-through; collision review remains explicit |

## 5. Performance and accessibility

- No additional WebGL resources beyond one LineSegments buffer and one shared micro-surface texture.
- Stage signatures are CSS only; no extra draw calls.
- `prefers-reduced-motion` disables stage and connector animations.
- DPR caps: 2.5 compact / 1.75 desktop; 1024² shadow, 140 dust points, no postprocessing.
- Stage motifs are decorative (`aria-hidden`); the product name, module list, inspector, and control labels remain semantic.
- Mobile keeps selected-only pins, pinch, bounded zoom, and a static status bar.

## 6. Validation evidence

- Camera: 10 modules / 78 parts / 1,502 g; aperture stage; MACRO/TOP/FRONT; 970×906 stage at 1600; no errors or external requests.
- X450: 10 / 80 / 1,072 g; rotor stage; FLIGHT/TOP/NOSE; 1,082×906 stage at 1600.
- Audio: 8 / 48 / 6,930 g; atlas layout; waveform stage; DETAIL/TOP/REAR; 1,252×782 stage + 124 px filmstrip at 1600; 8 cards in 4×2; no errors.
- All three at 390×844, 1366×768, 1600×1000: zero overflow, zero console errors, zero external requests.
- Connectors: opacity 0 at 0%, ~0.17–0.20 at 50%, ~0.34 at 100%.
- Floor clearance stays ≥0.12 at full explosion.
- Standalone builds: ~986 KB (camera), ~986 KB (X450), ~975 KB (audio).

## 7. Limits

- The stage layer is atmospheric, not a simulation; it does not represent real optical/rotor/acoustic behavior.
- The collision checker remains a conservative OBB aid, not CAD.
- Identity inference is heuristic; explicit `identity` is preferred for production work.
- The audio example has 8 modules and uses atlas; the engine supports 8–12, but dense 12-module layouts still need per-density QA.
- The atlas filmstrip is designed for 8 short module names; 9–12 modules switch to a horizontally scrollable strip so cards stay readable.

## 8. Fusion statement

The innovation is the coupling of four normally separate systems:

1. **product research** that establishes real proportions and hierarchy;
2. **an identity schema** that encodes how the object is put together;
3. **stage/UI grammar** that changes layout, backdrop, camera views, and copy;
4. **construction-aware motion** that explains the assembly rather than merely animating it.

Colors remain the outer layer. The construction grammar is the new core.