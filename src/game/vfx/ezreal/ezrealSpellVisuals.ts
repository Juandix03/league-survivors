/** Facade VFX Ezreal (CommunityDragon). */
export {
  createEzrealBoltVisual,
  EZREAL_BOLT_RELEASE_MS,
  EZREAL_Q_RELEASE_MS,
  spawnEzrealBasicCast,
  spawnEzrealImpact,
  spawnEzrealMysticCast,
  updateEzrealBoltVisual,
  type EzrealBoltVisual,
} from './ezrealMysticShotVisual'

export {
  attachEzrealEssenceMark,
  EZREAL_W_RELEASE_MS,
  spawnEzrealEssenceFluxCast,
  spawnEzrealEssenceFluxDissipate,
  spawnEzrealEssenceMarkDetonate,
} from './ezrealEssenceFluxVisual'

export {
  createArcaneShiftMissileVisual,
  spawnEzrealArcaneShiftCast,
  spawnEzrealArcaneShiftMissileHit,
} from './ezrealArcaneShiftVisual'

export {
  EZREAL_R_RELEASE_MS,
  spawnEzrealTrueshotCast,
  spawnEzrealTrueshotDissipate,
} from './ezrealTrueshotVisual'
