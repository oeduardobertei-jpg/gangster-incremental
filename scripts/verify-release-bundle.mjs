import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const assetsDir = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const files = readdirSync(assetsDir);
const jsFiles = files.filter(name => name.endsWith('.js'));
const cssFiles = files.filter(name => name.endsWith('.css'));

if (jsFiles.length === 0) throw new Error('Release bundle check: no JavaScript asset found in dist/assets. Run the production build first.');

const measure = name => {
  const bytes = readFileSync(join(assetsDir, name));
  return { name, raw: bytes.length, gzip: gzipSync(bytes, { level: 9 }).length };
};

const js = jsFiles.map(measure);
const css = cssFiles.map(measure);
const jsGzipTotal = js.reduce((sum, item) => sum + item.gzip, 0);
const cssGzipTotal = css.reduce((sum, item) => sum + item.gzip, 0);
const largestJsGzip = Math.max(...js.map(item => item.gzip));

const KB = 1024;
const budgets = {
  totalJsGzip: 275 * KB,
  largestJsGzip: 260 * KB,
  totalCssGzip: 20 * KB
};

const format = value => `${(value / KB).toFixed(1)} KiB`;
const checks = [
  ['total JS gzip', jsGzipTotal <= budgets.totalJsGzip, `${format(jsGzipTotal)} / ${format(budgets.totalJsGzip)}`],
  ['largest JS chunk gzip', largestJsGzip <= budgets.largestJsGzip, `${format(largestJsGzip)} / ${format(budgets.largestJsGzip)}`],
  ['total CSS gzip', cssGzipTotal <= budgets.totalCssGzip, `${format(cssGzipTotal)} / ${format(budgets.totalCssGzip)}`]
];

for (const [label, ok, detail] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} | ${label} | ${detail}`);
console.log(`BUNDLE_RELEASE_BUDGET jsChunks=${js.length} cssChunks=${css.length} jsGzip=${format(jsGzipTotal)} cssGzip=${format(cssGzipTotal)}`);

if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
