#!/usr/bin/env node
/* Build a single-file, offline HTML build from a scaffolded project.
   Everything needed to open the page is embedded: CSS, fonts, Three.js,
   design resolver, scene spec and engine. No network requests. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function inlineFonts(css, root) {
  return css.replace(/url\((["']?)\.\/fonts\/([^)"']+)\1\)/g, (match, quote, filename) => {
    const file = path.join(root, 'fonts', filename);
    if (!fs.existsSync(file)) throw new Error(`font not found: ${file}`);
    const base64 = fs.readFileSync(file).toString('base64');
    return `url("data:font/woff2;base64,${base64}")`;
  });
}

function escapeScript(code) {
  return code.replace(/<\/script/gi, '<\\/script');
}

function inlineFile(html, src, code) {
  const marker = new RegExp(
    `<script\\b[^>]*\\bsrc=["']${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>\\s*</script>`,
    'i'
  );
  if (!marker.test(html)) throw new Error(`script tag not found: ${src}`);
  return html.replace(marker, () => `<script>\n${escapeScript(code)}\n</script>`);
}

function licenseBlock(root) {
  const entries = [
    ['Three.js r152.2', 'vendor/THREE-LICENSE.txt'],
    ['Lucide 1.69.0', 'LICENSES/ISC-lucide.txt'],
    ['Space Grotesk', 'LICENSES/OFL-space-grotesk.txt'],
    ['Newsreader', 'LICENSES/OFL-newsreader.txt'],
    ['Manrope', 'LICENSES/OFL-manrope.txt'],
    ['IBM Plex Mono', 'LICENSES/OFL-ibm-plex-mono.txt']
  ];
  return entries.filter(([, file]) => fs.existsSync(path.join(root, file)))
    .map(([name, file]) => `===== ${name} =====\n${readText(path.join(root, file))}`)
    .join('\n\n');
}

export function bundleProject(projectDir) {
  const root = path.resolve(projectDir);
  const htmlPath = path.join(root, 'index.html');
  if (!fs.existsSync(htmlPath)) throw new Error(`index.html not found: ${root}`);
  let html = readText(htmlPath);
  const cssPath = path.join(root, 'styles.css');
  if (!fs.existsSync(cssPath)) throw new Error(`styles.css not found: ${root}`);
  const css = inlineFonts(readText(cssPath), root);
  const linkPattern = /<link\b[^>]*href=["']styles\.css["'][^>]*>/i;
  if (!linkPattern.test(html)) throw new Error('styles.css link not found in index.html');
  html = html.replace(linkPattern, () => `<style>\n${css}\n</style>`);

  const scripts = [
    ['vendor/three.min.js', path.join(root, 'vendor', 'three.min.js')],
    ['design.js', path.join(root, 'design.js')],
    ['scene-spec.js', path.join(root, 'scene-spec.js')],
    ['engine.js', path.join(root, 'engine.js')]
  ];
  for (const [src, file] of scripts) {
    if (!fs.existsSync(file)) throw new Error(`script not found: ${file}`);
    html = inlineFile(html, src, readText(file));
  }

  const licenses = licenseBlock(root);
  if (licenses) {
    html = html.replace('</body>', () => `<script type="text/plain" id="third-party-licenses">\n${escapeScript(licenses)}\n</script>\n</body>`);
  }
  html = html.replace('</head>', () => '<!-- Self-contained offline build. All CSS, fonts, scripts and licenses are embedded. -->\n</head>');
  const out = path.join(root, 'standalone.html');
  fs.writeFileSync(out, html, 'utf8');
  return { file: out, bytes: Buffer.byteLength(html), scripts: scripts.length };
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirect) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node scripts/bundle.mjs <project-directory>');
    process.exit(2);
  }
  try {
    const result = bundleProject(target);
    console.log(`OK    ${result.file}`);
    console.log(`      single-file offline build  |  ${(result.bytes / 1024).toFixed(1)} KB`);
  } catch (error) {
    console.error(`FAIL  ${error.message}`);
    process.exit(1);
  }
}