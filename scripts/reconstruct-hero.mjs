import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const partsDir = path.join(root, 'assets-src', 'hero');
const publicDir = path.join(root, 'public', 'assets');

const parts = Array.from(
  { length: 11 },
  (_, i) => path.join(partsDir, `part${String(i).padStart(2, '0')}.txt`)
);

const chunks = await Promise.all(parts.map((file) => readFile(file, 'utf8')));
const binary = Buffer.from(chunks.join(''), 'base64');

const expectedBytes = 55684;
const expectedSha256 = 'af3e7216933eca9e41f951c42f20c1eb2ca25aa8714e60bd9bf5e6987f4ca9d8';
const digest = createHash('sha256').update(binary).digest('hex');

if (binary.length !== expectedBytes || digest !== expectedSha256) {
  throw new Error(
    `Approved hero failed integrity check: ${binary.length} bytes, sha256=${digest}`
  );
}

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, 'hero-b-approved.webp'), binary);
await writeFile(path.join(publicDir, 'hero-b-exact.webp'), binary);
await writeFile(path.join(publicDir, 'hero-b-approved-v1.webp'), binary);

console.log(
  `Approved hero reconstructed and verified: ${binary.length} bytes, sha256=${digest}`
);
