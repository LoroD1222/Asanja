#!/usr/bin/env node

import { open, mkdir, utimes } from 'node:fs/promises';
import path from 'node:path';

const HEADER_SIZE = 4377;
const NAME_SIZE = 255;
const SIZE_SIZE = 14;
const MTIME_SIZE = 12;

const [, , archivePath, destination, mode = 'extract'] = process.argv;

if (!archivePath || !destination) {
  console.error('Usage: node tools/extract-wpress.mjs <archive.wpress> <destination> [extract|list]');
  process.exit(1);
}

function readCString(buffer, start, length) {
  const slice = buffer.subarray(start, start + length);
  const terminator = slice.indexOf(0);
  return slice.subarray(0, terminator === -1 ? slice.length : terminator).toString('utf8');
}

function safeRelativePath(prefix, name) {
  const relative = path.posix.normalize(path.posix.join(prefix || '.', name));
  if (relative === '..' || relative.startsWith('../') || path.posix.isAbsolute(relative)) {
    throw new Error(`Unsafe archive path: ${relative}`);
  }
  return relative.replace(/^\.\//, '');
}

const archive = await open(archivePath, 'r');
const archiveStats = await archive.stat();
const outputRoot = path.resolve(destination);
const header = Buffer.alloc(HEADER_SIZE);
const chunk = Buffer.alloc(1024 * 1024);
let offset = 0;
let entries = 0;
let extractedBytes = 0;

if (mode === 'extract') {
  await mkdir(outputRoot, { recursive: true });
}

try {
  while (offset + HEADER_SIZE <= archiveStats.size) {
    const { bytesRead } = await archive.read(header, 0, HEADER_SIZE, offset);
    if (bytesRead !== HEADER_SIZE) break;

    const name = readCString(header, 0, NAME_SIZE);
    if (!name) break;

    const sizeText = readCString(header, NAME_SIZE, SIZE_SIZE);
    const mtimeText = readCString(header, NAME_SIZE + SIZE_SIZE, MTIME_SIZE);
    const prefix = readCString(header, NAME_SIZE + SIZE_SIZE + MTIME_SIZE, HEADER_SIZE - NAME_SIZE - SIZE_SIZE - MTIME_SIZE);
    const size = Number.parseInt(sizeText, 10);
    const mtime = Number.parseInt(mtimeText, 10);

    if (!Number.isSafeInteger(size) || size < 0) {
      throw new Error(`Invalid size for ${name}: ${sizeText}`);
    }

    const relativePath = safeRelativePath(prefix, name);
    const dataOffset = offset + HEADER_SIZE;
    const nextOffset = dataOffset + size;
    if (nextOffset > archiveStats.size) {
      throw new Error(`Truncated entry: ${relativePath}`);
    }

    if (mode === 'list') {
      console.log(`${size}\t${relativePath}`);
    } else {
      const outputPath = path.resolve(outputRoot, relativePath);
      if (outputPath !== outputRoot && !outputPath.startsWith(`${outputRoot}${path.sep}`)) {
        throw new Error(`Unsafe output path: ${outputPath}`);
      }

      await mkdir(path.dirname(outputPath), { recursive: true });
      const output = await open(outputPath, 'w');
      try {
        let remaining = size;
        let readOffset = dataOffset;
        while (remaining > 0) {
          const amount = Math.min(remaining, chunk.length);
          const result = await archive.read(chunk, 0, amount, readOffset);
          if (result.bytesRead === 0) throw new Error(`Unexpected end of archive in ${relativePath}`);
          await output.write(chunk, 0, result.bytesRead);
          remaining -= result.bytesRead;
          readOffset += result.bytesRead;
        }
      } finally {
        await output.close();
      }

      if (Number.isSafeInteger(mtime) && mtime > 0) {
        const modified = new Date(mtime * 1000);
        await utimes(outputPath, modified, modified).catch(() => {});
      }
      extractedBytes += size;
    }

    entries += 1;
    if (mode === 'extract' && entries % 500 === 0) {
      console.error(`Extracted ${entries} files (${(extractedBytes / 1024 / 1024).toFixed(1)} MiB)`);
    }
    offset = nextOffset;
  }
} finally {
  await archive.close();
}

console.error(`${mode === 'list' ? 'Listed' : 'Extracted'} ${entries} files.`);
