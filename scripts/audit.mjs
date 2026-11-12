#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { validateSpec } from './validate-spec.mjs';
import { checkAssembly } from './check-assembly.mjs';

const target = path.resolve(process.argv[2] || '.');
const required = [
  'index.html', 'standalone.html', 'styles.css', 'engine.js', 'design.js', 'scene-spec.js', 'vendor/three.min.js',
  'scene.json', 'check-assembly.mjs',
  'fonts/space-grotesk-latin-wght-normal.woff2',
  'fonts/newsreader-latin-wght-normal.woff2',
  'fonts/manrope-latin-wght-normal.woff2',
  'fonts/ibm-plex-mono-latin-400-normal.woff2',
  'fonts/ibm-plex-mono-latin-500-normal.woff2',
  'LICENSES/ISC-lucide.txt',
  'LICENSES/OFL-space-grotesk.txt',
  'LICENSES/OFL-newsreader.txt',
  'LICENSES/OFL-manrope.txt',
  'LICENSES/OFL-ibm-plex-mono.txt'
];
const failures = [];
const warnings = [];
const readText = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';

for (const file of required) {
  if (!fs.existsSync(path.join(target, file))) failures.push(`missing ${file}`);
}

if (!failures.length) {
  const html = fs.readFileSync(path.join(target, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(target, 'styles.css'), 'utf8');
  const engine = fs.readFileSync(path.join(target, 'engine.js'), 'utf8');
  const design = fs.readFileSync(path.join(target, 'design.js'), 'utf8');
  const specSource = fs.readFileSync(path.join(target, 'scene-spec.js'), 'utf8');

  const remotePatterns = [
    /(?:src|href)\s*=\s*["']https?:\/\//i,
    /url\(\s*["']?https?:\/\//i,
    /@import\s+url\(\s*["']?https?:\/\//i,
    /fetch\(\s*["']https?:\/\//i
  ];
  for (const [name, text] of [['index.html', html], ['styles.css', css], ['engine.js', engine], ['design.js', design]]) {
    if (remotePatterns.some(pattern => pattern.test(text))) failures.push(`remote asset reference in ${name}`);
  }
  if (!/<script\s+src=["']design\.js["']/.test(html)) failures.push('index.html does not load design.js');
  if (!/STUDIO_DESIGN/.test(engine)) failures.push('engine.js does not consume STUDIO_DESIGN');
  if (!/--stage-bg/.test(css) || !/data-layout/.test(css)) warnings.push('themed CSS tokens not found in styles.css');
  if (!/data-pattern/.test(css)) warnings.push('pattern hooks not found in styles.css');
  if (!/body\.dataset\.pattern/.test(design) || !/COPY_BY_PRESET/.test(design)) failures.push('pattern/copy art-direction hooks not wired in design.js');
  if (!/@font-face/.test(css) || !/url\(["']?\.\/fonts\//.test(css)) failures.push('local @font-face bundle not found in styles.css');
  if (!/class=["']svg-sprite["']/.test(html) || !/<symbol\s+id=["']i-/.test(html)) failures.push('inline icon sprite not found in index.html');
  if (!/stageMotifUse/.test(html) || !/DESIGN\.motif/.test(engine)) failures.push('theme motif hook not wired through engine.js');
  if (!/class=["']stage-signature["']/.test(html) || !/data-stage/.test(css)) failures.push('product stage-signature layer not wired');
  if (!/stageMethod/.test(html) || !/dataset\.stage/.test(engine)) failures.push('identity/stage method hook not wired');
  if (!/view-label/.test(html) || !/view-label/.test(engine)) failures.push('dynamic view labels not wired');
  if (!/connectorPositions/.test(engine) || !/connectorLines/.test(engine)) failures.push('exploded-path connector layer not wired');
  const uiLabels = ['全部拆解', '收合装配', '下一模块', '聚焦查看'];
  for (const label of uiLabels) if (!`${html}${engine}`.includes(label)) failures.push(`missing UI label ${label}`);
  if (/[\uFFFD\uE000-\uF8FF]/.test(`${html}${engine}${design}`)) failures.push('replacement/private-use glyph corruption in template text');
  if (!/floorY\s*=\s*Math\.min\(floorY, module\.baseMinY \+ module\.offset\.y \* module\.state\)/.test(engine)) failures.push('dynamic stage floor fix not found in engine.js');
  if (/(#topdebug|#matdebug|#explodeddebug|#layoutdebug|#fitdebug|#opacitydebug)/.test(engine)) failures.push('debug branch still present in engine.js');
  if (!/pointer:\s*coarse/.test(engine)) warnings.push('compact/coarse-pointer mobile handling not found in engine.js');
  if (!/touchstart/.test(engine) || !/touchmove/.test(engine)) warnings.push('pinch/touch handling not found in engine.js');
  if (!/Math\.min\(window\.devicePixelRatio \|\| 1, 2\.5\)/.test(engine)) warnings.push('high-DPI viewport cap not found in engine.js');
  if (!/visibilitychange/.test(engine)) warnings.push('visibility pause not found in engine.js');

  const standalone = readText(path.join(target, 'standalone.html'));
  const standaloneMarkup = standalone.replace(/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/gi, '<script></script>');
  if (/<script\b[^>]*\bsrc\s*=/i.test(standaloneMarkup)) failures.push('standalone.html still references an external script');
  if (/<link\b[^>]*\bhref\s*=\s*["']styles\.css["']/i.test(standaloneMarkup)) failures.push('standalone.html still references an external stylesheet');
  if (!/data:font\/woff2;base64,/.test(standalone)) failures.push('standalone.html does not embed local font data');
  if (!/third-party-licenses/.test(standalone)) failures.push('standalone.html is missing embedded license notices');
  if (remotePatterns.some(pattern => pattern.test(standalone))) failures.push('remote asset reference in standalone.html');

  let spec;
  try {
    const sandbox = { window: {} };
    vm.runInNewContext(specSource, sandbox, { timeout: 1500 });
    spec = sandbox.window.SCENE_SPEC;
  } catch (error) {
    failures.push(`cannot evaluate scene-spec.js: ${error.message}`);
  }
  if (spec) {
    const result = validateSpec(spec, 'scene-spec');
    failures.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.errors.length === 0) {
      const collision = checkAssembly(spec);
      if (collision.unapproved.length) {
        const pairs = [...new Set(collision.unapproved.map(item => item.modules.join('/')))].slice(0, 6);
        failures.push(`assembly has ${collision.unapproved.length} unapproved intersections (${pairs.join(', ')}); fix geometry or declare reviewed mates`);
      }
      if (collision.review.status !== 'passed') {
        failures.push('assembly.review.status must be passed after visual self-review');
      }
      const parts = result.parts;
      const size = ['index.html', 'styles.css', 'engine.js', 'design.js', 'scene-spec.js']
        .map(file => fs.statSync(path.join(target, file)).size)
        .reduce((sum, value) => sum + value, 0);
      const standaloneKB = (fs.statSync(path.join(target, 'standalone.html')).size / 1024).toFixed(1);
      const theme = spec.design?.preset || 'auto';
      const research = spec.research?.mode || 'missing';
      const identity = spec.identity?.archetype || 'inferred';
      const stage = spec.identity?.stage || 'auto';
      const views = Array.isArray(spec.identity?.views) ? spec.identity.views.map(view => view.label).join('/') : 'auto';
      console.log(`PASS  ${target}`);
      console.log(`      ${result.modules} modules | ${parts} parts | ${result.mass} g | ${(size / 1024).toFixed(1)} KB source | ${standaloneKB} KB standalone`);
      console.log(`      design ${theme} | identity ${identity}/${stage} | views ${views} | research ${research}`);
      console.log(`      local fonts/icons | stage grammar | connectors | offline standalone | no remote URLs | no debug branches`);
      console.log(`      assembly ${collision.unapproved.length} unapproved | ${collision.internalModules} internal modules | ${collision.internalHits} internal overlaps | review ${collision.review.status}`);
    }
  }
}

if (warnings.length) {
  for (const warning of warnings) console.log(`WARN  ${warning}`);
}
if (failures.length) {
  console.error(`FAIL  ${target}`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
