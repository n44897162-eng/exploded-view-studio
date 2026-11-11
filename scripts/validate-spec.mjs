#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PART_TYPES = new Set(['box', 'cylinder', 'cone', 'sphere', 'torus', 'ring', 'plane', 'tube']);
const MATERIALS = new Set(['body', 'bodyLight', 'dark', 'black', 'prop', 'silver', 'steel', 'rubber', 'copper', 'pcb', 'pcbLight', 'chip', 'glass', 'sensor', 'accent', 'cyan', 'white', 'floor']);
const DESIGN_PRESETS = new Set(['auto', 'aerolab', 'foundry', 'atelier', 'pulse', 'nocturne', 'signal', 'terrain', 'studio']);
const DESIGN_ENUMS = {
  mode: new Set(['dark', 'light']),
  layout: new Set(['workbench', 'focus', 'panorama']),
  density: new Set(['compact', 'comfortable', 'airy']),
  corners: new Set(['square', 'soft', 'round']),
  backdrop: new Set(['rings', 'grid', 'horizon', 'plain']),
  typography: new Set(['industrial', 'editorial', 'humanist', 'technical']),
  chrome: new Set(['technical', 'minimal']),
  motif: new Set(['orbit', 'settings-2', 'focus', 'activity', 'sparkles', 'gauge', 'compass', 'audio-lines']),
  pattern: new Set(['grid', 'dots', 'hatch', 'contour', 'none'])
};
const RESEARCH_MODES = new Set(['public-reference', 'similar-product', 'concept']);
const REVIEW_STATES = new Set(['pending', 'passed']);

