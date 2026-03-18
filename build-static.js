/**
 * העתקה סטטית לפרודקשן - Vercel/Netlify
 * מעתיק את כל הקבצים ל-dist בלי עיבוד Vite
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.join(__dirname);
const dist = path.join(root, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
fs.mkdirSync(dist, { recursive: true });

copyFile(path.join(root, 'index.html'), path.join(dist, 'index.html'));
if (fs.existsSync(path.join(root, 'sitemap.xml'))) copyFile(path.join(root, 'sitemap.xml'), path.join(dist, 'sitemap.xml'));
if (fs.existsSync(path.join(root, 'manifest.json'))) copyFile(path.join(root, 'manifest.json'), path.join(dist, 'manifest.json'));
if (fs.existsSync(path.join(root, 'sw.js'))) copyFile(path.join(root, 'sw.js'), path.join(dist, 'sw.js'));
if (fs.existsSync(path.join(root, 'LICENSE'))) copyFile(path.join(root, 'LICENSE'), path.join(dist, 'LICENSE'));
if (fs.existsSync(path.join(root, 'CREDITS'))) copyFile(path.join(root, 'CREDITS'), path.join(dist, 'CREDITS'));
copyDir(path.join(root, 'js'), path.join(dist, 'js'));
copyDir(path.join(root, 'css'), path.join(dist, 'css'));
copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));
copyDir(path.join(root, 'pages'), path.join(dist, 'pages'));

console.log('Static build done: dist/');
