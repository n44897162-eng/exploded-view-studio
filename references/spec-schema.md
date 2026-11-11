# Scene spec reference

`scene.json` is the only product-specific input. `scaffold.mjs` embeds it as `window.SCENE_SPEC` in `scene-spec.js`; `engine.js` reads that object at runtime.

## Top-level shape

```json
{
  "meta": {},
  "product": {},
  "camera": {},
  "design": {},
  "research": {},
  "assembly": {},
  "palette": {},
  "modules": []
}
```

### meta

Used in the top bar and stage copy. All fields are optional strings.

| Field | Example | UI use |
|---|---|---|
| brand | `AEROLAB` | brand name |
| project | `V1` | project label |
| revision | `REV. 01` | revision tag |
| category | `FULL-FRAME MIRRORLESS` | top-bar category |
| kicker | `PROCEDURAL OPTICAL SYSTEM` | top-bar kicker |

### product

| Field | Required | Notes |
|---|---|---|
| name | yes | short product name; also used in `document.title` |
| cn | no | Chinese name beside the product name |
| model | no | model code in `PROJECT / MODEL` |
| tagline | no | key specs line under the stage heading |
| totalMass | yes | grams; must match the module sum within 0.5 g |
| massCode | no | code beside SYSTEM WEIGHT, e.g. `MS-1502` |
| massCaption | no | summary-card footnote, e.g. `CONCEPT LENS 24–70 F2.8` |

### camera

| Field | Default | Meaning |
|---|---|---|
| fov | 34 | vertical perspective FOV |
| theta | 0.75 | initial horizontal orbit angle (radians) |
| phi | 1.12 | initial polar angle; 0 is overhead, 1.4 is a low view |
| target | `[0,0,0]` | assembled focus point |
| fitPadding | 1.08 | multiplier after fitting assembled and exploded bounds |
| autoSpeed | 0.06 | radians per second for auto-orbit |
| minRadius | 2.2 | manual zoom-in limit before auto-fit overrides |
| maxRadius | 34 | manual zoom-out limit before auto-fit overrides |

The engine computes both assembled and exploded bounding spheres, fits the tighter of vertical/horizontal FOV, and scales up for the exploded state. `fitPadding` is the main framing control: 1.10–1.16 is a good starting point for dense products. Lower values make the hero larger but risk clipping at narrow aspect ratios.

### design

Optional. Controls the page art direction, not the model. Omit it and the resolver infers a preset from the product name, Chinese name, tagline, and meta copy.

| Field | Values | Default |
|---|---|---|
| preset | `aerolab`, `foundry`, `atelier`, `pulse`, `terrain`, `studio`, `nocturne`, `signal` | inferred |
| layout | `workbench`, `focus`, `panorama` | per preset |
| density | `compact`, `comfortable`, `airy` | per preset |
| corners | `square`, `soft`, `round` | per preset |
| backdrop | `rings`, `grid`, `horizon`, `plain` | per preset |
| typography | `industrial`, `editorial`, `humanist`, `technical` | per preset |
| chrome | `technical`, `minimal` | per preset |
| pattern | `grid`, `dots`, `hatch`, `contour`, `none` | per preset |
| motif | `orbit`, `settings-2`, `focus`, `activity`, `sparkles`, `gauge`, `compass`, `audio-lines` | per preset |
| colors | object of CSS color strings | per preset |
| scene | object of numbers/hex colors | per preset |

Inference keywords, first match wins: camera/lens/optic → `atelier`; medical/clinical/wearable → `pulse`; outdoor/field/expedition/tactical → `terrain`; audio/speaker/furniture/lamp → `studio`; watch/luxury/jewel/perfume → `nocturne`; drone/sport/racing → `signal`; tool/robot/industrial → `foundry`; otherwise `aerolab`.

Common `design.colors` overrides:

