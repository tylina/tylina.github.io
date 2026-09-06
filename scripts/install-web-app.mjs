import { execFileSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureDirectory, readVerifiedArtifact, retainWebAssets, validateWebArtifact } from './web-artifacts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'web-app.json'), 'utf8'));
const previous = JSON.parse(await readFile(join(root, 'web-app.previous.json'), 'utf8'));
validateWebArtifact(manifest);
if (!Array.isArray(previous) || previous.length > 2) throw new Error('Retain at most two prior Web releases');
previous.forEach(validateWebArtifact);
if (new Set([manifest, ...previous].map((item) => item.revision)).size !== previous.length + 1) {
  throw new Error('Retained Web releases must be distinct from the current release');
}
const cache = join(root, '.web-artifacts');
const temporary = await mkdtemp(join(tmpdir(), 'tylina-web-site-'));
const extract = async (item, target, override) => {
  const bytes = await readVerifiedArtifact(item, cache, override);
  const archive = join(temporary, `${item.tag}.tar.gz`);
  await writeFile(archive, bytes);
  await mkdir(target, { recursive: true });
  // Only exact publisher-owned, checksum-verified archives reach extraction.
  execFileSync('tar', ['-xzf', archive, '-C', target, '--no-same-owner'], { stdio: 'inherit' });
  const size = await measureDirectory(target);
  if (size.files !== item.files || size.bytes !== item.uncompressedBytes) throw new Error('Unpacked Web artifact does not match its manifest');
};
try {
  const target = join(root, 'dist/app');
  await rm(target, { recursive: true, force: true });
  await extract(manifest, target, process.env.TYLINA_WEB_ARCHIVE);
  const retained = [];
  for (const item of previous) {
    const unpacked = join(temporary, item.tag);
    await extract(item, unpacked);
    retained.push({ revision: item.revision, files: await retainWebAssets(unpacked, target) });
    await rm(unpacked, { recursive: true, force: true });
  }
  const size = await measureDirectory(target);
  if (size.files > 40_000 || size.bytes > 768 * 1024 * 1024) throw new Error('The retained Web application exceeds the deployment budget');
  for (const entry of ['index.html', 'embed.html', 'presenter.html', 'tylina-embed.js',
    'agent-skills/manifest.json', 'web-templates/catalog.json']) await access(join(target, entry));
  await writeFile(join(target, 'build.json'), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(join(target, 'retained-assets.json'), JSON.stringify({ revision: manifest.revision, retained }) + '\n');
  process.stdout.write(`Installed Tylina Web ${manifest.revision.slice(0, 12)} with ${retained.length} prior asset sets (${size.bytes} bytes)\n`);
} finally { await rm(temporary, { recursive: true, force: true }); }
