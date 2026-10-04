import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tests = [
  'scripts/acceptance-060-campaign.mjs',
  'scripts/acceptance-060-organic-pathing.mjs',
  'scripts/acceptance-0910-base-preview.mjs',
  'scripts/acceptance-0910-base-promotion.mjs',
  'scripts/acceptance-0911-territories.mjs',
  'scripts/acceptance-0911-persistence.mjs',
  'scripts/acceptance-0911-core-loop.mjs',
  'scripts/acceptance-0912-campaign-finale.mjs',
  'scripts/acceptance-0914-critical-capture-flow.mjs',
  'scripts/acceptance-0915-all-capture-anchors.mjs',
  'scripts/acceptance-0916-consolidation.mjs',
  'scripts/acceptance-0917-live-domination.mjs',
  'scripts/acceptance-opening-garrison.mjs',
  'scripts/acceptance-057-spawn-ownership.mjs',
  'scripts/acceptance-056c-combat.mjs',
  'scripts/acceptance-070g-radio-tooltip.mjs',
  'scripts/test-04f-layout.mjs',
  'scripts/verify-evolution-layout.mjs',
  'scripts/acceptance-060-flow.mjs'
];

const performanceRetry = new Set(['scripts/acceptance-060-flow.mjs']);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const runTest = test => spawnSync(process.execPath, [test], { cwd: root, stdio: 'inherit' });

const startedAt = Date.now();
const failures = [];
for (const test of tests) {
  if (performanceRetry.has(test)) await sleep(1200);
  console.log(`\n===== RC QA · ${test} =====`);
  let result = runTest(test);
  if (result.status !== 0 && performanceRetry.has(test)) {
    console.warn(`RC_QA_RETRY ${test} · performance gate will be repeated once after cooldown`);
    await sleep(1800);
    result = runTest(test);
  }
  if (result.status !== 0) failures.push({ test, status: result.status });
}

const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(`\nRC_QA_SUMMARY total=${tests.length} passed=${tests.length - failures.length} failed=${failures.length} duration=${seconds}s`);
if (failures.length) {
  for (const failure of failures) console.error(`RC_QA_FAIL ${failure.test} exit=${failure.status}`);
  process.exitCode = 1;
}
