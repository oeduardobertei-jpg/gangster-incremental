import { readFileSync } from 'node:fs';
import { clampAudioPan, getGunVoiceGain, GUNFIRE_PROFILES } from '../src/audio/combatAudioProfiles';

const checks: Array<[string, boolean]> = [];
const check = (name:string, ok:boolean) => checks.push([name, ok]);

check('four authored gun families', Object.keys(GUNFIRE_PROFILES).length === 4);
check('all families have audible variation', Object.values(GUNFIRE_PROFILES).every(p => p.pitchVariance >= .05));
check('shot throttles protect mass combat', Object.values(GUNFIRE_PROFILES).every(p => p.minGap >= .04));
check('tails stay short', Object.values(GUNFIRE_PROFILES).every(p => p.tailDuration <= .16));
check('rifle body is heavier than pistol', GUNFIRE_PROFILES.fuzil.bodyVolume > GUNFIRE_PROFILES.pistol.bodyVolume);
check('pan center stable', clampAudioPan(500,1000) === 0);
check('pan clamped left', clampAudioPan(0,1000) >= -.82);
check('pan clamped right', clampAudioPan(1000,1000) <= .82);
check('voice pressure reduces gain', getGunVoiceGain(8,8) < getGunVoiceGain(1,8));
check('voice gain floor safe', getGunVoiceGain(20,8) >= .5);

const engine = readFileSync('src/audio/soundEngine.ts','utf8');
const canvas = readFileSync('src/components/GameCanvas.tsx','utf8');
check('combat compressor present', engine.includes('createDynamicsCompressor'));
check('stereo panner present', engine.includes('createStereoPanner'));
check('noise variation pool present', engine.includes('length: 4'));
check('voice budget present', engine.includes('maxGunVoices = 8'));
check('world x drives gun pan', /playGunfireShot\([^;]+\{ x: muzzleX, width \}/.test(canvas));
check('impact pan receives world x', canvas.includes('playBulletImpact(false, { x: b.x, width })') && canvas.includes('playBulletImpact(true, { x: b.x, width })'));

for (const [name,ok] of checks) console.log(`${ok?'PASS':'FAIL'} | ${name}`);
if (checks.some(([,ok])=>!ok)) process.exit(1);
console.log(`COMBAT_AUDIO_11H ${checks.length}/${checks.length} PASS`);
