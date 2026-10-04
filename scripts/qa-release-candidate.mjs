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
  'scripts/acceptance-060-flow.mjs',
  'scripts/acceptance-110d-faction-mass.mjs',
  'scripts/acceptance-110e-camera2.mjs',
  'scripts/acceptance-110f-hud2.mjs',
  'scripts/acceptance-110g-combat-visuals.ts',
  'scripts/acceptance-110h-combat-audio.ts',
  'scripts/acceptance-110i-render-pipeline.mjs',
  'scripts/acceptance-110j-performance.mjs',
  'scripts/acceptance-110k-t2-polish.mjs',
  'scripts/acceptance-110l-t3-polish.mjs',
  'scripts/acceptance-110m-t4-polish.mjs',
  'scripts/acceptance-110n-t5-polish.mjs',
  'scripts/acceptance-110o-t6-polish.mjs',
  'scripts/acceptance-110p-campaign-polish.mjs'
];

const performanceRetry = new Set([
  'scripts/acceptance-060-flow.mjs',
  'scripts/acceptance-110j-performance.mjs',
  'scripts/acceptance-110n-t5-polish.mjs',
  'scripts/acceptance-110o-t6-polish.mjs',
  'scripts/acceptance-110p-campaign-polish.mjs'
]);

// A long RC run creates hundreds of disposable targets. Chrome may retain idle
// renderers for process reuse even after BrowserContexts are disposed, which can
// distort later FPS/layout measurements. Reset only the dedicated local QA Chrome
// at stable boundaries; the player's normal Chrome profile is never touched.
const browserResetBefore = new Set([
  'scripts/acceptance-060-campaign.mjs',
  'scripts/acceptance-0915-all-capture-anchors.mjs',
  'scripts/acceptance-060-flow.mjs',
  'scripts/acceptance-110f-hud2.mjs',
  'scripts/acceptance-110j-performance.mjs',
  'scripts/acceptance-110k-t2-polish.mjs',
  'scripts/acceptance-110n-t5-polish.mjs',
  'scripts/acceptance-110p-campaign-polish.mjs'
]);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const tsxCli = resolve(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const runTest = test => spawnSync(process.execPath, test.endsWith('.ts') ? [tsxCli, test] : [test], { cwd: root, stdio: 'inherit', env: process.env });
const cdpEndpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9237/json';
const managesLocalWindowsCdp = process.platform === 'win32' && /^http:\/\/(127\.0\.0\.1|localhost):9237(?:\/|$)/i.test(cdpEndpoint);

const resetLocalCdpBrowser = reason => {
  if (!managesLocalWindowsCdp || process.env.RC_QA_MANAGE_CDP === '0') return;
  console.log(`RC_QA_BROWSER_RESET ${reason}`);
  const ps = String.raw`
$ErrorActionPreference='Stop'
$listener=Get-NetTCPConnection -LocalPort 9237 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if($listener){
  $ownerPid=$listener.OwningProcess
  $proc=Get-CimInstance Win32_Process -Filter "ProcessId=$ownerPid" -ErrorAction SilentlyContinue
  if($proc -and $proc.CommandLine -and $proc.CommandLine -notmatch 'chrome-debug-9237'){
    throw "Port 9237 is owned by a non-QA process: $($proc.CommandLine)"
  }
  $qa=Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -match 'chrome-debug-9237' }
  foreach($child in $qa){ Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue }
}
for($i=0;$i -lt 30;$i++){
  Start-Sleep -Milliseconds 150
  $still=Get-NetTCPConnection -LocalPort 9237 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if(-not $still){ break }
  $stillProc=Get-CimInstance Win32_Process -Filter "ProcessId=$($still.OwningProcess)" -ErrorAction SilentlyContinue
  if(-not $stillProc){ continue }
  if($stillProc.CommandLine -match 'chrome-debug-9237'){
    Stop-Process -Id $still.OwningProcess -Force -ErrorAction SilentlyContinue
    continue
  }
  if($stillProc.CommandLine){
    throw "Port 9237 changed ownership during QA reset: $($stillProc.CommandLine)"
  }
  # CommandLine can be temporarily unavailable while a Chrome child exits.
  # Do not kill an unidentified process; wait for the listener to disappear.
}
$still=Get-NetTCPConnection -LocalPort 9237 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if($still){
  $finalProc=Get-CimInstance Win32_Process -Filter "ProcessId=$($still.OwningProcess)" -ErrorAction SilentlyContinue
  if($finalProc -and $finalProc.CommandLine -and $finalProc.CommandLine -notmatch 'chrome-debug-9237'){
    throw "Port 9237 is owned by a non-QA process after reset: $($finalProc.CommandLine)"
  }
  throw 'QA Chrome did not release CDP port 9237'
}
$profile='C:\Temp\chrome-debug-9237'
for($i=0;$i -lt 8 -and (Test-Path $profile);$i++){
  Remove-Item $profile -Recurse -Force -ErrorAction SilentlyContinue
  if(Test-Path $profile){ Start-Sleep -Milliseconds 150 }
}
$chrome=@(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "$([Environment]::GetEnvironmentVariable('ProgramFiles(x86)'))\Google\Chrome\Application\chrome.exe"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if(-not $chrome){ throw 'Chrome executable not found for RC QA' }
Start-Process -FilePath $chrome -ArgumentList @('--remote-debugging-port=9237','--user-data-dir=C:\Temp\chrome-debug-9237','--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','about:blank')
$ready=$false
for($i=0;$i -lt 40;$i++){
  Start-Sleep -Milliseconds 250
  try {
    $version=Invoke-RestMethod 'http://127.0.0.1:9237/json/version' -TimeoutSec 1
    if($version.webSocketDebuggerUrl){$ready=$true;break}
  } catch {}
}
if(-not $ready){ throw 'QA Chrome did not expose CDP 9237 after reset' }
`;
  const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { cwd: root, stdio: 'inherit', env: process.env });
  if (result.status !== 0) throw new Error(`RC QA could not reset dedicated CDP browser (${reason})`);
};

const startedAt = Date.now();
const failures = [];
for (const test of tests) {
  if (browserResetBefore.has(test)) resetLocalCdpBrowser(`before ${test}`);
  if (performanceRetry.has(test)) await sleep(900);
  console.log(`\n===== RC QA - ${test} =====`);
  let result = runTest(test);
  if (result.status !== 0 && performanceRetry.has(test)) {
    console.warn(`RC_QA_RETRY ${test} - performance gate will be repeated once after clean-browser cooldown`);
    resetLocalCdpBrowser(`retry ${test}`);
    await sleep(900);
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
