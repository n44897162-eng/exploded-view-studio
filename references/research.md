# Research before modeling

The goal is not to copy a product. The goal is to get the **proportions, module hierarchy, and construction cues** right, then rebuild a clean procedural interpretation with original geometry.

## When to research

Research whenever the product is recognizable or the user names a real product family: camera, drone, watch, phone, robot, appliance, tool, vehicle, audio device.

If the product is fictional, or no credible public material exists, use `mode: "concept"` and say so in the README. Do not invent a source.

## Good sources

Prefer, in roughly this order:

1. Official product page and specification sheet.
2. Official user manual, service manual, or repair guide.
3. Dimensioned line drawings, patent drawings, or a trusted technical teardown.
4. High-resolution press images and multiple-angle product photos.
5. A similar product from the same category with credible dimensions.
6. A public open-source CAD/3D model, used only for proportion/stack study — never copied into the deliverable.

Two independent sources are better than one. For a concept product, one category reference plus a clearly stated assumption set is enough.

## What to extract

Record only what affects the model:

- overall envelope and principal proportions;
- module boundaries and stack order;
- which parts are visible from the outside;
- connector/mount positions;
- material and finish cues;
- exploded direction per module;
- approximate mass split, if published.

Do not extract logos, proprietary textures, unique trade dress, or CAD meshes.

## Spec block

```json
"research": {
  "mode": "similar-product",
  "confidence": "medium",
  "sources": [
    {
      "title": "Mirrorless camera — Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Mirrorless_camera",
      "usedFor": "category proportions, lens/body relationship"
    },
    {
      "title": "Sony Alpha 7 IV specifications",
      "url": "https://en.wikipedia.org/wiki/Sony_Alpha_7_IV",
      "usedFor": "body envelope, EVF/grip placement"
    }
  ],
  "assumptions": [
    "Original AEROLAB concept; no logos or proprietary CAD copied.",
    "Mass split is narrative, not measured."
  ]
}
```

| Field | Values / rules |
|---|---|
| mode | `public-reference`, `similar-product`, `concept` |
| confidence | `high`, `medium`, `low` |
| sources | non-empty for public-reference/similar-product; each needs `title`, `url`, `usedFor` |
| assumptions | required for concept mode; recommended otherwise |

`public-reference` means the same product or a directly documented variant. `similar-product` means a category analogue used for proportions and stack. `concept` means no usable public geometry reference.

## Translation rules

- **Reference facts** → dimensions, module count, stack order, connector locations.
- **Original interpretation** → all meshes, materials, labels, colors, and the brand.
- **Do not** download a GLB/OBJ/STL at runtime or bundle it as the product. The page must remain procedural and offline.
- **Do not** put a remote image URL in the page. If an image is useful for your own study, describe its evidence in `usedFor`; do not ship it unless its license explicitly allows it.

## Before writing geometry

Write down:

1. three silhouette shapes that make the product recognizable;
2. the 8–12 modules and their approximate envelopes;
3. the assembly axis for each module;
4. two or three visible construction details worth modeling;
5. what is still unknown and therefore conceptual.

Then build the silhouette before adding small details.

## Honesty

A polished page can make invented numbers look authoritative. Always state:

- the product is a concept/stylized study unless it is a measured reconstruction;
- masses and dimensions are approximate;
- public references informed proportion and layout, not exact CAD;
- no affiliation with the referenced brand.

Put this in the project README and, when relevant, in the inspector copy.