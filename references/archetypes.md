# Composition archetypes

The engine is generic; quality comes from the part composition and the exploded layout. These patterns are starting points, not rigid rules.

## Full-frame camera

Reference: `examples/camera/scene.json`; previews in `examples/camera/`.

**Silhouette.** A wide magnesium box with a protruding lens barrel on +Z, a grip on +X, an EVF hump on top, and a rear LCD. The eye reads “camera” from the lens circle, viewfinder hump, and grip long before it reads individual details.

**Proportions.** Keep the body about 1.5 × 1.0 × 0.6 units and the lens 0.45–0.5 in radius. The lens should dominate the front view. If the body is wider than 1.8 or the lens is under 0.35, it can read as a compact camera or a box.

**Module split.**

| Module | Visual responsibility |
|---|---|
| frame | shell, front ring, top plate, grip mount, seams |
| sensor / IBIS | dark sensor plate, gold/copper carriage, coil details |
| shutter / mount | silver mount ring, black shutter box, contacts |
| EVF / top cover | hump, hot shoe, eye cup, top dials, OLED |
| mainboard | green PCB, chips, connectors, heat spreader |
| battery | dark block, label, terminals, side rails |
| grip / controls | black textured grip, dials, ports, cards |
| thermal | copper pipes, perforated shield, mic holes |
| optics | glass element stack, aperture blades, inner barrel |
| barrel | knurled rings, focus/zoom bands, nameplate, hood |

**Exploded layout.** Lens parts forward (+Z), EVF up (+Y), body shell left (−X), mainboard back (−Z), grip right (+X), battery/service parts down (−Y). Avoid exploding sensor and shutter through the body in the same direction; separate them vertically and slightly forward.

**Materials.** Magnesium `silver`/`body` for the shell, `black` for the grip and lens barrel, `glass` for elements, `copper` for IBIS and heat pipes, `pcb`/`chip` for electronics, `accent` for mount and control rings.

**Common defects.** A vertical top plate (rotate the box), a lens that is too short, a grip that is wider than the body, glass that reads as an opaque black disc, and modules that overlap at the front three-quarter view.

## Quadrotor

Reference: `examples/x450/scene.json`; previews in `examples/x450/`.

**Silhouette.** X arms, four motor bells, four propellers, a central body, a GPS puck on a mast, a gimbal under the nose, and landing skids. The X and the four rotor discs carry recognition.

**Module split.** Frame; four independent propulsion units; avionics stack; GNSS/compass; gimbal camera; battery; landing gear. Keep each motor+ESC+prop as one module because that is how a user reasons about a quad.

**Exploded layout.** Motors outward on diagonals and up; props above motors; frame near the centre; avionics above; GNSS highest; gimbal and battery below; gear at the bottom. Alternate left/right offsets so the four propulsion units do not form a single line.

**Materials.** `carbon` is not in the palette; use `dark`/`black` with `accent` arm stripes. `silver` for motor bells, `prop` for dark rotor blades, `copper` for windings, `pcb` for ESCs, `glass` for the lens, `cyan`/`accent` for LEDs. Under a dark performance theme, keep the key light neutral and let lime/pink live in the UI and a low edge light; colored key lights turn dark prop blades muddy.

**Common defects.** Arms hidden under a oversized top plate, propellers intersecting the frame, a GPS mast inside the canopy, and landing gear invisible from a high three-quarter angle. Lower the camera or lengthen the gear.

## Two-way studio monitor

Reference: `examples/audio/scene.json`; previews in `examples/audio/`.

**Silhouette.** A tall, shallow cabinet with a large woofer low and a tweeter/waveguide high on the front baffle, plus a rear port. Recognition comes from the two driver circles, the cabinet proportions, and the front/rear orientation.

**Module split.** Cabinet; woofer; tweeter; waveguide; crossover; amplifier/heatsink; damping; port/terminals. Keep the drivers separate because users reason about them as replaceable acoustic assemblies.

**Exploded layout.** Layer front-to-back: grille/terminal/port rearward, waveguide and tweeter forward, woofer further forward, crossover and damping inside, amplifier out the back. Keep the cabinet stable as the visual anchor.

**Materials.** Warm veneer/body tones, `black` for driver cones and rubber surrounds, `silver` for baskets, `copper` for voice-coil and terminal details, `pcb`/`chip` for the crossover, `accent` for a thin surround ring. The `waveform` stage should stay behind the cabinet, never on top of the drivers.

**Common defects.** A floating damping slab, a port intersecting the woofer, an oversized grille, and a speaker that reads as a generic box because the drivers are too small or too flat.

**Layout.** Use `atlas`: a bottom 4×2 filmstrip mirrors a listening-room rack and keeps the frontal cabinet large. Use `focus` only for a single-driver macro study.

## Generic product

When no archetype fits, use this sequence:

1. **Choose the primary read.** What three shapes make the object recognizable at 100 px? Build those first.
2. **Choose 8–10 service modules.** A module should map to a real user-replaceable or user-understandable assembly: shell, core, power, control, sensor, interface, cooling, mount, accessory.
3. **Draw the assembly axis.** Identify the direction each module leaves the product. Most products explode along one of three axes plus a diagonal fan.
4. **Build the exterior first**, then internal electronics as flat boards and cylinders. A strong outer silhouette with clean seams beats detailed internals behind an unreadable shell.
5. **Use materials for hierarchy.** One body tone, one darker structural tone, one metal, one accent, one PCB green. More than five base materials becomes noise.
6. **Place accents where the eye lands.** A single orange ring around a lens or a cyan light strip is enough.