```json
{
  "accent": "#2d5c50",
  "alt": "#a3633e",
  "bg": "#f3efe7",
  "panel": "#fbf8f2",
  "text": "#202622"
}
```

`design.motif` selects the stage emblem icon from the bundled Lucide sprite: `orbit`, `settings-2`, `focus`, `activity`, `sparkles`, `gauge`, `compass`, or `audio-lines`. `design.pattern` selects the stage pattern: `grid`, `dots`, `hatch`, `contour`, or `none`. The theme supplies both by default; override only when the product calls for a different motif.

The full token set covers `bg`, `bgDeep`, `bodyGlow`, `panel`, `panel2`, `line`, `lineStrong`, `text`, `muted`, `dim`, `accent`, `accentDeep`, `accentSoft`, `accentInk`, `accentLine`, `accentWash`, `alt`, `altSoft`, `green`, `stageBg`, `stageVignette`, `gridLine`, `gridOpacity`, `corner`, `chrome`, `rail`, `dock`, `pinBg`, `pinActiveBg`, `pinLine`, `labelBg`, `rowHover`, `rowActive`, `activeBg`, `activeInk`, `track`, `thumb`, `thumbRing`, `copy`, `copyStrong`, `chipBg`, `indexInk`, `shadow`, `scan`. Missing `accentSoft`/`accentLine`/`accentWash` are derived from a custom hex `accent`; missing `altSoft` is derived from `alt`.

`design.scene` overrides the 3D presentation: `background`, `fog`, `floor`, `dust`, `exposure`, `hemiSky`, `hemiGround`, `hemiIntensity`, `ambient`, `ambientIntensity`, `key`, `keyIntensity`, `rim`, `rimIntensity`, `fill`, `fillIntensity`, `top`, `topIntensity`, `bodyRoughness`, `bodyMetalness`, `ringOpacity`, `ring2Opacity`, `scanOpacity`. Use the optional body material values for dark products whose broad flat surfaces would otherwise reflect a white key light. Use neutral key/ambient lights for dark products and keep strongly colored lights low; otherwise dark PBR surfaces take on the accent hue.

### palette

Optional numeric colors (Three.js hex integers, not CSS strings):

```json
"palette": {
  "body": 3621451,
  "bodyLight": 7438475,
  "dark": 1382943,
  "accent": 16739116,
  "cyan": 5822719
}
```

Only `body`, `bodyLight`, `dark`, `accent`, and `cyan` are read. Other materials use fixed engine values.

### research

Required for a recognizable product; validator warns if absent and requires source metadata for non-concept modes. This block is provenance only — the page never fetches these URLs.

