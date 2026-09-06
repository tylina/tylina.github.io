import { createHash } from 'node:crypto';
import { createReadStream, constants } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';

export function validateWebArtifact(manifest) {
  const tag = `web-${String(manifest?.revision).slice(0, 12)}`;
  const url = `https://github.com/tylina/tylina-issues/releases/download/${tag}/tylina-web.tar.gz`;
  if (manifest?.schemaVersion !== 1 || !/^[0-9a-f]{40}$/u.test(manifest.revision) || manifest.tag !== tag ||
    manifest.archive?.url !== url || !/^[0-9a-f]{64}$/u.test(manifest.archive?.sha256) ||
    !Number.isSafeInteger(manifest.archive?.bytes) || manifest.archive.bytes <= 0 || manifest.archive.bytes > 256 * 1024 * 1024 ||
    !Number.isSafeInteger(manifest.uncompressedBytes) || manifest.uncompressedBytes <= 0 || manifest.uncompressedBytes > 512 * 1024 * 1024 ||
    !Number.isSafeInteger(manifest.files) || manifest.files <= 0 || manifest.files > 20_000) {
    throw new Error('Invalid pinned Web application artifact');
  }
}

/** Every local cache hit and network response must match the publisher's pinned bytes. */
export async function readVerifiedArtifact(manifest, directory, override) {
  validateWebArtifact(manifest);
  const cached = join(directory, `${manifest.tag}.tar.gz`);
  let bytes;
  const local = override ?? cached;
  try {
    if ((await stat(local)).size !== manifest.archive.bytes) throw new Error('The local Web archive has the wrong byte count');
    bytes = await readFile(local);
  } catch (error) { if (override || error.code !== 'ENOENT') throw error; }
  if (!bytes) {
    const response = await fetch(manifest.archive.url, { signal: AbortSignal.timeout(180_000) });
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
  await mkdir(directory, { recursive: true });
  if (local !== cached || !await stat(cached).catch(() => null)) await writeFile(cached, bytes);
  return bytes;
}

export async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

/** Keep immutable chunks and addressed resources, preserving current entry points and catalogs. */
export async function retainWebAssets(previous, target) {
  const retained = [];
  const retain = async (relative) => {
    const source = join(previous, relative), destination = join(target, relative);
    const info = await stat(source);
    await mkdir(dirname(destination), { recursive: true });
    try { await copyFile(source, destination, constants.COPYFILE_EXCL); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if ((await stat(destination)).size !== info.size || await hashFile(source) !== await hashFile(destination)) {
        throw new Error(`An immutable Web resource changed without changing its URL: ${relative}`);
      }
    }
    retained.push(relative);
  };
  const walk = async (relative) => {
    for (const entry of await readdir(join(previous, relative), { withFileTypes: true })) {
      const path = `${relative}/${entry.name}`;
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) await retain(path);
      else throw new Error(`Unexpected retained Web resource: ${path}`);
    }
  };
  await walk('assets');
  await walk('agent-skills/objects');
  for (const entry of await readdir(join(previous, 'web-templates'), { withFileTypes: true })) {
    if (entry.isFile() && extname(entry.name) === '.zip') await retain(`web-templates/${entry.name}`);
  }
  return retained.sort();
}

export async function measureDirectory(root) {
  let files = 0, bytes = 0;
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) { const nested = await measureDirectory(path); files += nested.files; bytes += nested.bytes; }
    else if (entry.isFile()) { files++; bytes += (await stat(path)).size; }
    else throw new Error('A published Web application may only contain regular files and directories');
  }
  return { files, bytes };
}