## Choosing masses

Use plausible masses that sum to the displayed total. If exact engineering data is unavailable:

- structural shell: 15–25% of total;
- power source: 15–30%;
- optics/lens or main actuator: 25–40%;
- electronics and control: 8–18%;
- interface, cooling, fasteners: 5–12%.

Round to whole grams. Never let the sum drift from `totalMass`; the inspector and summary show both values.

## Naming

Use a neutral fictional brand and model. Avoid real trademarks, logos, and copied industrial designs. Say “concept” or “stylized technical study” in the README; the mass and dimensions are narrative values, not CAD measurements.

## Camera view

For most products, start with `theta ≈ 0.7–0.9`, `phi ≈ 1.0–1.2`, and `fitPadding ≈ 1.10–1.16`. A camera or lens benefits from a slightly lower `phi` (more front-on); a quadrotor benefits from a slightly higher camera (more top-down) so the X frame reads. Confirm at both 1600×1000 and 1366×768 before finalizing.

## Construction grammar by archetype

| Archetype | Stage | Construction | Views | Layout | Why |
|---|---|---|---|---|---|
| camera | aperture | optical | MACRO/TOP/FRONT | focus | the lens is the subject; the optical axis is the story |
| quadrotor | rotor | radial | FLIGHT/TOP/NOSE | panorama | the X silhouette and four rotor discs need width |
| audio | waveform | layered | DETAIL/TOP/REAR | atlas | a frontal cabinet benefits from a bottom rack strip |
| watch | turntable | circular | DETAIL/TOP/SIDE | focus | the case is concentric; a turntable reads as craft |
| robot | cell | kinematic | HERO/TOP/DETAIL | workbench | joints read as a chain; a cell invokes a work envelope |
| medical | scan | scan | SCAN/TOP/DETAIL | panorama | scan geometry and clinical spacing |
| generic | grid | linear | ISO/TOP/FRONT | workbench | neutral technical baseline |

These are defaults, not laws. A field camera can use `terrain`; a rugged drone can use `terrain` or `signal`. Choose the **construction** first, then the palette.

## Art direction by archetype

Use the archetype as the first guess, then check the product’s actual story. A rugged field camera may want `signal`, not `atelier`; a medical drone may want `pulse`, not `signal`.

| Product character | Start with | Why |
|---|---|---|
| precision camera, lens, optical instrument | `atelier` | light editorial, generous focus layout, serif display |
| drone, sports instrument, racing hardware | `signal` | dark performance, panorama, technical type, lime/pink |
| medical, clinical, wearable, monitoring | `pulse` | white/teal, humanist type, calm spacing |
| outdoor, field, expedition, tactical gear | `terrain` | light trail palette, contour pattern, humanist type |
| audio, speaker, furniture, lighting | `studio` | warm light, plain stage, editorial type |
| watch, jewelry, perfume, luxury object | `nocturne` | dark warm, plain stage, editorial type |
| tool, robot, industrial machine | `foundry` | warm light, grid, compact workbench |
| unknown / neutral R&D product | `aerolab` | dark aerospace baseline |

If the product is recognizable but the inferred theme feels wrong, override only `design.preset` first. Add explicit layout or density only when the preset’s proportions do not fit the module count or silhouette. Always view the result in a real browser; a theme that reads well in a palette swatch can flatten a dark product in 3D.

## Research and interface cues

Use public references for proportions and stack order, not for copied geometry. Record them in `research`; keep the runtime model procedural.

| Archetype | Useful public material | Interfaces to inspect |
|---|---|---|
| camera | official body/lens specs, mount diagrams, teardown photos | lens mount, EVF base, grip seam, battery door, card door |
| quadrotor | frame/arm dimensions, motor drawings, flight-controller stack, gimbal mounts | arm-to-frame clamps, motor pod, prop clearance, gimbal isolators, battery strap |
| audio / speaker | cabinet dimensions, driver cut-outs, grille/port photos | driver bezel, grille clearance, terminal plate, foot/stand |
| watch / wearable | case diameter/lug width, movement dimensions, strap photos | caseback, crown/stem, bezel, lug/strap |
| robot / tool | official envelope, joint/actuator drawings, repair photos | joint housing, tool mount, cable pass-through, guard |
| generic hard product | category leader specs, patent drawings, repair guides | shell seam, fastener bosses, connector openings, stand/mount |

For a close analogue, mark `mode:"similar-product"` and state which cues were borrowed. For a measured reconstruction, `mode:"public-reference"` with source-specific `usedFor`. For an invented object, `mode:"concept"` and list assumptions.

Each archetype's usual **mates** are structural interfaces, not a way to excuse a poke-through:

- camera: lens mount to shell, EVF base to top plate, grip to frame, battery inside grip.
- quadrotor: motor pod to arm, GNSS mast to top plate, gimbal plate to underside, battery inside tray.
- audio: driver to baffle, baffle to cabinet, terminal plate to rear shell.
- watch: caseback to case, bezel to case, crown/stem to movement holder.

If two visible shells overlap, fix the geometry; do not add them as mates.