```json
"research": {
  "mode": "similar-product",
  "confidence": "medium",
  "sources": [
    {
      "title": "Mirrorless camera — Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Mirrorless_camera",
      "usedFor": "body/lens proportion, EVF and grip placement"
    }
  ],
  "assumptions": [
    "Original concept recreation; no logos or proprietary CAD copied."
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| mode | yes | `public-reference`, `similar-product`, or `concept` |
| confidence | no | `high`, `medium`, or `low` |
| sources | for non-concept | at least one `{ title, url, usedFor }`; URL must be http(s) |
| assumptions | concept | non-empty array of assumptions when `mode` is `concept` |

`public-reference` = same product or documented variant. `similar-product` = category analogue used for proportion/stack research. `concept` = no usable public geometry reference. See `references/research.md`.

### assembly

Required by the scaffold and audit. The checker tests the assembled state (0% explode) with oriented bounding boxes.

```json
"assembly": {
  "tolerance": 0.004,
  "internal": ["02", "05"],
  "mates": [
    { "modules": ["01", "03"], "reason": "lens mount seats through the front shell" }
  ],
  "review": {
    "status": "passed",
    "reviewedAt": "2026-11-11",
    "notes": "0/50/100 inspected; front/side/top close-ups checked."
  }
}
```

| Field | Required | Notes |
|---|---|---|
| tolerance | no | 0–0.1 model units; default 0.004 |
| internal | no | module IDs that are genuinely enclosed; their overlaps are reported as internal for visual review, not counted as unapproved |
| mates | no | `{ modules: [idA, idB], reason }`; only real structural interfaces |
| review | yes | `{ status, reviewedAt, notes }`; status `pending` or `passed` |
| review.reviewedAt | when passed | ISO date string |
| review.notes | recommended | what was inspected |

Rules:

- `internal` must not hide a visible part. Use it for sensor/board/battery modules fully inside a sealed body, not for a lens barrel or motor pod. Internal overlaps still appear in the checker report and must be confirmed in the visual review.
- `mates` must name the actual contact surface and reason. Do not list every module.
- Overlap within one module is allowed; cross-module contact must be surface-only.
- Run `scripts/check-assembly.mjs` and resolve every unapproved pair before setting `review.status` to `passed`.
- The checker is an OBB approximation (4 mm default tolerance), not a CAD kernel. Inspect 0%, 50%, and 100% in the browser. See `references/self-review.md`.

### modules

Each module is one selectable unit. Recommended count: 8–12; validator accepts 2–20.

```json
{
  "id": "01",
  "code": "FRAME",
  "title": "镁合金机身框架",
  "en": "MAGNESIUM BODY FRAME",
  "category": "STRUCTURE",
  "mass": 228,
  "base": [0, 0, 0],
  "offset": [-1.55, 0.1, -0.52],
  "anchor": [0, 0.42, -0.18],
  "description": "...",
  "specs": [["材质", "AZ91D"], ["尺寸", "150.7 × 103.5 mm"]],
  "components": ["前壳", "卡口环", "散热接口"],
  "insight": "...",
  "parts": []
}
```

| Field | Required | Notes |
|---|---|---|
| id | yes | unique; strings such as `"01"` preserve leading zeros |
| code | no | inspector eyebrow and module-list english fallback |
| title | yes | Chinese module name |
| en | no | english subtitle |
| category | no | used in inspector and mass footer |
| mass | yes | grams; > 0 |
| base | no | `[x,y,z]` module origin; default origin |
| offset | no | `[x,y,z]` explode displacement at 100%; default zero |
| anchor | no | `[x,y,z]` pin position in module-local space; default `[0,0,0]` |
| description | no | inspector paragraph |
| specs | no | array of `[label, value]` pairs, up to 8 shown |
| components | no | array of chip strings, up to 8 shown |
| insight | no | engineering note |
| parts | yes | non-empty array of part objects |

The `base` and `offset` values are in the same world units as part positions. Keep a consistent unit; the examples use roughly **1 unit = 1 metre**, so a 150 mm camera body is about 1.5 units long.

For a good exploded view:

- Put the main body at the origin and the visually largest module near the centre.
- Explode along the natural disassembly direction: lens forward (+Z), top cover up (+Y), side panels sideways (±X).
- Separate small internal modules by at least 0.25–0.4 units so they remain distinct at 1600×1000.
- Keep the overall exploded bounds within roughly 4–6× the assembled width; the auto-fit will otherwise pull too far back.
- Use `anchor` near the module's visual centre, not its origin, so pins sit on the part.

## Part objects

A part is one primitive mesh. All positions are module-local.

```json
{
  "type": "box",
  "size": [1.5, 0.8, 0.56],
  "pos": [0, 0, 0],
  "rot": [0, 0, 0],
  "mat": "silver",
  "axis": "z",
  "shadow": true
}
```

Common fields:

| Field | Notes |
|---|---|
| type | `box` (default), `cylinder`, `cone`, `sphere`, `torus`, `ring`, `plane`, `tube` |
| pos | `[x,y,z]`, default `[0,0,0]` |
| rot | Euler `[x,y,z]` radians |
| scale | `[x,y,z]`, applied after geometry creation |
| mat | material key; unknown keys fall back to `body` |
| axis | `"z"` turns a Y-aligned primitive onto Z; `"x"` turns it onto X |
| shadow | boolean; default true for cast and receive |

### Geometry fields

| Type | Fields |
|---|---|
| box | `size: [x,y,z]` (default `[0.4,0.4,0.4]`) |
| cylinder | `radius` or `radiusTop`/`radiusBottom`, `height`, `segments` |
| cone | `radius`, `height`, `segments` |
| sphere | `radius`; use `scale` for ellipsoids |
| torus | `radius`, `tube`, `radialSegments`, `tubularSegments` |
| ring | `outer`, `inner`; flat annulus, no thickness |
| plane | `width`, `height`; visible from the front side |
| tube | `points: [[x,y,z], ...]`, `radius`, `radialSegments`, `tubularSegments` |

Segments are clamped to 8–64. High segment counts on many parts are the easiest way to waste memory; 24–32 is enough for most cylinders and tori.

### Boxes are sharp

`box` does not support a bevel radius. For a rounded shell, either:

- combine a box with cylinders/tori to suggest rounded corners;
- approximate with a cylinder or a low-poly sphere;
- add a custom builder for a true rounded extrusion.

### Materials

`body`, `bodyLight`, `dark`, `black`, `prop`, `silver`, `steel`, `rubber`, `copper`, `pcb`, `pcbLight`, `chip`, `glass`, `sensor`, `accent`, `cyan`, `white`, `floor`.

`glass` is transparent and depth-write disabled; use it for lens elements and displays, not for large enclosure panels that should occlude internals.

### Repeated details

The engine creates a new geometry per part. For visible screw heads, rings, keys, and ports, keep 6–12 repetitions per module. If a module needs hundreds of identical details, add a custom builder with `InstancedMesh` rather than hundreds of spec parts.

## Example files

- `examples/camera/scene.json` — 10 modules, 78 parts, 1,502 g. Full-frame camera with body, sensor/IBIS, shutter, EVF, mainboard, battery, grip, thermal, optics, barrel. `design.preset: "atelier"`; preview in the same folder.
- `examples/x450/scene.json` — 10 modules, 80 parts, 1,072 g. Quadrotor frame, four propulsion units, avionics, GNSS, gimbal, battery, gear. `design.preset: "signal"`; preview and exploded preview in the same folder.

Both are validated and scaffolded by `scripts/scaffold.mjs`; use them as the starting point for a new archetype, replacing geometry rather than inventing a new engine.

## Validation rules

`scripts/validate-spec.mjs` enforces:

- product name and positive total mass;
- unique module IDs;
- 2–20 modules;
- positive module masses and a mass sum within 0.5 g of `product.totalMass`;
- non-empty parts;
- known part types;
- `base`, `offset`, `anchor`, `pos`, `rot`, `scale` as 3-number arrays when present;
- positive box size; positive cylinder/cone radius; torus radius/tube; `outer > inner` for rings; at least two tube points;
- `design.preset` and all design enums, design color strings with no remote URLs, design scene values as numbers or colors, and a design copy object if present;
- `research.mode`/`confidence`, source `{title,url,usedFor}` records, and concept assumptions;
- `assembly.tolerance`, `internal` IDs, `mates` module pairs/reasons, and `review.status`/`reviewedAt`;
- warns when `research` is absent or a material is unknown; module count is advisory.

Always run the structural checks before scaffolding:

```powershell
node scripts/validate-spec.mjs examples/camera/scene.json
node scripts/check-assembly.mjs examples/camera/scene.json
```

Expected:

```text
OK    scene.json  |  10 modules  |  78 parts  |  1502 g
PASS  assembly  |  0 unapproved  |  review passed
```

`check-assembly.mjs` must pass before `review.status` is set to `passed`; the scaffold and audit refuse a pending review or unresolved collision. It is a conservative OBB checker, not a CAD kernel — inspect 0%, 50%, and 100% views as described in `references/self-review.md`.