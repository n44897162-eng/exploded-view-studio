# Assembly self-review

Every generated product must pass this review before `assembly.review.status` is set to `passed`. The checker is a fast, conservative OBB approximation; it is not a CAD kernel and does not replace looking at the assembled model.

## The rule

- Overlap **inside one module** is fine; layers of a lens, a PCB stack, or an internal housing can share space.
- Contact **between modules** must be surface-only at the intended interface.
- A visible part poking through another module is a defect, even if a mate could whitelist it.
- A hidden internal module may intersect the shell it lives inside, but only if it is genuinely enclosed. Declare it in `assembly.internal` and say why. Those overlaps are still printed in the report and must be confirmed in the visual review; they are not silently discarded.
- Never whitelist every module, and never use a mate to hide a silhouette defect.

## 1. Run the structural checks

From the skill root:

```powershell
node scripts/validate-spec.mjs path\to\scene.json
node scripts/check-assembly.mjs path\to\scene.json
```

The checker reports:

- solid part count and tested part count;
- intersecting pairs;
- nested pairs (fully inside another solid, ignored);
- declared mates (approved pairs);
- unapproved pairs with module IDs, part indices, types, materials, and approximate depth.

Exit code is non-zero unless both conditions hold:

```text
review.status === "passed"
unapproved.length === 0
```

Read the actual pairs. Do not skip to the status field.

## 2. Resolve every pair

For each `unapproved` pair, choose exactly one:

1. **Move it** — adjust `part.pos` or `module.base` so the parts stop overlapping.
2. **Resize it** — reduce a shell/plate/ring until the join is surface contact.
3. **Trim it** — remove a hidden duplicate that was only there for visual density.
4. **Declare a real mate** — if this is an intentional structural join, add `assembly.mates` with a specific reason. The reason must name the interface, not “assembly tolerance”.
5. **Declare a real internal module** — only if the module is genuinely enclosed and not visible through an opening. Add its ID to `assembly.internal`.

If the pair is a visible poke-through, fix the geometry. A mate is not a fix.

## 3. Visual review at three states

Open `index.html` or `standalone.html` and inspect the **assembled**, **50% exploded**, and **100% exploded** states. At each state:

- front, rear, left, right, top, and a low three-quarter view;
- one close-up per external interface (lens mount, grip, motor pod, hinge, port, battery door);
- check that no shell, ring, board, or fastener passes through a neighboring module;
- check that the floor follows the lowest module and does not cut through it.

At 100%, separation makes hidden overlaps visible. At 0%, real assembly interfaces are easiest to judge.

Useful browser checks:

```js
window.__STUDIO__.setExplodeTarget(0);   // assembled
window.__STUDIO__.setExplodeTarget(0.5); // half exploded
window.__STUDIO__.setExplodeTarget(1);   // fully exploded
```

Take screenshots and keep them with the project QA notes. Do not set `passed` from a single hero shot.

## 4. Check the interfaces list

For each declared mate, confirm:

- both modules are correct;
- the contact is at the intended surface;
- the reason names the physical interface;
- the pair does not visually clip from another angle.

For each internal module, confirm:

- it is not visible through a window, gap, or transparent panel;
- it does not protrude through the shell;
- it is not used to hide a visible module.

## 5. Record the review

Only after steps 1–4:

```json
"assembly": {
  "review": {
    "status": "passed",
    "reviewedAt": "YYYY-MM-DD",
    "notes": "0/50/100 inspected front, side, top, and close-ups; all interfaces listed."
  }
}
```

Then rerun:

```bash
node scripts/check-assembly.mjs path/to/scene.json
node scripts/scaffold.mjs path/to/scene.json ../project
node scripts/audit.mjs ../project
```

The scaffold refuses a pending review or unresolved collisions. The audit repeats the collision gate so a stale `passed` flag cannot slip through.

## 6. Negative test before trusting the gate

When changing the checker, prove it fails:

1. Make a temporary spec with two overlapping external boxes and `review.status: "pending"`.
2. Run the CLI and confirm exit code 1 with one `unapproved` pair.
3. Mark one module internal; confirm the pair is suppressed (and that this would be legitimate only if hidden).
4. Add a mate with a real interface; confirm `approved`.
5. Set review to passed; confirm PASS.
6. Delete the temporary spec.

A gate that cannot fail is not a gate.