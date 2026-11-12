# Changelog

## 1.2.0 — 2026-11-12

Product-specific construction grammar and a third product archetype.

- Added declarative `identity`: archetype, stage, construction order, camera views, stagger, connectors, and localized explode/assemble actions.
- Added seven generative stage skins: aperture, rotor, waveform, turntable, cell, scan, grid.
- Added `atlas` layout: stage + horizontal module filmstrip + inspector.
- Added exploded-path connectors from each module's assembled origin to its current position.
- Added per-construction stagger ordering and cap (0.58 s).
- Added the AEROLAB S1 studio-monitor example (8 modules / 48 parts / 6,930 g), using audio/waveform/layered/atlas.
- Added `references/design-rationale.md` documenting GitHub references, adopted/rejected patterns, and fusion decisions.
- Audit now checks dynamic views, stage hooks, and connectors; scaffold README reports identity/stage.
- Fixed desktop shell row sizing (`--top`, `--bottom`), audio `monitor` inference collision, and 8-module reference warning.

## 1.1.0 — 2026-11-11

Portable open-source release.

- Removed hardcoded Windows paths; output directory is supplied by the caller.
- Added bilingual display metadata, license notices, and the design-rationale workflow.
- Preserved the all-in-one `standalone.html` build and collision/research gates.

## 1.0.0 — 2026-11-11

Initial release.

- Spec-driven Three.js exploded-view pages with eight themes, local fonts/icons, selection, pins, inspector, explode/solo/views, mobile pins/pinch/zoom, and offline standalone builds.
- 4 mm OBB/SAT assembly checker with internal modules, structural mates, and mandatory review.
- Public-reference `research` block, collision self-review, and automated audit.