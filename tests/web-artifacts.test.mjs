import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { measureDirectory, readVerifiedArtifact, retainWebAssets } from '../scripts/web-artifacts.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'tylina-artifact-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const write = async (path, value) => {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), value);
  };
  return { root, write };
}

test('retains prior lazy chunks and addressed resources without replacing current entry points or catalogs', async (t) => {
  const { root, write } = await fixture(t);
  for (const path of ['assets/old.js', 'assets/shared.wasm', 'agent-skills/objects/sha256.md', 'web-templates/sha256.zip']) {
    await write(`old/${path}`, `immutable ${path}`);
  }
  await write('current/assets/shared.wasm', 'immutable assets/shared.wasm');
  for (const path of ['index.html', 'tylina-embed.js', 'agent-skills/manifest.json', 'web-templates/catalog.json']) {
    await write(`old/${path}`, 'old entry');
    await write(`current/${path}`, 'current entry');
  }
  const files = await retainWebAssets(join(root, 'old'), join(root, 'current'));
  assert.deepEqual(files, ['agent-skills/objects/sha256.md', 'assets/old.js', 'assets/shared.wasm', 'web-templates/sha256.zip']);
  for (const path of files) assert.equal(await readFile(join(root, 'current', path), 'utf8'), `immutable ${path}`);
  for (const path of ['index.html', 'tylina-embed.js', 'agent-skills/manifest.json', 'web-templates/catalog.json']) {
    assert.equal(await readFile(join(root, 'current', path), 'utf8'), 'current entry');
  }
  assert.equal((await measureDirectory(join(root, 'current'))).files, 8);
});

test('rejects different bytes published under the same immutable URL, preserving the current resource', async (t) => {
  const { root, write } = await fixture(t);
  await write('old/assets/shared.js', 'old');
  await write('current/assets/shared.js', 'new');
  await assert.rejects(retainWebAssets(join(root, 'old'), join(root, 'current')), /changed without changing its URL/);
  assert.equal(await readFile(join(root, 'current/assets/shared.js'), 'utf8'), 'new');
});

test('checks local archive bytes and SHA-256 on initial import and every cached read', async (t) => {
  const { root, write } = await fixture(t);
  const bytes = Buffer.from('a pinned archive'), revision = 'a'.repeat(40), tag = `web-${revision.slice(0, 12)}`;
  const manifest = { schemaVersion: 1, revision, tag, files: 1, uncompressedBytes: 16,
    archive: { url: `https://github.com/tylina/tylina-issues/releases/download/${tag}/tylina-web.tar.gz`,
      bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') } };
  await write('local.tar.gz', bytes);
  const cache = join(root, 'cache');
  assert.deepEqual(await readVerifiedArtifact(manifest, cache, join(root, 'local.tar.gz')), bytes);
  assert.deepEqual(await readVerifiedArtifact(manifest, cache), bytes);
  await write(`cache/${tag}.tar.gz`, Buffer.alloc(bytes.length));
  await assert.rejects(readVerifiedArtifact(manifest, cache), /pinned checksum/);
  await write(`cache/${tag}.tar.gz`, 'short');
  await assert.rejects(readVerifiedArtifact(manifest, cache), /wrong byte count/);
  await assert.rejects(readVerifiedArtifact({ ...manifest, archive: { ...manifest.archive, url: 'https://example.com/archive' } }, cache),
    /Invalid pinned/);
});
