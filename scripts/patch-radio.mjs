import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/App.tsx';
let text = readFileSync(file, 'utf8');
const once = (regex, replacement, label) => {
  if (!regex.test(text)) throw new Error(`missing ${label}`);
  text = text.replace(regex, replacement);
};
once(
  /import \{ StatsModal \} from '\.\/components\/StatsModal';/,
  "import { StatsModal } from './components/StatsModal';\nimport { RadioPlayer } from './components/RadioPlayer';",
  'RadioPlayer import'
);
once(
  /import \{ soundEngine \} from '\.\/audio\/soundEngine';/,
  "import { soundEngine } from './audio/soundEngine';\nimport { radioEngine } from './audio/radioEngine';",
  'radioEngine import'
);
once(
  /    soundEngine\.setVolume\(gameState\.soundVolume\);\r?\n    soundEngine\.setMuted\(gameState\.soundMuted\);/,
  "    soundEngine.setVolume(gameState.soundVolume);\n    soundEngine.setMuted(gameState.soundMuted);\n    radioEngine.setSystemMuted(gameState.soundMuted);",
  'sound sync'
);
once(
  /        \{\/\* Speed & Settings Actions \*\/\}\r?\n        <div className="flex items-center gap-1 lg:gap-2 shrink-0">/,
  "        <div className=\"hidden lg:block shrink-0\">\n          <RadioPlayer />\n        </div>\n\n        {/* Speed & Settings Actions */}\n        <div className=\"flex items-center gap-1 lg:gap-2 shrink-0\">",
  'header radio slot'
);
writeFileSync(file, text, 'utf8');
console.log('RadioPlayer integrated.');
