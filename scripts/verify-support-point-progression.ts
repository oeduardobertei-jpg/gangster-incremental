import assert from 'node:assert/strict';
import {
  SUPPORT_POINT_STAGE_THRESHOLDS,
  SUPPORT_POINT_UPGRADE_VISUAL_SPECS,
  SUPPORT_POINT_VISUAL_MAX_SCORE,
  getSupportPointPreviewProfile,
  getSupportPointVisualStage,
  isSupportPointBuildingId
} from '../src/rules/supportPointVisualProgression';

assert.deepEqual(SUPPORT_POINT_STAGE_THRESHOLDS, [0, 12, 40, 80]);
assert.equal(SUPPORT_POINT_VISUAL_MAX_SCORE, 110);

assert.equal(getSupportPointVisualStage(0), 0);
assert.equal(getSupportPointVisualStage(11), 0);
assert.equal(getSupportPointVisualStage(12), 1);
assert.equal(getSupportPointVisualStage(39), 1);
assert.equal(getSupportPointVisualStage(40), 2);
assert.equal(getSupportPointVisualStage(79), 2);
assert.equal(getSupportPointVisualStage(80), 3);
assert.equal(getSupportPointVisualStage(110), 3);

const max = getSupportPointPreviewProfile({ kind: 'max' });
assert.equal(max.score, SUPPORT_POINT_VISUAL_MAX_SCORE);
assert.equal(max.stage, 3);
assert.equal(max.levels.fortification, SUPPORT_POINT_UPGRADE_VISUAL_SPECS.fortification.max);
assert.equal(max.levels.barricades, SUPPORT_POINT_UPGRADE_VISUAL_SPECS.barricades.max);
assert.equal(max.levels.riflemen, SUPPORT_POINT_UPGRADE_VISUAL_SPECS.riflemen.max);
assert.equal(max.levels.ammoLogistics, SUPPORT_POINT_UPGRADE_VISUAL_SPECS.ammoLogistics.max);
assert.equal(max.levels.medics, SUPPORT_POINT_UPGRADE_VISUAL_SPECS.medics.max);

const fortifiedTier = getSupportPointPreviewProfile({ kind: 'tier', key: 'fortification', tier: 3 });
assert.equal(fortifiedTier.stage, 2);
assert.ok(fortifiedTier.levels.fortification > 0);
assert.equal(fortifiedTier.levels.barricades, 0);

assert.equal(isSupportPointBuildingId('esconderijo'), true);
assert.equal(isSupportPointBuildingId('boca_leste'), true);
assert.equal(isSupportPointBuildingId('mirante'), false);

console.log('support-point progression acceptance: ok');
