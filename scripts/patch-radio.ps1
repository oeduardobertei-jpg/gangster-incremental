$root = 'C:\Users\Eduardo Bertei\Downloads\gangster-incremental-0.5.5-beauty-pass\gangster-incremental'
Set-Location $root
$f = 'src\App.tsx'
$c = [IO.File]::ReadAllText((Resolve-Path $f))

$c = $c.Replace(
  "import { StatsModal } from './components/StatsModal';",
  "import { StatsModal } from './components/StatsModal';`r`nimport { RadioPlayer } from './components/RadioPlayer';"
)
$c = $c.Replace(
  "import { soundEngine } from './audio/soundEngine';",
  "import { soundEngine } from './audio/soundEngine';`r`nimport { radioEngine } from './audio/radioEngine';"
)
$old = @'
    soundEngine.setVolume(gameState.soundVolume);
    soundEngine.setMuted(gameState.soundMuted);
'@
$new = @'
    soundEngine.setVolume(gameState.soundVolume);
    soundEngine.setMuted(gameState.soundMuted);
    radioEngine.setSystemMuted(gameState.soundMuted);
'@
if (-not $c.Contains($old)) { throw 'sound effect anchor missing' }
$c = $c.Replace($old, $new)

$anchor = @'
        {/* Speed & Settings Actions */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
'@
$replacement = @'
        <div className="hidden lg:block shrink-0">
          <RadioPlayer />
        </div>

        {/* Speed & Settings Actions */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
'@
if (-not $c.Contains($anchor)) { throw 'header anchor missing' }
$c = $c.Replace($anchor, $replacement)
[IO.File]::WriteAllText((Resolve-Path $f), $c, [Text.UTF8Encoding]::new($false))
Write-Host 'RadioPlayer integrated.'
