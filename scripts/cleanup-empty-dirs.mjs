import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
]);

function isDirEmpty(dirAbs) {
  try {
    const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    return entries.length === 0;
  } catch {
    return false;
  }
}

function cleanupEmptyDirs(rootAbs) {
  let removed = 0;

  function walk(dirAbs) {
    let entries;
    try {
      entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    } catch {
      return;
    }

    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (EXCLUDE_DIRS.has(ent.name)) continue;
      const childAbs = path.join(dirAbs, ent.name);
      walk(childAbs);
    }

    if (dirAbs !== rootAbs && isDirEmpty(dirAbs)) {
      try {
        fs.rmdirSync(dirAbs);
        removed++;
      } catch {
        // ignore
      }
    }
  }

  walk(rootAbs);
  return removed;
}

const removed = cleanupEmptyDirs(ROOT);
process.stdout.write(`Removed empty directories: ${removed}\n`);

