import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'web-app.json'), 'utf8'));
const expectedTag = `web-${String(manifest.revision).slice(0, 12)}`;
const expectedUrl = `https://github.com/tylina/tylina-issues/releases/download/${expectedTag}/tylina-web.tar.gz`;
if (manifest.schemaVersion !== 1 || !/^[0-9a-f]{40}$/u.test(manifest.revision) || manifest.tag !== expectedTag ||
  manifest.archive?.url !== expectedUrl || !/^[0-9a-f]{64}$/u.test(manifest.archive?.sha256) ||
  !Number.isSafeInteger(manifest.archive?.bytes) || manifest.archive.bytes <= 0 || manifest.archive.bytes > 256 * 1024 * 1024 ||
  !Number.isSafeInteger(manifest.uncompressedBytes) || manifest.uncompressedBytes <= 0 || manifest.uncompressedBytes > 512 * 1024 * 1024) {
  throw new Error('Invalid pinned Web application artifact');
}

const temporary = await mkdtemp(join(tmpdir(), 'tylina-web-site-'));
try {
  let bytes;
  if (process.env.TYLINA_WEB_ARCHIVE) bytes = await readFile(process.env.TYLINA_WEB_ARCHIVE);
  else {
    const response = await fetch(expectedUrl, { signal: AbortSignal.timeout(180_000) });
    if (!response.ok || !response.body) throw new Error(`Web artifact download failed: HTTP ${response.status}`);
    const chunks = [];
    let length = 0;
    for await (const chunk of response.body) {
      length += chunk.length;
      if (length > manifest.archive.bytes) throw new Error('The Web artifact exceeds its pinned byte count');
      chunks.push(chunk);
    }
    bytes = Buffer.concat(chunks);
  }
  if (bytes.length !== manifest.archive.bytes || createHash('sha256').update(bytes).digest('hex') !== manifest.archive.sha256) {
    throw new Error('The downloaded Web application does not match its pinned checksum');
  }
  const archive = join(temporary, 'web.tar.gz');
  await writeFile(archive, bytes);
  const target = join(root, 'dist/app');
  await mkdir(target, { recursive: true });
  // Only the exact publisher-owned, checksum-verified archive reaches extraction.
  execFileSync('tar', ['-xzf', archive, '-C', target, '--no-same-owner'], { stdio: 'inherit' });
  for (const entry of ['index.html', 'embed.html', 'presenter.html', 'tylina-embed.js',
    'agent-skills/manifest.json', 'web-templates/catalog.json']) await access(join(target, entry));
  await writeFile(join(target, 'build.json'), JSON.stringify(manifest, null, 2) + '\n');
  process.stdout.write(`Installed Tylina Web ${manifest.revision.slice(0, 12)} at /app/\n`);
} finally { await rm(temporary, { recursive: true, force: true }); }
