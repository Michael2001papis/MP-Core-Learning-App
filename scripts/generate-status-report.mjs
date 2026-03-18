import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, "STATUS_REPORT.txt");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function safeReadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function listFilesRec(dirAbs, { includeExts = null, excludeDirNames = new Set() } = {}) {
  const out = [];
  const stack = [dirAbs];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const abs = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        if (!excludeDirNames.has(ent.name)) stack.push(abs);
        continue;
      }
      if (includeExts) {
        const ext = path.extname(ent.name).toLowerCase();
        if (!includeExts.includes(ext)) continue;
      }
      out.push(abs);
    }
  }
  return out;
}

function rel(pAbs) {
  return path.relative(ROOT, pAbs).split(path.sep).join("/");
}

function summarizePages() {
  const pagesDir = path.join(ROOT, "pages");
  const files = listFilesRec(pagesDir, {
    includeExts: [".html"],
    excludeDirNames: new Set(["node_modules", ".git", "dist", "playwright-report", "test-results"]),
  });
  const indexPages = files.filter((p) => path.basename(p).toLowerCase() === "index.html");
  indexPages.sort((a, b) => rel(a).localeCompare(rel(b)));
  return indexPages.map(rel);
}

function summarizeTests() {
  const e2eDir = path.join(ROOT, "e2e");
  const unitTests = listFilesRec(path.join(ROOT, "js"), { includeExts: [".test.js"] }).map(rel).sort();
  const e2eTests = fs.existsSync(e2eDir)
    ? listFilesRec(e2eDir, { includeExts: [".js"] }).map(rel).sort()
    : [];
  return { unitTests, e2eTests };
}

function makeReport() {
  const now = new Date();
  const pkg = safeReadJson(path.join(ROOT, "package.json"));
  const pages = summarizePages();
  const { unitTests, e2eTests } = summarizeTests();

  const lines = [];
  lines.push("Status Report (Quick) — MP-Core-Learning-App");
  lines.push(`Generated: ${formatDate(now)}`);
  lines.push("");

  lines.push("== Project ==");
  if (pkg) {
    lines.push(`Name: ${pkg.name ?? "-"}`);
    lines.push(`Version: ${pkg.version ?? "-"}`);
  } else {
    lines.push("package.json: (failed to read)");
  }
  lines.push("");

  lines.push("== Pages (index.html) ==");
  for (const p of pages) lines.push(`- ${p}`);
  lines.push("");

  lines.push("== Scripts (npm) ==");
  if (pkg?.scripts) {
    const keys = Object.keys(pkg.scripts).sort();
    for (const k of keys) lines.push(`- ${k}: ${pkg.scripts[k]}`);
  } else {
    lines.push("(no scripts found)");
  }
  lines.push("");

  lines.push("== Tests ==");
  lines.push(`Unit test files: ${unitTests.length}`);
  for (const t of unitTests) lines.push(`- ${t}`);
  lines.push("");
  lines.push(`E2E test files: ${e2eTests.length}`);
  for (const t of e2eTests) lines.push(`- ${t}`);
  lines.push("");

  lines.push("== Quick commands ==");
  lines.push("- npm run dev");
  lines.push("- npm test");
  lines.push("- npm run test:e2e");
  lines.push("- npm run test:e2e:dist");
  lines.push("- npm run report:status");
  lines.push("- npm run cleanup:empty-dirs");
  lines.push("");

  return lines.join("\n") + "\n";
}

const content = makeReport();
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, content, "utf8");

process.stdout.write(`Wrote ${rel(OUT_FILE)} (${Buffer.byteLength(content, "utf8")} bytes)\n`);

