#!/usr/bin/env node
/*
 * Static assembly reviewer.
 *
 * It builds an oriented bounding box (OBB) for every solid part in the scene
 * and checks cross-module intersections at the assembled (0%) state. Nested
 * internal parts are ignored: when one part is fully contained inside another,
 * it is hidden and cannot produce a visible clipping seam. Everything else is
 * reported unless the pair is declared in `assembly.mates` with a reason.
 *
 * This is a review tool, not a CAD kernel. It is deliberately conservative:
 * agents must look at the flagged parts and either fix the geometry or add an
 * explicit interface declaration. Do not blanket-whitelist modules.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EPS = 1e-9;
const DEFAULT_TOLERANCE = 0.004;
const SKIP_TYPES = new Set(['plane', 'tube']);

const v = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  scale: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  length: a => Math.hypot(a[0], a[1], a[2]),
  normalize: a => {
    const len = Math.hypot(a[0], a[1], a[2]);
    return len > EPS ? [a[0] / len, a[1] / len, a[2] / len] : [0, 0, 0];
  }
};

function eulerAxes(rot) {
  const [x, y, z] = rot || [0, 0, 0];
  const c1 = Math.cos(x), s1 = Math.sin(x);
  const c2 = Math.cos(y), s2 = Math.sin(y);
  const c3 = Math.cos(z), s3 = Math.sin(z);
  // Columns of a THREE.Euler XYZ rotation matrix.
  return [
    [c2 * c3, c1 * s3 + c3 * s1 * s2, s1 * s3 - c1 * c3 * s2],
    [-c2 * s3, c1 * c3 - s1 * s2 * s3, c3 * s1 + c1 * s2 * s3],
    [s2, -c3 * s1, c1 * c2]
  ];
}

function partHalfExtents(part) {
  const type = part.type || 'box';
  let half;
  if (type === 'box' || !type) {
    const size = Array.isArray(part.size) ? part.size : [0.4, 0.4, 0.4];
    half = [Number(size[0]) / 2, Number(size[1]) / 2, Number(size[2]) / 2];
  } else if (type === 'cylinder' || type === 'cone') {
    const radius = Math.max(Number(part.radius ?? part.radiusTop ?? 0.25), Number(part.radiusBottom ?? 0));
    half = [radius, Number(part.height ?? 0.6) / 2, radius];
  } else if (type === 'sphere') {
    const radius = Number(part.radius ?? 0.3);
    half = [radius, radius, radius];
  } else if (type === 'torus') {
    const radius = Number(part.radius ?? 0.35) + Number(part.tube ?? 0.04);
    half = [radius, radius, Number(part.tube ?? 0.04)];
  } else if (type === 'ring') {
    const radius = Number(part.outer ?? 0.36);
    half = [radius, radius, 0.003];
  } else {
    half = [0.25, 0.25, 0.25];
  }
  const scale = Array.isArray(part.scale) ? part.scale : [1, 1, 1];
  return half.map((n, i) => Math.max(0.0001, Math.abs(n * Number(scale[i] ?? 1))));
}

function baseAxes(part) {
  if (Array.isArray(part.rot)) return eulerAxes(part.rot);
  if (part.axis === 'z') return eulerAxes([Math.PI / 2, 0, 0]);
  if (part.axis === 'x') return eulerAxes([0, 0, Math.PI / 2]);
  return eulerAxes([0, 0, 0]);
}

function makeOBB(part, moduleBase) {
  const half = partHalfExtents(part);
  const axes = baseAxes(part);
  const localPos = Array.isArray(part.pos) ? part.pos.map(Number) : [0, 0, 0];
  const center = v.add(moduleBase, localPos);
  const corners = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    let point = center.slice();
    const s = [sx, sy, sz];
    for (let i = 0; i < 3; i += 1) {
      point = v.add(point, v.scale(axes[i], half[i] * s[i]));
    }
    corners.push(point);
  }
  return { center, half, axes, corners };
}

function projectedRadius(obb, axis) {
  return obb.half.reduce((sum, h, i) => sum + h * Math.abs(v.dot(axis, obb.axes[i])), 0);
}

function overlaps(a, b, tolerance) {
  const axes = [...a.axes, ...b.axes];
  for (const axisA of a.axes) for (const axisB of b.axes) {
    const cross = v.cross(axisA, axisB);
    if (v.length(cross) > 1e-6) axes.push(v.normalize(cross));
  }
  const delta = v.sub(b.center, a.center);
  let minDepth = Infinity;
  for (const raw of axes) {
    const axis = v.normalize(raw);
    if (!axis[0] && !axis[1] && !axis[2]) continue;
    const rA = projectedRadius(a, axis);
    const rB = projectedRadius(b, axis);
    const distance = Math.abs(v.dot(delta, axis));
    const depth = rA + rB - distance;
    if (depth <= tolerance) return { hit: false, depth: 0 };
    minDepth = Math.min(minDepth, depth);
  }
  return { hit: true, depth: minDepth === Infinity ? 0 : minDepth };
}

function contains(outer, inner, tolerance) {
  if (!inner || !outer) return false;
  const d = v.sub(inner.center, outer.center);
  for (let i = 0; i < 3; i += 1) {
    const local = [v.dot(d, outer.axes[0]), v.dot(d, outer.axes[1]), v.dot(d, outer.axes[2])];
    const reach = outer.half[i] - tolerance;
    const extent = inner.half.reduce((sum, h, j) => sum + h * Math.abs(v.dot(inner.axes[j], outer.axes[i])), 0);
    if (Math.abs(local[i]) + extent > reach) return false;
  }
  return true;
}

function aabb(obb) {
  const min = obb.center.map((c, i) => c - obb.half.reduce((sum, h, j) => sum + h * Math.abs(obb.axes[j][i]), 0));
  const max = obb.center.map((c, i) => c + obb.half.reduce((sum, h, j) => sum + h * Math.abs(obb.axes[j][i]), 0));
  return { min, max };
}

function aabbOverlapRatio(a, b) {
  const A = aabb(a), B = aabb(b);
  const size = (box) => Math.abs((box.max[0] - box.min[0]) * (box.max[1] - box.min[1]) * (box.max[2] - box.min[2]));
  const va = size(A), vb = size(B);
  const min = [Math.max(A.min[0], B.min[0]), Math.max(A.min[1], B.min[1]), Math.max(A.min[2], B.min[2])];
  const max = [Math.min(A.max[0], B.max[0]), Math.min(A.max[1], B.max[1]), Math.min(A.max[2], B.max[2])];
  const vi = Math.max(0, max[0] - min[0]) * Math.max(0, max[1] - min[1]) * Math.max(0, max[2] - min[2]);
  return vi / Math.max(Math.min(va, vb), EPS);
}

function pairKey(a, b) {
  return [String(a), String(b)].sort().join('|');
}

export function checkAssembly(spec, options = {}) {
  const tolerance = Number(options.tolerance ?? spec?.assembly?.tolerance ?? DEFAULT_TOLERANCE);
  const assembly = spec?.assembly && typeof spec.assembly === 'object' ? spec.assembly : {};
  const review = assembly.review && typeof assembly.review === 'object' ? assembly.review : {};
  const mates = new Map();
  for (const mate of Array.isArray(assembly.mates) ? assembly.mates : []) {
    if (!Array.isArray(mate?.modules) || mate.modules.length !== 2) continue;
    mates.set(pairKey(mate.modules[0], mate.modules[1]), String(mate.reason || 'declared interface'));
  }

  const modules = Array.isArray(spec?.modules) ? spec.modules : [];
  const parts = [];
  modules.forEach((module, moduleIndex) => {
    const base = (module.base || [0, 0, 0]).map(Number);
    const list = Array.isArray(module.parts) ? module.parts : [];
    list.forEach((part, partIndex) => {
      if (!part || part.collision === false || SKIP_TYPES.has(part.type)) return;
      const entry = {
        moduleId: String(module.id ?? moduleIndex),
        moduleIndex,
        partIndex,
        type: part.type || 'box',
        mat: part.mat || 'body',
        obb: makeOBB(part, base)
      };
      parts.push(entry);
    });
  });

  const internalIds = new Set((Array.isArray(assembly.internal) ? assembly.internal : []).map(String));
  const pairsChecked = [];
  const nested = [];
  const internalHits = [];
  const approved = [];
  const unapproved = [];
  for (let i = 0; i < parts.length; i += 1) {
    for (let j = i + 1; j < parts.length; j += 1) {
      const a = parts[i], b = parts[j];
      if (a.moduleId === b.moduleId) continue;
      const key = pairKey(a.moduleId, b.moduleId);
      const hit = overlaps(a.obb, b.obb, tolerance);
      if (!hit.hit) continue;
      const detail = {
        modules: [a.moduleId, b.moduleId],
        parts: [a.partIndex, b.partIndex],
        types: [a.type, b.type],
        materials: [a.mat, b.mat],
        depth: Number(hit.depth.toFixed(4)),
        ratio: Number(aabbOverlapRatio(a.obb, b.obb).toFixed(3))
      };
      pairsChecked.push(detail);
      if (internalIds.has(a.moduleId) || internalIds.has(b.moduleId)) {
        internalHits.push(detail);
      } else if (contains(a.obb, b.obb, tolerance) || contains(b.obb, a.obb, tolerance)) {
        nested.push(detail);
      } else if (mates.has(key)) {
        approved.push({ ...detail, reason: mates.get(key) });
      } else {
        unapproved.push(detail);
      }
    }
  }

  return {
    tolerance,
    modules: modules.length,
    parts: parts.length,
    pairCount: pairsChecked.length,
    nested: nested.length,
    internalModules: internalIds.size,
    internalModuleIds: [...internalIds],
    internalHits: internalHits.length,
    internalDetails: internalHits,
    approved: approved.length,
    unapproved,
    mates: [...mates.entries()].map(([key, reason]) => ({ pair: key.split('|'), reason })),
    review: {
      status: review.status || 'pending',
      notes: review.notes || '',
      reviewedAt: review.reviewedAt || ''
    },
    passed: unapproved.length === 0 && review.status === 'passed'
  };
}

export function formatReport(report) {
  const lines = [];
  const status = report.passed ? 'PASS' : report.unapproved.length ? 'FAIL' : 'REVIEW';
  lines.push(`${status}  assembly  |  ${report.modules} modules  |  ${report.parts} solid parts  |  tolerance ${report.tolerance}`);
  lines.push(`      intersections ${report.pairCount} | nested ${report.nested} | internal overlaps ${report.internalHits || 0} | declared interfaces ${report.approved} | unapproved ${report.unapproved.length}`);
  if (report.internalModules) {
    lines.push(`      internal modules declared: ${report.internalModuleIds.join(', ')} (overlaps listed below, not auto-passes)`);
  }
  if (report.review.status !== 'passed') {
    lines.push('      self-review status is not "passed" — inspect assembled views, fix collisions, then set assembly.review.status.');
  }
  for (const item of report.unapproved.slice(0, 24)) {
    lines.push(`  - modules ${item.modules.join(' / ')} | parts ${item.parts.join(' / ')} | ${item.types.join(' / ')} | depth ${item.depth} | overlap ${(item.ratio * 100).toFixed(0)}%`);
  }
  if (report.unapproved.length > 24) lines.push(`  ... ${report.unapproved.length - 24} more unapproved`);
  if (report.internalHits > 0) {
    for (const item of report.internalDetails.slice(0, 12)) {
      lines.push(`  ~ declared internal ${item.modules.join(' / ')} | parts ${item.parts.join(' / ')} | depth ${item.depth} | confirm hidden in visual review`);
    }
    if (report.internalHits > 12) lines.push(`  ... ${report.internalHits - 12} more internal overlaps`);
  }
  if (report.approved > 0) lines.push(`      ${report.approved} declared interfaces accepted: ${report.mates.map(m => m.pair.join('/')).join(', ')}`);
  return lines.join('\n');
}

const scriptPath = fileURLToPath(import.meta.url);
const isDirect = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(scriptPath);
if (isDirect) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/check-assembly.mjs <scene.json> [--json] [--report <file>]');
    process.exit(2);
  }
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  } catch (error) {
    console.error(`FAIL  cannot read JSON: ${error.message}`);
    process.exit(1);
  }
  const report = checkAssembly(spec);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReport(report));
  }
  const reportIndex = process.argv.indexOf('--report');
  if (reportIndex !== -1 && process.argv[reportIndex + 1]) {
    fs.writeFileSync(path.resolve(process.argv[reportIndex + 1]), JSON.stringify(report, null, 2));
  }
  process.exit(report.passed ? 0 : 1);
}