export function validateSpec(spec, label = 'spec') {
  const errors = [];
  const warnings = [];
  const fail = message => errors.push(message);
  const isVec3 = value => Array.isArray(value) && value.length === 3 && value.every(n => Number.isFinite(Number(n)));
  if (!spec || typeof spec !== 'object') return { errors: ['document is not an object'], warnings, modules: 0, parts: 0, mass: 0 };
  const product = spec.product || {};
  if (!product.name) fail('product.name is required');
  if (!Number.isFinite(Number(product.totalMass)) || Number(product.totalMass) <= 0) fail('product.totalMass must be a positive number');
  if (!Array.isArray(spec.modules)) fail('modules must be an array');
  if (!Array.isArray(spec.modules) || spec.modules.length < 2) fail('at least two modules are required');
  if (Array.isArray(spec.modules) && spec.modules.length > 20) fail('module count above 20 is not supported by the template');

  if (spec.design !== undefined) {
    const design = spec.design;
    if (!design || typeof design !== 'object' || Array.isArray(design)) fail('design must be an object');
    else {
      if (design.preset !== undefined && !DESIGN_PRESETS.has(design.preset)) {
        fail(`design.preset "${design.preset}" is not one of: ${[...DESIGN_PRESETS].join(', ')}`);
      }
      for (const [field, allowed] of Object.entries(DESIGN_ENUMS)) {
        if (design[field] !== undefined && !allowed.has(design[field])) {
          fail(`design.${field} must be one of: ${[...allowed].join(', ')}`);
        }
      }
      if (design.colors !== undefined) {
        if (!design.colors || typeof design.colors !== 'object' || Array.isArray(design.colors)) fail('design.colors must be an object');
        else {
          for (const [key, value] of Object.entries(design.colors)) {
            if (typeof value !== 'string' || !value.trim()) fail(`design.colors.${key} must be a non-empty CSS token`);
            else if (/url\s*\(|@import|javascript:/i.test(value)) fail(`design.colors.${key} must not contain remote or script URLs`);
          }
        }
      }
      if (design.scene !== undefined) {
        if (!design.scene || typeof design.scene !== 'object' || Array.isArray(design.scene)) fail('design.scene must be an object');
        else {
          for (const [key, value] of Object.entries(design.scene)) {
            if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) fail(`design.scene.${key} must be a number or CSS/hex color`);
            else if (typeof value === 'string' && /url\s*\(|@import|javascript:/i.test(value)) fail(`design.scene.${key} must not contain remote or script URLs`);
          }
        }
      }
      if (design.copy !== undefined && (!design.copy || typeof design.copy !== 'object' || Array.isArray(design.copy))) {
        fail('design.copy must be an object');
      }
    }
  }

  if (spec.research !== undefined) {
    const research = spec.research;
    if (!research || typeof research !== 'object' || Array.isArray(research)) fail('research must be an object');
    else {
      if (!RESEARCH_MODES.has(research.mode)) {
        fail(`research.mode must be one of: ${[...RESEARCH_MODES].join(', ')}`);
      }
      if (research.confidence !== undefined && !['high', 'medium', 'low'].includes(research.confidence)) {
        fail('research.confidence must be high, medium or low');
      }
      const sources = Array.isArray(research.sources) ? research.sources : [];
      if (research.mode !== 'concept' && sources.length === 0) {
        fail('research.sources needs at least one public source when mode is public-reference or similar-product');
      }
      sources.forEach((source, index) => {
        const where = `research.sources[${index}]`;
        if (!source || typeof source !== 'object' || Array.isArray(source)) {
          fail(`${where} must be an object`);
          return;
        }
        if (!source.title || typeof source.title !== 'string') fail(`${where}.title is required`);
        if (!source.usedFor || typeof source.usedFor !== 'string') fail(`${where}.usedFor is required`);
        if (!/^https?:\/\/[^\s]+$/i.test(String(source.url || ''))) {
          fail(`${where}.url must be an http(s) URL`);
        }
      });
      if (research.assumptions !== undefined && (!Array.isArray(research.assumptions) || research.assumptions.some(item => typeof item !== 'string' || !item.trim()))) {
        fail('research.assumptions must be an array of non-empty strings');
      }
      if (research.mode === 'concept' && !(Array.isArray(research.assumptions) && research.assumptions.length)) {
        fail('research.assumptions is required when mode is concept');
      }
    }
  } else {
    warnings.push('research block missing: record public references or mark the model as concept');
  }

  if (spec.assembly !== undefined) {
    const assembly = spec.assembly;
    if (!assembly || typeof assembly !== 'object' || Array.isArray(assembly)) fail('assembly must be an object');
    else {
      if (assembly.internal !== undefined && (!Array.isArray(assembly.internal) || assembly.internal.some(item => typeof item !== 'string' || !item.trim()))) {
        fail('assembly.internal must be an array of module IDs');
      }
      if (assembly.mates !== undefined) {
        if (!Array.isArray(assembly.mates)) fail('assembly.mates must be an array');
        else {
          assembly.mates.forEach((mate, index) => {
            const where = `assembly.mates[${index}]`;
            if (!mate || typeof mate !== 'object' || Array.isArray(mate)) { fail(`${where} must be an object`); return; }
            if (!Array.isArray(mate.modules) || mate.modules.length !== 2 || mate.modules[0] === mate.modules[1]) {
              fail(`${where}.modules must name two different modules`);
            }
            if (!mate.reason || typeof mate.reason !== 'string' || !mate.reason.trim()) fail(`${where}.reason is required`);
          });
        }
      }
      if (assembly.tolerance !== undefined && (!Number.isFinite(Number(assembly.tolerance)) || Number(assembly.tolerance) < 0 || Number(assembly.tolerance) > 0.1)) {
        fail('assembly.tolerance must be between 0 and 0.1 model units');
      }
      if (assembly.review !== undefined) {
        const review = assembly.review;
        if (!review || typeof review !== 'object' || Array.isArray(review)) fail('assembly.review must be an object');
        else {
          if (!REVIEW_STATES.has(review.status)) fail('assembly.review.status must be pending or passed');
          if (review.reviewedAt !== undefined && typeof review.reviewedAt !== 'string') fail('assembly.review.reviewedAt must be a string');
          if (review.notes !== undefined && typeof review.notes !== 'string') fail('assembly.review.notes must be a string');
          if (review.status === 'passed' && !review.reviewedAt) fail('assembly.review.reviewedAt is required once review.status is passed');
          if (review.status === 'passed' && (!review.notes || review.notes.trim().length < 8)) fail('assembly.review.notes is required once review.status is passed');
        }
      }
    }
  }

  const modules = Array.isArray(spec.modules) ? spec.modules : [];
  const seen = new Set();
  let partCount = 0;
  let mass = 0;

  modules.forEach((module, index) => {
    const where = `modules[${index}]`;
    if (!module || typeof module !== 'object') { fail(`${where} is not an object`); return; }
    if (!module.id) fail(`${where}.id is required`);
    else if (seen.has(module.id)) fail(`${where}.id duplicates "${module.id}"`);
    else seen.add(module.id);
    if (!module.title) fail(`${where}.title is required`);
    if (!Number.isFinite(Number(module.mass)) || Number(module.mass) <= 0) fail(`${where}.mass must be positive`);
    else mass += Number(module.mass);
    for (const field of ['base', 'offset', 'anchor']) {
      if (module[field] !== undefined && !isVec3(module[field])) fail(`${where}.${field} must be [x,y,z]`);
    }
    if (!Array.isArray(module.parts) || module.parts.length === 0) fail(`${where}.parts must be a non-empty array`);
    else {
      module.parts.forEach((part, partIndex) => {
        const partWhere = `${where}.parts[${partIndex}]`;
        if (!part || typeof part !== 'object') { fail(`${partWhere} is not an object`); return; }
        partCount += 1;
        const type = part.type || 'box';
        if (!PART_TYPES.has(type)) fail(`${partWhere}.type "${type}" is not supported`);
        if (part.pos !== undefined && !isVec3(part.pos)) fail(`${partWhere}.pos must be [x,y,z]`);
        if (part.rot !== undefined && !isVec3(part.rot)) fail(`${partWhere}.rot must be [x,y,z]`);
        if (part.scale !== undefined && !isVec3(part.scale)) fail(`${partWhere}.scale must be [x,y,z]`);
        if (part.mat && !MATERIALS.has(part.mat)) warnings.push(`${partWhere}.mat "${part.mat}" is not a built-in material; the body material will be used`);
        if (type === 'box' && part.size !== undefined && (!Array.isArray(part.size) || part.size.length !== 3 || !part.size.every(n => Number(n) > 0))) fail(`${partWhere}.size must be [x,y,z]`);
        if (type === 'cylinder' && !(Number(part.radius ?? part.radiusTop) > 0)) fail(`${partWhere} needs a positive radius`);
        if (type === 'torus' && !(Number(part.radius) > 0 && Number(part.tube) > 0)) fail(`${partWhere} needs positive radius and tube`);
        if (type === 'ring' && !(Number(part.outer) > Number(part.inner))) fail(`${partWhere} needs outer > inner`);
        if (type === 'tube' && (!Array.isArray(part.points) || part.points.length < 2)) fail(`${partWhere}.points must contain at least two [x,y,z] points`);
      });
    }
  });

  if (spec.assembly && typeof spec.assembly === 'object') {
    for (const id of Array.isArray(spec.assembly.internal) ? spec.assembly.internal : []) {
      if (!seen.has(id)) fail(`assembly.internal references unknown module "${id}"`);
    }
    for (const mate of Array.isArray(spec.assembly.mates) ? spec.assembly.mates : []) {
      for (const id of Array.isArray(mate?.modules) ? mate.modules : []) {
        if (!seen.has(id)) fail(`assembly.mates references unknown module "${id}"`);
      }
    }
  }

  const expected = Number(product.totalMass);
  if (Number.isFinite(expected) && Math.abs(mass - expected) > 0.5) {
    fail(`mass mismatch: modules sum to ${mass} g but product.totalMass is ${expected} g`);
  }
  if (modules.length && modules.length !== 10) warnings.push(`this spec has ${modules.length} modules; the reference UI is tuned for 10`);
  return { errors, warnings, modules: modules.length, parts: partCount, mass };
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirect) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/validate-spec.mjs <scene.json>');
    process.exit(2);
  }
  const full = path.resolve(file);
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    console.error(`FAIL  cannot read JSON: ${error.message}`);
    process.exit(1);
  }
  const result = validateSpec(spec, path.basename(file));
  if (result.errors.length) {
    console.error(`FAIL  ${file}`);
    for (const error of result.errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(`OK    ${path.basename(file)}  |  ${result.modules} modules  |  ${result.parts} parts  |  ${result.mass} g`);
  for (const warning of result.warnings) console.log(`WARN  ${warning}`);
}