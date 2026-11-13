import * as Phaser from 'phaser'
import {
  PLAYER_RADIUS,
  TEXTURE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from '../constants'
import {
  applyExperience,
  STARTING_LEVEL,
  XP_CRYSTAL_VALUE,
  XP_PICKUP_RADIUS,
  xpRequiredForNextLevel,
} from '../experience'
import { REGISTRY_CHOOSE_UPGRADE } from '../gameBridge'
import type { HudListener, LevelUpOffer } from '../hud'
import {
  BASE_PROJECTILE_DAMAGE,
  createInitialCombatStats,
  type PlayerCombatStats,
} from '../playerStats'
import { spawnArenaGroundBase } from '../arena/loadArenaGround'
import { populateArenaDecor } from '../arena/populateArenaDecor'
import {
  spawnArenaEnemy,
  syncArenaEnemyMotionAnim,
  syncEnemyHpBar,
  type ArenaEnemy,
} from '../enemies/enemyFactory'
import { pickOffScreenSpawnAroundPlayer } from '../enemies/pickOffScreenSpawn'
import { tickMinionRangedAttacker } from '../enemies/minionRangedAi'
import {
  spawnMinionEnemyProjectile,
  syncMinionEnemyProjectileTransform,
  type MinionEnemyProjectile,
} from '../enemies/minionEnemyProjectiles'
import {
  applyMinionProjectileVfxFilters,
  loadMinionProjectileVfxAssets,
} from '../enemies/loadMinionProjectileVfx'
import {
  resolveMaxAliveEnemies,
  resolveSpawnIntervalMs,
  SURVIVAL_SPAWN,
} from '../run/survivalRunConfig'
import {
  createBakedMinionAnimations,
  loadBakedMinionSheets,
} from '../../minionPreview/bakedMinionAssets'
import { bakeArenaTextures } from '../textures'
import {
  applyJinxVfxTextureFilters,
  loadJinxVfxAssets,
} from '../vfx/loadJinxVfx'
import {
  applyJinxSpellVfxFilters,
  loadJinxSpellVfxAssets,
} from '../vfx/loadJinxSpellVfx'
import {
  createChomperTrapVisual,
  updateChomperTrapVisualIdle,
  type ChomperTrapVisual,
  createRMissileVisual,
  spawnChomperTriggerVisual,
  spawnRTrailPuff,
  spawnWImpactVisual,
} from '../vfx/jinxSpellVisuals'
import {
  createJinxWProjectileVisual,
  updateJinxWProjectileScroll,
} from '../vfx/jinxWProjectileVisual'
import {
  AHRI_BASIC_ATTACK,
  resolveAhriAttackIntervalMs,
  resolveAhriBasicAttackRange,
  resolveAhriDirectDamage,
  resolveAhriProjectileSpeed,
} from '../combat/ahriBasicAttack'
import {
  effectiveAhriAbilityLevel,
  isAhriAbilityUnlocked,
} from '../combat/ahriAbilityCast'
import {
  createInitialAhriAbilityLevels,
  resolveEStats as resolveAhriEStats,
  resolveQStats,
  resolveRStats as resolveAhriRStats,
  resolveWStats as resolveAhriWStats,
  type AhriAbilityLevels,
  type EAbilityStats as AhriEAbilityStats,
  type RAbilityStats as AhriRAbilityStats,
  type WAbilityStats as AhriWAbilityStats,
} from '../combat/ahriAbilityState'
import {
  createAhriOrbFromStats,
  type AhriOrbProjectile,
} from '../combat/ahriOrb'
import { buildChampionAbilityHud } from '../combat/buildChampionAbilityHud'
import {
  resolveActiveWeaponHudLabel,
  resolveChampionDisplayName,
} from '../combat/championHudLabels'
import { JINX_VFX } from '../vfx/jinxVfxConfig'
import {
  spawnFishbonesExplosion,
  spawnPowPowImpact,
} from '../vfx/jinxImpactVfx'
import {
  createChampionAnimations,
  createChampionPlayerSprite,
  loadActiveChampionAssets,
  syncChampionAnimation,
} from '../champions/championAssets'
import { AHRI_ANIMS } from '../champions/ahri'
import { JINX_ANIMS } from '../champions/jinx'
import { LEESIN_ANIMS } from '../champions/leesin'
import { MISSFORTUNE_ANIMS } from '../champions/missfortune'
import { EZREAL_ANIMS } from '../champions/ezreal'
import { LUX_ANIMS } from '../champions/lux'
import { YASUO_ANIMS } from '../champions/yasuo'
import {
  isYasuoCombatAnimationPlaying,
  playYasuoAttackAnimation,
  playYasuoSteelTempestAnimation,
} from '../champions/yasuoAttackAnim'
import {
  isLeeSinSpellCastAnimationPlaying,
  playLeeSinSpellCastAnimation,
} from '../champions/leeSinSpellAnim'
import {
  isMissFortuneSpellCastAnimationPlaying,
  playMissFortuneSpellCastAnimation,
} from '../champions/missFortuneSpellAnim'
import {
  isEzrealAttackAnimationPlaying,
  playEzrealAttackAnimation,
} from '../champions/ezrealAttackAnim'
import { playEzrealSpellCastAnimation } from '../champions/ezrealSpellAnim'
import {
  isLuxSpellCastAnimationPlaying,
  playLuxSpellCastAnimation,
} from '../champions/luxSpellAnim'
import { LeeSinArenaSystems } from '../combat/leeSinArenaSystems'
import { MissFortuneArenaSystems } from '../combat/missFortuneArenaSystems'
import { EzrealArenaSystems } from '../combat/ezrealArenaSystems'
import { LuxArenaSystems } from '../combat/luxArenaSystems'
import { YasuoArenaSystems } from '../combat/yasuoArenaSystems'
import {
  applyLuxAuthenticVfxFilters,
  loadLuxAuthenticVfx,
} from '../vfx/lux/loadLuxAuthenticVfx'
import { createLuxAuthenticAnims } from '../vfx/lux/luxAuthenticAnims'
import { createLeeSinAuthenticAnims } from '../vfx/leesin/leeSinAuthenticAnims'
import {
  applyLeeSinAuthenticVfxFilters,
  loadLeeSinAuthenticVfx,
} from '../vfx/leesin/loadLeeSinAuthenticVfx'
import { createMissFortuneAuthenticAnims } from '../vfx/missfortune/createMissFortuneAuthenticAnims'
import {
  applyMissFortuneAuthenticVfxFilters,
  loadMissFortuneAuthenticVfx,
} from '../vfx/missfortune/loadMissFortuneAuthenticVfx'
import {
  applyEzrealAuthenticVfxFilters,
  loadEzrealAuthenticVfx,
} from '../vfx/ezreal/loadEzrealAuthenticVfx'
import { createEzrealAuthenticAnims } from '../vfx/ezreal/createEzrealAuthenticAnims'
import {
  applyYasuoAuthenticVfxFilters,
  loadYasuoAuthenticVfx,
} from '../vfx/yasuo/loadYasuoAuthenticVfx'
import { getActiveChampion } from '../champions/registry'
import type { ChampionId } from '../champions/types'
import { simulationDeltaMs } from '../simulationTime'
import { spawnAhriBasicImpact } from '../vfx/ahriImpactVfx'
import { AHRI_SPELL_PARTICLE_VFX } from '../vfx/ahri/ahriAuthenticSpellVfx'
import {
  applyAhriAuthenticVfxFilters,
  loadAhriAuthenticVfx,
} from '../vfx/ahri/loadAhriAuthenticVfx'
import {
  applyAhriQOrbReturnLook,
  spawnAhriQOrbTrailSegment,
  syncAhriQOrbVisualMotion,
  createAhriBasicProjectileVisual,
  type AhriBasicProjectileVisual,
  spawnAhriBaTrailSegment,
  syncAhriBasicProjectileMotion,
  createAhriCharmBoltVisual,
  type AhriCharmBoltVisual,
  type AhriSpiritRushVisual,
  createAhriFoxFireVisual,
  createAhriQOrbVisual,
  createAhriRSpiritBoltVisual,
  createAhriSpiritRushVisual,
  spawnAhriSpiritRushDashBurst,
  spawnAhriSpiritRushTrailSegment,
  syncAhriSpiritRushVisualMotion,
  spawnAhriBaMuzzleFlash,
  spawnAhriCharmCastFlash,
  spawnAhriCharmImpactVisual,
  spawnAhriCharmTrailSegment,
  syncAhriCharmBoltVisualMotion,
  spawnAhriFoxFireImpactVisual,
  spawnAhriFoxFireTrailSegment,
  spawnAhriFoxFireCastGroundAura,
  syncAhriFoxFireVisualMotion,
  type AhriFoxFireVisual,
} from '../vfx/ahri/ahriSpellVisuals'
import {
  JINX_WEAPON_PROFILES,
  otherJinxWeapon,
  resolveAttackIntervalMs,
  resolveBasicAttackRange,
  resolveDirectDamage,
  resolveProjectileSpeed,
  resolveSplashDamage,
  type JinxWeaponId,
} from '../combat/jinxWeapons'
import {
  createInitialJinxAbilityLevels,
  resolveEStats,
  resolveFishbonesBlastMods,
  resolveJinxQSwapCooldownMs,
  resolveRStats,
  resolveWStats,
  type JinxAbilityLevels,
} from '../combat/jinxAbilityState'
import {
  effectiveJinxAbilityLevel,
  isJinxAbilityUnlocked,
} from '../combat/jinxAbilityCast'
import {
  CHOMPERS_PLACED_PER_CAST,
  pickChomperVolleyPositions,
  pickMegaRocketTarget,
} from '../combat/jinxAbilityPlacement'
import {
  abilitySlotFromUpgradeId,
  applyUpgradeChoice,
  createInitialUpgradeRunState,
  pickRandomUpgrades,
  toUpgradeOptionView,
  type UpgradeId,
  type UpgradeOfferContext,
} from '../upgrades'
import { isBalanceRunDebugEnabled } from '../devConfig'
import { addMetaCoins, getMetaProgress } from '../meta/championUnlock'
import { computeRunCoinReward } from '../meta/runCoinReward'
import {
  finalizeBalanceRunRecorder,
  recordBalanceLevelUps,
  resetBalanceRunRecorder,
  tickBalanceRunRecorder,
  getBalanceDebugLive,
  getBalanceRunSummary,
} from '../dev/balanceRunRecorder'

type MoveKeys = {
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
}

type Enemy = ArenaEnemy

type WProjectile = {
  visual: Phaser.GameObjects.Container
  lightningStrip: Phaser.GameObjects.TileSprite | null
  vx: number
  vy: number
  remainingMs: number
  lastDepth: number
  rotation: number
  damage: number
  pierceRemaining: number
  hit: WeakSet<Enemy>
}

type ChomperTrap = {
  visual: ChomperTrapVisual
  damage: number
  triggerRadius: number
  slowMultiplier: number
  slowDurationMs: number
  expiresAt: number
  lastDepth: number
}

type RProjectile = {
  visual: Phaser.GameObjects.Container
  vx: number
  vy: number
  remainingMs: number
  lastDepth: number
  rotation: number
  directDamage: number
  splashDamage: number
  splashRadius: number
  targetX: number
  targetY: number
  hit: WeakSet<Enemy>
  exploded: boolean
}

type Projectile = {
  visual: Phaser.GameObjects.Image | Phaser.GameObjects.Container
  vx: number
  vy: number
  remainingMs: number
  lastDepth: number
  rotation: number
  weapon: JinxWeaponId
  directDamage: number
  splashDamage: number
  splashRadius: number
  ahriBasic?: boolean
  ahriBasicVisual?: AhriBasicProjectileVisual
  baTrailAccumMs?: number
}

type AhriFoxFirePhase = 'orbit' | 'hunt' | 'fade'

type AhriFoxFire = {
  visual: Phaser.GameObjects.Container
  foxVisual: AhriFoxFireVisual
  phase: AhriFoxFirePhase
  vx: number
  vy: number
  remainingMs: number
  lastDepth: number
  damage: number
  hitRadius: number
  hit: WeakSet<Enemy>
  trailAccumMs: number
  orbitMsRemaining: number
  orbitAngleOffset: number
  orbitSpinRad: number
  launchAngle: number
  huntSpeed: number
  fadeMsRemaining: number
  spiritIndex: number
  spiritTotal: number
  /** Enemigo asignado al salir de órbita (-1 = ninguno). */
  huntTargetIndex: number
}

type AhriWFoxSpawnWave = {
  stats: AhriWAbilityStats
  damage: number
  spiritsLeft: number
  nextSpiritIndex: number
  nextSpawnAt: number
}

/** Cast W — órbita, luego hunt solo si hay blanco en rango (~LoL Fox-Fire range). */
const AHRI_W_ORBIT_CAST_MS = 880
const AHRI_W_ORBIT_EXTRA_PER_INDEX_MS = 160
const AHRI_W_ORBIT_RADIUS = 42
const AHRI_W_SPIRIT_STAGGER_MS = 165
const AHRI_W_LAUNCH_RANGE = 580
const AHRI_W_FADE_ORBIT_MS = 1300
const AHRI_E_TRAIL_SEGMENT_MS = 26
const AHRI_E_SPAWN_FORWARD = 22
const AHRI_R_CHARGE_WINDOW_MS = 10_000
const AHRI_R_TRAIL_SEGMENT_MS = 32
const AHRI_R_SPIRIT_BOLT_COUNT = 3
const AHRI_R_SPIRIT_BOLT_RANGE = 560
const AHRI_R_SPIRIT_BOLT_SPEED = 540
const AHRI_R_SPIRIT_BOLT_LIFETIME_MS = 900
const AHRI_R_SPIRIT_BOLT_HIT_RADIUS = 16

type AhriRSpiritBolt = {
  visual: Phaser.GameObjects.Container
  foxVisual: AhriFoxFireVisual
  targetIndex: number
  speed: number
  damage: number
  hitRadius: number
  remainingMs: number
  lastDepth: number
  trailAccumMs: number
}

type AhriActiveSpiritDash = {
  startX: number
  startY: number
  endX: number
  endY: number
  nx: number
  ny: number
  elapsedMs: number
  durationMs: number
  damage: number
  hitRadius: number
  hit: WeakSet<Enemy>
  rushVisual: AhriSpiritRushVisual | null
  trailAccumMs: number
}

type AhriCharmBolt = {
  visual: Phaser.GameObjects.Container
  charmVisual: AhriCharmBoltVisual
  vx: number
  vy: number
  remainingMs: number
  lastDepth: number
  trailAccumMs: number
  trailSegmentIndex: number
  damage: number
  hitRadius: number
  charmDurationMs: number
  slowMultiplier: number
  hit: WeakSet<Enemy>
}

type XpCrystal = {
  visual: Phaser.GameObjects.Image
  value: number
  bobPhase: number
  baseY: number
  lastDepth: number
}

const C_BORDER_OUTER = 0x3d5a2e
const C_BORDER_MID = 0x5b3a29
const C_BORDER_INNER = 0x7c3aed

const PROJECTILE_HIT_RADIUS = 7
const XP_PICKUP_RADIUS_SQ = XP_PICKUP_RADIUS ** 2
const HUD_TICK_MS = 250
/** Tope de proyectiles enemigos activos (evita picos de draw/update). */
const MAX_MINION_PROJECTILES = 48

function distanceSquared(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

type DepthSortable = {
  setDepth: (value: number) => unknown
}

function setDepthFromY(object: DepthSortable, y: number, lastDepth: number) {
  const depth = Math.floor(y)
  if (depth === lastDepth) {
    return lastDepth
  }
  object.setDepth(depth)
  return depth
}

export class ArenaScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | undefined
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined
  private wasd: MoveKeys | undefined
  private onHud: HudListener | undefined

  private startedAt = 0
  private lastHudEmit = 0
  private health = 0
  private kills = 0
  private gameOver = false
  private level = STARTING_LEVEL
  private xp = 0
  private combatStats: PlayerCombatStats = createInitialCombatStats()

  private enemies: Enemy[] = []
  private minionProjectiles: MinionEnemyProjectile[] = []
  private projectiles: Projectile[] = []
  private xpCrystals: XpCrystal[] = []
  private nextSpawnAt = 0
  private nextShotAt = 0
  private invulnerableUntil = 0
  private invulnBlinkOn = false
  private invulnVisualActive = false

  private levelUpQueue: number[] = []
  private currentOfferIds: UpgradeId[] = []
  private upgradePause = false
  private choosingUpgrade = false
  private totalPausedMs = 0
  private pauseStartedAt = 0

  private cachedLevelUpOffer: LevelUpOffer | null = null
  private cachedOfferKey = ''
  private championId: ChampionId = 'jinx'
  private playerAnimKey = JINX_ANIMS.idle
  private activeJinxWeapon: JinxWeaponId = 'powPow'
  private jinxAbilities: JinxAbilityLevels = createInitialJinxAbilityLevels()
  private upgradePickCount = 0
  private wProjectiles: WProjectile[] = []
  private chomperTraps: ChomperTrap[] = []
  private rProjectiles: RProjectile[] = []
  private ahriOrbs: AhriOrbProjectile[] = []
  private ahriFoxFires: AhriFoxFire[] = []
  private ahriWFoxSpawnWave: AhriWFoxSpawnWave | null = null
  private ahriCharmBolts: AhriCharmBolt[] = []
  private ahriRDashesLeft = 0
  private ahriRDashStats: AhriRAbilityStats | null = null
  private ahriRChargeUntil = 0
  private ahriActiveSpiritDash: AhriActiveSpiritDash | null = null
  private ahriRSpiritBolts: AhriRSpiritBolt[] = []
  private ahriAbilities: AhriAbilityLevels = createInitialAhriAbilityLevels()
  private yasuoSystems!: YasuoArenaSystems
  private luxSystems!: LuxArenaSystems
  private leeSinSystems!: LeeSinArenaSystems
  private missFortuneSystems!: MissFortuneArenaSystems
  private ezrealSystems!: EzrealArenaSystems
  private yasuoAbilityHotkeys:
    | {
        q: Phaser.Input.Keyboard.Key
        w: Phaser.Input.Keyboard.Key
        e: Phaser.Input.Keyboard.Key
        r: Phaser.Input.Keyboard.Key
      }
    | undefined
  private luxAbilityHotkeys:
    | {
        q: Phaser.Input.Keyboard.Key
        w: Phaser.Input.Keyboard.Key
        e: Phaser.Input.Keyboard.Key
        r: Phaser.Input.Keyboard.Key
      }
    | undefined
  private leeSinAbilityHotkeys:
    | {
        q: Phaser.Input.Keyboard.Key
        w: Phaser.Input.Keyboard.Key
        e: Phaser.Input.Keyboard.Key
        r: Phaser.Input.Keyboard.Key
      }
    | undefined
  private missFortuneAbilityHotkeys:
    | {
        q: Phaser.Input.Keyboard.Key
        w: Phaser.Input.Keyboard.Key
        e: Phaser.Input.Keyboard.Key
        r: Phaser.Input.Keyboard.Key
      }
    | undefined
  private ezrealAbilityHotkeys:
    | {
        q: Phaser.Input.Keyboard.Key
        w: Phaser.Input.Keyboard.Key
        e: Phaser.Input.Keyboard.Key
        r: Phaser.Input.Keyboard.Key
      }
    | undefined
  private metaRewardGranted = false
  private runCoinReward = 0
  /** Cooldown ends at combat elapsed ms (excludes level-up pause). 0 = ready. */
  private abilityCdEnd = { q: 0, w: 0, e: 0, r: 0 }
  private abilityHotkeys:
    | {
        q: Phaser.Input.Keyboard.Key
        w: Phaser.Input.Keyboard.Key
        e: Phaser.Input.Keyboard.Key
        r: Phaser.Input.Keyboard.Key
      }
    | undefined
  private ahriAbilityHotkeys:
    | {
        q: Phaser.Input.Keyboard.Key
        w: Phaser.Input.Keyboard.Key
        e: Phaser.Input.Keyboard.Key
        r: Phaser.Input.Keyboard.Key
      }
    | undefined
  private rTrailAccumMs = 0

  constructor() {
    super({ key: 'ArenaScene' })
  }

  preload() {
    loadActiveChampionAssets(this)
    if (getActiveChampion().id === 'jinx') {
      loadJinxVfxAssets(this)
      loadJinxSpellVfxAssets(this)
    } else if (getActiveChampion().id === 'ahri') {
      loadAhriAuthenticVfx(this)
    } else if (getActiveChampion().id === 'yasuo') {
      loadYasuoAuthenticVfx(this)
    } else if (getActiveChampion().id === 'lux') {
      loadLuxAuthenticVfx(this)
    } else if (getActiveChampion().id === 'leesin') {
      loadLeeSinAuthenticVfx(this)
    } else if (getActiveChampion().id === 'missfortune') {
      loadMissFortuneAuthenticVfx(this)
    } else if (getActiveChampion().id === 'ezreal') {
      loadEzrealAuthenticVfx(this)
    }
    loadBakedMinionSheets(this)
    loadMinionProjectileVfxAssets(this)
  }

  create() {
    this.onHud = this.registry.get('onHud') as HudListener | undefined
    this.combatStats = createInitialCombatStats()
    this.health = this.combatStats.maxHealth
    this.kills = 0
    this.gameOver = false
    this.level = STARTING_LEVEL
    this.xp = 0
    this.startedAt = this.time.now
    this.lastHudEmit = 0
    this.nextSpawnAt = this.time.now + SURVIVAL_SPAWN.firstDelayMs
    this.nextShotAt = this.time.now + 500
    this.invulnerableUntil = 0
    this.enemies = []
    this.minionProjectiles = []
    this.projectiles = []
    this.xpCrystals = []
    this.levelUpQueue = []
    this.currentOfferIds = []
    this.upgradePause = false
    this.choosingUpgrade = false
    this.totalPausedMs = 0
    this.pauseStartedAt = 0
    this.jinxAbilities = createInitialJinxAbilityLevels()
    this.upgradePickCount = 0
    this.wProjectiles = []
    this.chomperTraps = []
    this.rProjectiles = []
    this.ahriOrbs = []
    this.ahriFoxFires = []
    this.ahriWFoxSpawnWave = null
    this.ahriCharmBolts = []
    this.ahriRDashesLeft = 0
    this.ahriRDashStats = null
    this.ahriRChargeUntil = 0
    this.ahriActiveSpiritDash = null
    this.ahriRSpiritBolts = []
    this.ahriAbilities = createInitialAhriAbilityLevels()
    this.metaRewardGranted = false
    this.runCoinReward = 0
    this.abilityCdEnd = { q: 0, w: 0, e: 0, r: 0 }
    this.rTrailAccumMs = 0
    resetBalanceRunRecorder()

    this.championId = getActiveChampion().id

    this.registry.set(REGISTRY_CHOOSE_UPGRADE, (id: UpgradeId) => {
      this.chooseUpgrade(id)
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.remove(REGISTRY_CHOOSE_UPGRADE)
    })

    bakeArenaTextures(this)
    if (this.championId === 'jinx') {
      applyJinxVfxTextureFilters(this)
      applyJinxSpellVfxFilters(this)
    } else if (this.championId === 'ahri') {
      applyAhriAuthenticVfxFilters(this)
    } else if (this.championId === 'yasuo') {
      applyYasuoAuthenticVfxFilters(this)
    } else if (this.championId === 'lux') {
      applyLuxAuthenticVfxFilters(this)
      createLuxAuthenticAnims(this)
    } else if (this.championId === 'leesin') {
      applyLeeSinAuthenticVfxFilters(this)
      createLeeSinAuthenticAnims(this)
    } else if (this.championId === 'missfortune') {
      applyMissFortuneAuthenticVfxFilters(this)
      createMissFortuneAuthenticAnims(this)
    } else if (this.championId === 'ezreal') {
      applyEzrealAuthenticVfxFilters(this)
      createEzrealAuthenticAnims(this)
    }
    createChampionAnimations(this)
    createBakedMinionAnimations(this)
    applyMinionProjectileVfxFilters(this)
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    spawnArenaGroundBase(this)
    populateArenaDecor(this)
    this.drawWorldBorder()

    const player = createChampionPlayerSprite(
      this,
      WORLD_WIDTH / 2,
      WORLD_HEIGHT / 2,
    )
    player.setDepth(player.y)
    this.player = player
    this.playerAnimKey =
      this.championId === 'ahri'
        ? AHRI_ANIMS.idle
        : this.championId === 'yasuo'
          ? YASUO_ANIMS.idle
          : this.championId === 'lux'
            ? LUX_ANIMS.idle
            : this.championId === 'leesin'
              ? LEESIN_ANIMS.idle
              : this.championId === 'missfortune'
                ? MISSFORTUNE_ANIMS.idle
                : this.championId === 'ezreal'
                  ? EZREAL_ANIMS.idle
                  : JINX_ANIMS.idle

    this.yasuoSystems = new YasuoArenaSystems({
      scene: this,
      getPlayer: () => this.player ?? null,
      getEnemies: () => this.enemies,
      getCombatStats: () => this.combatStats,
      getElapsedMs: (t) => this.getElapsedMs(t),
      isAbilityReady: (slot, t) => this.isAbilityReady(slot, t),
      startAbilityCooldown: (slot, t, ms) => this.startAbilityCooldown(slot, t, ms),
      findNearestEnemyIndex: (range) => this.findNearestEnemyIndex(range),
      damageEnemyAt: (index, damage) => this.damageEnemyAt(index, damage),
      readMoveVector: () => this.readMoveVector(),
      getAbilityHotkeys: () => this.yasuoAbilityHotkeys,
      playBasicAttackAnimation: (nx, ny) => {
        const p = this.player
        if (!p) return
        playYasuoAttackAnimation(p, nx, ny)
      },
      playSteelTempestAnimation: (nx, ny) => {
        const p = this.player
        if (!p) return
        playYasuoSteelTempestAnimation(p, nx, ny)
      },
    })
    if (this.championId === 'yasuo') {
      this.yasuoSystems.reset(this.time.now)
    }

    this.luxSystems = new LuxArenaSystems({
      scene: this,
      getPlayer: () => this.player ?? null,
      getEnemies: () => this.enemies,
      getCombatStats: () => this.combatStats,
      getElapsedMs: (t) => this.getElapsedMs(t),
      isAbilityReady: (slot, t) => this.isAbilityReady(slot, t),
      startAbilityCooldown: (slot, t, ms) => this.startAbilityCooldown(slot, t, ms),
      findNearestEnemyIndex: (range) => this.findNearestEnemyIndex(range),
      damageEnemyAt: (index, damage) => this.damageEnemyAt(index, damage),
      readMoveVector: () => this.readMoveVector(),
      getAbilityHotkeys: () => this.luxAbilityHotkeys,
      playSpellCastAnimation: (slot, nx, ny) => {
        const p = this.player
        if (!p) return
        playLuxSpellCastAnimation(p, nx, ny, slot)
      },
    })
    if (this.championId === 'lux') {
      this.luxSystems.reset(this.time.now)
    }

    this.leeSinSystems = new LeeSinArenaSystems({
      scene: this,
      getPlayer: () => this.player ?? null,
      getEnemies: () => this.enemies,
      getCombatStats: () => this.combatStats,
      getElapsedMs: (t) => this.getElapsedMs(t),
      isAbilityReady: (slot, t) => this.isAbilityReady(slot, t),
      startAbilityCooldown: (slot, t, ms) => this.startAbilityCooldown(slot, t, ms),
      findNearestEnemyIndex: (range) => this.findNearestEnemyIndex(range),
      damageEnemyAt: (index, damage) => this.damageEnemyAt(index, damage),
      readMoveVector: () => this.readMoveVector(),
      getAbilityHotkeys: () => this.leeSinAbilityHotkeys,
      playSpellCastAnimation: (slot, nx, ny) => {
        const p = this.player
        if (!p) return
        playLeeSinSpellCastAnimation(p, nx, ny, slot)
      },
      applyEnemySlow: (enemy, t, durationMs, mult) =>
        this.applyEnemySlow(enemy, t, durationMs, mult),
    })
    if (this.championId === 'leesin') {
      this.leeSinSystems.reset(this.time.now)
    }

    this.missFortuneSystems = new MissFortuneArenaSystems({
      scene: this,
      getPlayer: () => this.player ?? null,
      getEnemies: () => this.enemies,
      getCombatStats: () => this.combatStats,
      isAbilityReady: (slot, t) => this.isAbilityReady(slot, t),
      startAbilityCooldown: (slot, t, ms) => this.startAbilityCooldown(slot, t, ms),
      findNearestEnemyIndex: (range) => this.findNearestEnemyIndex(range),
      damageEnemyAt: (index, damage) => this.damageEnemyAt(index, damage),
      readMoveVector: () => this.readMoveVector(),
      getAbilityHotkeys: () => this.missFortuneAbilityHotkeys,
      playSpellCastAnimation: (slot, nx, ny) => {
        const p = this.player
        if (!p) return
        playMissFortuneSpellCastAnimation(p, nx, ny, slot)
      },
    })
    if (this.championId === 'missfortune') {
      this.missFortuneSystems.reset(this.time.now)
    }

    this.ezrealSystems = new EzrealArenaSystems({
      scene: this,
      getPlayer: () => this.player ?? null,
      getEnemies: () => this.enemies,
      getCombatStats: () => this.combatStats,
      getCombatMs: () => this.getElapsedMs(this.time.now),
      isAbilityReady: (slot, t) => this.isAbilityReady(slot, t),
      startAbilityCooldown: (slot, t, ms) => this.startAbilityCooldown(slot, t, ms),
      findNearestEnemyIndex: (range) => this.findNearestEnemyIndex(range),
      damageEnemyAt: (index, damage) => this.damageEnemyAt(index, damage),
      readMoveVector: () => this.readMoveVector(),
      repositionPlayer: (x, y) => {
        const p = this.player
        if (!p) return
        p.setPosition(x, y)
        p.setDepth(y)
      },
      getAbilityHotkeys: () => this.ezrealAbilityHotkeys,
      playSpellCastAnimation: (slot, nx, ny) => {
        const p = this.player
        if (!p) return
        playEzrealSpellCastAnimation(p, nx, ny, slot)
      },
      playBasicAttackAnimation: (nx, ny) => {
        const p = this.player
        if (!p) return
        playEzrealAttackAnimation(p, nx, ny)
      },
    })
    if (this.championId === 'ezreal') {
      this.ezrealSystems.reset(this.time.now)
    }

    this.activeJinxWeapon = 'powPow'

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
    this.cameras.main.startFollow(player, true, 0.12, 0.12)
    this.cameras.main.centerOn(player.x, player.y)
    this.cameras.main.setZoom(1)
    this.cameras.main.fadeIn(450, 12, 8, 20)

    const keyboard = this.input.keyboard
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys()
      this.wasd = keyboard.addKeys({
        up: 'W',
        down: 'S',
        left: 'A',
        right: 'D',
      }) as MoveKeys
      if (this.championId === 'jinx') {
        this.abilityHotkeys = keyboard.addKeys({
          q: Phaser.Input.Keyboard.KeyCodes.ONE,
          w: Phaser.Input.Keyboard.KeyCodes.TWO,
          e: Phaser.Input.Keyboard.KeyCodes.THREE,
          r: Phaser.Input.Keyboard.KeyCodes.FOUR,
        }) as {
          q: Phaser.Input.Keyboard.Key
          w: Phaser.Input.Keyboard.Key
          e: Phaser.Input.Keyboard.Key
          r: Phaser.Input.Keyboard.Key
        }
        this.ahriAbilityHotkeys = undefined
      } else if (this.championId === 'ahri') {
        this.abilityHotkeys = undefined
        this.ahriAbilityHotkeys = keyboard.addKeys({
          q: Phaser.Input.Keyboard.KeyCodes.ONE,
          w: Phaser.Input.Keyboard.KeyCodes.TWO,
          e: Phaser.Input.Keyboard.KeyCodes.THREE,
          r: Phaser.Input.Keyboard.KeyCodes.FOUR,
        }) as {
          q: Phaser.Input.Keyboard.Key
          w: Phaser.Input.Keyboard.Key
          e: Phaser.Input.Keyboard.Key
          r: Phaser.Input.Keyboard.Key
        }
        this.yasuoAbilityHotkeys = undefined
      } else if (this.championId === 'yasuo') {
        this.abilityHotkeys = undefined
        this.ahriAbilityHotkeys = undefined
        this.yasuoAbilityHotkeys = keyboard.addKeys({
          q: Phaser.Input.Keyboard.KeyCodes.ONE,
          w: Phaser.Input.Keyboard.KeyCodes.TWO,
          e: Phaser.Input.Keyboard.KeyCodes.THREE,
          r: Phaser.Input.Keyboard.KeyCodes.FOUR,
        }) as {
          q: Phaser.Input.Keyboard.Key
          w: Phaser.Input.Keyboard.Key
          e: Phaser.Input.Keyboard.Key
          r: Phaser.Input.Keyboard.Key
        }
        this.luxAbilityHotkeys = undefined
      } else if (this.championId === 'lux') {
        this.abilityHotkeys = undefined
        this.ahriAbilityHotkeys = undefined
        this.yasuoAbilityHotkeys = undefined
        this.leeSinAbilityHotkeys = undefined
        this.luxAbilityHotkeys = keyboard.addKeys({
          q: Phaser.Input.Keyboard.KeyCodes.ONE,
          w: Phaser.Input.Keyboard.KeyCodes.TWO,
          e: Phaser.Input.Keyboard.KeyCodes.THREE,
          r: Phaser.Input.Keyboard.KeyCodes.FOUR,
        }) as {
          q: Phaser.Input.Keyboard.Key
          w: Phaser.Input.Keyboard.Key
          e: Phaser.Input.Keyboard.Key
          r: Phaser.Input.Keyboard.Key
        }
      } else if (this.championId === 'leesin') {
        this.abilityHotkeys = undefined
        this.ahriAbilityHotkeys = undefined
        this.yasuoAbilityHotkeys = undefined
        this.luxAbilityHotkeys = undefined
        this.leeSinAbilityHotkeys = keyboard.addKeys({
          q: Phaser.Input.Keyboard.KeyCodes.ONE,
          w: Phaser.Input.Keyboard.KeyCodes.TWO,
          e: Phaser.Input.Keyboard.KeyCodes.THREE,
          r: Phaser.Input.Keyboard.KeyCodes.FOUR,
        }) as {
          q: Phaser.Input.Keyboard.Key
          w: Phaser.Input.Keyboard.Key
          e: Phaser.Input.Keyboard.Key
          r: Phaser.Input.Keyboard.Key
        }
        this.missFortuneAbilityHotkeys = undefined
      } else if (this.championId === 'missfortune') {
        this.abilityHotkeys = undefined
        this.ahriAbilityHotkeys = undefined
        this.yasuoAbilityHotkeys = undefined
        this.luxAbilityHotkeys = undefined
        this.leeSinAbilityHotkeys = undefined
        this.missFortuneAbilityHotkeys = keyboard.addKeys({
          q: Phaser.Input.Keyboard.KeyCodes.ONE,
          w: Phaser.Input.Keyboard.KeyCodes.TWO,
          e: Phaser.Input.Keyboard.KeyCodes.THREE,
          r: Phaser.Input.Keyboard.KeyCodes.FOUR,
        }) as {
          q: Phaser.Input.Keyboard.Key
          w: Phaser.Input.Keyboard.Key
          e: Phaser.Input.Keyboard.Key
          r: Phaser.Input.Keyboard.Key
        }
        this.ezrealAbilityHotkeys = undefined
      } else if (this.championId === 'ezreal') {
        this.abilityHotkeys = undefined
        this.ahriAbilityHotkeys = undefined
        this.yasuoAbilityHotkeys = undefined
        this.luxAbilityHotkeys = undefined
        this.leeSinAbilityHotkeys = undefined
        this.missFortuneAbilityHotkeys = undefined
        this.ezrealAbilityHotkeys = keyboard.addKeys({
          q: Phaser.Input.Keyboard.KeyCodes.ONE,
          w: Phaser.Input.Keyboard.KeyCodes.TWO,
          e: Phaser.Input.Keyboard.KeyCodes.THREE,
          r: Phaser.Input.Keyboard.KeyCodes.FOUR,
        }) as {
          q: Phaser.Input.Keyboard.Key
          w: Phaser.Input.Keyboard.Key
          e: Phaser.Input.Keyboard.Key
          r: Phaser.Input.Keyboard.Key
        }
      }
    }

    this.emitHud(this.time.now, true)
  }

  update(time: number, delta: number) {
    const player = this.player

    if (!player?.body) {
      return
    }

    const simDelta = simulationDeltaMs(delta)

    if (!this.gameOver && !this.upgradePause) {
      const yasuoAttacking =
        this.championId === 'yasuo' && isYasuoCombatAnimationPlaying(player)
      const luxCasting =
        this.championId === 'lux' && isLuxSpellCastAnimationPlaying(player)
      const leesinCasting =
        this.championId === 'leesin' && isLeeSinSpellCastAnimationPlaying(player)
      const mfCasting =
        this.championId === 'missfortune' && isMissFortuneSpellCastAnimationPlaying(player)
      const ezrealCasting =
        this.championId === 'ezreal' && isEzrealAttackAnimationPlaying(player)
      const dashing =
        (this.championId === 'ahri' && this.ahriActiveSpiritDash) ||
        (this.championId === 'yasuo' && this.yasuoSystems.isMovementLocked()) ||
        (this.championId === 'leesin' && this.leeSinSystems.isMovementLocked()) ||
        (this.championId === 'missfortune' && this.missFortuneSystems.isMovementLocked())
      const velocity = dashing ? { x: 0, y: 0 } : this.readMoveVector()
      player.setVelocity(velocity.x, velocity.y)

      if (!yasuoAttacking && !luxCasting && !leesinCasting && !mfCasting && !ezrealCasting) {
        if (dashing) {
          let animVx = 0
          let animVy = 0
          if (this.championId === 'ahri' && this.ahriActiveSpiritDash) {
            animVx = this.ahriActiveSpiritDash.nx * this.combatStats.moveSpeed
            animVy = this.ahriActiveSpiritDash.ny * this.combatStats.moveSpeed
          } else if (this.championId === 'yasuo') {
            const face = this.yasuoSystems.getDashFacing()
            if (face) {
              animVx = face.nx * this.combatStats.moveSpeed
              animVy = face.ny * this.combatStats.moveSpeed
            }
          }
          this.playerAnimKey = syncChampionAnimation(
            player,
            animVx,
            animVy,
            this.playerAnimKey,
          )
        } else {
          this.playerAnimKey = syncChampionAnimation(
            player,
            velocity.x,
            velocity.y,
            this.playerAnimKey,
          )
        }
      }

      if (time < this.invulnerableUntil) {
        if (!this.invulnVisualActive) {
          this.invulnVisualActive = true
          player.setTint(0xff6b9a)
        }
        const blinkOn = Math.floor(time / 90) % 2 === 0
        if (blinkOn !== this.invulnBlinkOn) {
          this.invulnBlinkOn = blinkOn
          player.setAlpha(blinkOn ? 0.45 : 1)
        }
      } else if (this.invulnVisualActive) {
        this.invulnVisualActive = false
        this.invulnBlinkOn = false
        player.setAlpha(1)
        player.clearTint()
      }

      player.setDepth(player.y)

      this.updateEnemies(time, simDelta)
      this.updateMinionProjectiles(time, simDelta)

      if (this.gameOver) {
        player.setVelocity(0, 0)
      } else {
        this.spawnEnemies(time)
        if (
          this.championId === 'jinx' &&
          !isJinxAbilityUnlocked(this.jinxAbilities.q) &&
          this.activeJinxWeapon !== 'powPow'
        ) {
          this.activeJinxWeapon = 'powPow'
        }
        this.autoAttack(time)
        if (this.championId === 'jinx') {
          this.handleAbilityHotkeys(time)
        } else if (this.championId === 'ahri') {
          this.handleAhriAbilityHotkeys(time)
        } else if (this.championId === 'yasuo') {
          this.yasuoSystems.handleHotkeys(time)
          this.yasuoSystems.update(time, simDelta)
        } else if (this.championId === 'lux') {
          this.luxSystems.handleHotkeys(time)
          this.luxSystems.update(time, simDelta)
        } else if (this.championId === 'leesin') {
          this.leeSinSystems.handleHotkeys(time)
          this.leeSinSystems.update(time, simDelta)
        } else if (this.championId === 'missfortune') {
          this.missFortuneSystems.handleHotkeys(time)
          this.missFortuneSystems.update(time, simDelta)
        } else if (this.championId === 'ezreal') {
          this.ezrealSystems.handleHotkeys(time)
          this.ezrealSystems.update(time, simDelta)
        }
        this.updateProjectiles(simDelta)
        if (this.championId === 'ahri') {
          this.updateAhriOrbs(simDelta)
          this.updateAhriWFoxSpawnQueue(time)
          this.updateAhriFoxFires(simDelta)
          this.updateAhriCharmBolts(time, simDelta)
          this.updateAhriSpiritRush(time, simDelta)
          this.updateAhriRSpiritBolts(simDelta)
        }
        if (this.championId === 'jinx') {
          this.updateWProjectiles(simDelta)
          this.updateChomperTraps(time, simDelta)
          this.updateRProjectiles(simDelta)
        }
        this.updateXpCrystals(simDelta)
      }
    } else {
      player.setVelocity(0, 0)
      if (this.upgradePause) {
        player.setAlpha(1)
        player.clearTint()
      }
    }

    if (!this.upgradePause && time - this.lastHudEmit >= HUD_TICK_MS) {
      this.emitHud(time)
    }
  }

  private updateEnemies(time: number, delta: number) {
    const player = this.player
    if (!player) return

    const step = delta / 1000
    const combatMs = this.getElapsedMs(time)

    for (const enemy of this.enemies) {
      const dx = player.x - enemy.visual.x
      const dy = player.y - enemy.visual.y
      const distSq = dx * dx + dy * dy
      const distance = distSq > 0 ? Math.sqrt(distSq) : 0

      if (time >= enemy.slowUntil) {
        enemy.slowMultiplier = 1
      }
      if (time >= enemy.charmedUntil) {
        enemy.charmedUntil = 0
      }

      const charmed = time < enemy.charmedUntil
      const moveSpeed =
        enemy.speed *
        (time < enemy.slowUntil ? enemy.slowMultiplier : 1)

      const attackerProfile = charmed ? null : enemy.attackerProfile
      if (attackerProfile) {
        tickMinionRangedAttacker(
          enemy,
          attackerProfile,
          combatMs,
          step,
          moveSpeed,
          player.x,
          player.y,
          (req) => {
            if (this.minionProjectiles.length >= MAX_MINION_PROJECTILES) {
              const oldest = this.minionProjectiles.shift()
              oldest?.visual.destroy()
            }
            this.minionProjectiles.push(
              spawnMinionEnemyProjectile(
                this,
                req.fromX,
                req.fromY,
                req.targetX,
                req.targetY,
                req.profile,
                enemy.minionKind,
                req.depth,
              ),
            )
          },
        )
        enemy.lastDepth = setDepthFromY(
          enemy.visual,
          enemy.visual.y,
          enemy.lastDepth,
        )
      } else if (charmed) {
        if (distance > 0) {
          enemy.visual.x += (dx / distance) * moveSpeed * step
          enemy.visual.y += (dy / distance) * moveSpeed * step
          enemy.lastDepth = setDepthFromY(
            enemy.visual,
            enemy.visual.y,
            enemy.lastDepth,
          )
          syncArenaEnemyMotionAnim(enemy, dx, dy, distance)
        }
      } else if (distance > 0) {
        enemy.visual.x += (dx / distance) * moveSpeed * step
        enemy.visual.y += (dy / distance) * moveSpeed * step
        enemy.lastDepth = setDepthFromY(
          enemy.visual,
          enemy.visual.y,
          enemy.lastDepth,
        )
        syncArenaEnemyMotionAnim(enemy, dx, dy, distance)
      } else {
        syncArenaEnemyMotionAnim(enemy, 0, 0, 0)
      }

      if (!attackerProfile) {
        const touchRadius = PLAYER_RADIUS + enemy.radius
        if (
          distSq < touchRadius * touchRadius &&
          time >= this.invulnerableUntil
        ) {
          this.applyPlayerContactDamage(time, 10)
        }
      }
    }
  }

  private applyPlayerContactDamage(time: number, amount: number) {
    const player = this.player
    if (!player || time < this.invulnerableUntil) {
      return
    }
    this.health = Math.max(0, this.health - amount)
    this.invulnerableUntil = time + 800

    if (this.health <= 0) {
      this.gameOver = true
      player.setVelocity(0, 0)
      this.cancelLevelUpFlow(time)
      this.clearMinionProjectiles()
      this.grantMetaRewardOnGameOver()
    }

    this.emitHud(time, true)
  }

  private clearMinionProjectiles() {
    for (const p of this.minionProjectiles) {
      p.visual.destroy()
    }
    this.minionProjectiles = []
  }

  private updateMinionProjectiles(time: number, delta: number) {
    const player = this.player
    if (!player || this.gameOver) {
      return
    }

    const step = delta / 1000
    const pad = 32

    for (let i = this.minionProjectiles.length - 1; i >= 0; i -= 1) {
      const p = this.minionProjectiles[i]
      if (!p) {
        this.minionProjectiles.splice(i, 1)
        continue
      }
      p.x += p.vx * step
      p.y += p.vy * step
      syncMinionEnemyProjectileTransform(p)
      p.remainingMs -= delta

      if (
        this.championId === 'yasuo' &&
        this.yasuoSystems.blocksProjectileAt(p.x, p.y)
      ) {
        p.visual.destroy()
        this.minionProjectiles.splice(i, 1)
        continue
      }

      if (!p.didHitPlayer && time >= this.invulnerableUntil) {
        const hitR = PLAYER_RADIUS + p.hitRadius
        const dSq = distanceSquared(p.x, p.y, player.x, player.y)
        if (dSq < hitR * hitR) {
          p.didHitPlayer = true
          this.applyPlayerContactDamage(time, p.damage)
          if (this.gameOver) {
            return
          }
          p.visual.destroy()
          this.minionProjectiles.splice(i, 1)
          continue
        }
      }

      if (
        p.remainingMs <= 0 ||
        p.x < -pad ||
        p.x > WORLD_WIDTH + pad ||
        p.y < -pad ||
        p.y > WORLD_HEIGHT + pad
      ) {
        p.visual.destroy()
        this.minionProjectiles.splice(i, 1)
      }
    }
  }

  private spawnEnemies(time: number) {
    const combatMs = this.getElapsedMs(time)
    const maxAlive = resolveMaxAliveEnemies(combatMs)
    if (time < this.nextSpawnAt || this.enemies.length >= maxAlive) {
      return
    }

    this.nextSpawnAt = time + resolveSpawnIntervalMs(combatMs)

    const player = this.player
    if (!player) return

    const { x, y } = pickOffScreenSpawnAroundPlayer(this, player.x, player.y)

    this.enemies.push(spawnArenaEnemy(this, x, y))
  }

  private trySwapJinxWeapon(time: number): boolean {
    if (!isJinxAbilityUnlocked(this.jinxAbilities.q)) {
      return false
    }
    if (!this.isAbilityReady('q', time)) {
      return false
    }
    this.activeJinxWeapon = otherJinxWeapon(this.activeJinxWeapon)
    const qLevel = effectiveJinxAbilityLevel(this.jinxAbilities.q)
    this.startAbilityCooldown('q', time, resolveJinxQSwapCooldownMs(qLevel))
    return true
  }

  private findNearestEnemyIndex(maxRange?: number): number {
    const player = this.player
    if (!player || this.enemies.length === 0) {
      return -1
    }

    const maxRangeSq =
      maxRange !== undefined ? maxRange * maxRange : undefined

    let bestIndex = -1
    let closestDistance = Number.POSITIVE_INFINITY

    for (let i = 0; i < this.enemies.length; i += 1) {
      const enemy = this.enemies[i]
      const distanceSq = distanceSquared(
        player.x,
        player.y,
        enemy.visual.x,
        enemy.visual.y,
      )

      if (maxRangeSq !== undefined && distanceSq > maxRangeSq) {
        continue
      }

      if (distanceSq < closestDistance) {
        closestDistance = distanceSq
        bestIndex = i
      }
    }

    return bestIndex
  }

  /** Índices de enemigos en rango, del más cercano al más lejano (respecto a Ahri). */
  private findEnemyIndicesInRange(maxRange: number): number[] {
    const player = this.player
    if (!player || this.enemies.length === 0) {
      return []
    }
    const maxRangeSq = maxRange * maxRange
    const ranked: { index: number; distSq: number }[] = []
    for (let i = 0; i < this.enemies.length; i += 1) {
      const enemy = this.enemies[i]
      const distSq = distanceSquared(
        player.x,
        player.y,
        enemy.visual.x,
        enemy.visual.y,
      )
      if (distSq <= maxRangeSq) {
        ranked.push({ index: i, distSq })
      }
    }
    ranked.sort((a, b) => a.distSq - b.distSq)
    return ranked.map((r) => r.index)
  }

  /** Un solo blanco en rango → todos los espíritus; si no, reparto por cercanía. */
  private pickAhriFoxTargetIndex(spiritIndex: number): number {
    const inRange = this.findEnemyIndicesInRange(AHRI_W_LAUNCH_RANGE)
    if (inRange.length === 0) {
      return -1
    }
    if (inRange.length === 1) {
      return inRange[0]
    }
    return inRange[spiritIndex % inRange.length]
  }

  private resolveAhriFoxHuntTarget(fox: AhriFoxFire): number {
    if (
      fox.huntTargetIndex >= 0 &&
      fox.huntTargetIndex < this.enemies.length
    ) {
      return fox.huntTargetIndex
    }
    return this.findNearestEnemyIndex()
  }

  private autoAttack(time: number) {
    if (time < this.nextShotAt || this.enemies.length === 0) {
      return
    }

    const player = this.player
    if (!player) return

    if (this.championId === 'ahri') {
      this.autoAttackAhri(time, player)
      return
    }
    if (this.championId === 'yasuo') {
      this.yasuoSystems.autoAttack(time)
      return
    }
    if (this.championId === 'lux') {
      this.luxSystems.autoAttack(time)
      return
    }
    if (this.championId === 'leesin') {
      this.leeSinSystems.autoAttack(time)
      return
    }
    if (this.championId === 'missfortune') {
      this.missFortuneSystems.autoAttack(time)
      return
    }
    if (this.championId === 'ezreal') {
      this.ezrealSystems.autoAttack(time)
      return
    }

    const weapon = this.activeJinxWeapon
    const attackRange = resolveBasicAttackRange(this.combatStats, weapon)
    const targetIndex = this.findNearestEnemyIndex(attackRange)
    if (targetIndex < 0) {
      return
    }

    const target = this.enemies[targetIndex]
    const profile = JINX_WEAPON_PROFILES[weapon]

    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const baseAngle = Math.atan2(dy, dx)
    const count = this.combatStats.projectileCount
    const spread = profile.spreadRadians

    for (let i = 0; i < count; i += 1) {
      const offset = count === 1 ? 0 : (i - (count - 1) / 2) * spread
      const angle = baseAngle + offset
      this.spawnProjectile(
        player.x,
        player.y,
        Math.cos(angle),
        Math.sin(angle),
        player.y + 2,
        angle,
        weapon,
      )
    }

    this.spawnMuzzleFlash(
      player.x,
      player.y,
      baseAngle,
      player.y + 3,
      weapon,
    )
    this.nextShotAt = time + resolveAttackIntervalMs(this.combatStats, weapon)
  }

  private autoAttackAhri(
    time: number,
    player: Phaser.Physics.Arcade.Sprite,
  ) {
    const attackRange = resolveAhriBasicAttackRange(this.combatStats)
    const targetIndex = this.findNearestEnemyIndex(attackRange)
    if (targetIndex < 0) {
      return
    }

    const target = this.enemies[targetIndex]
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const baseAngle = Math.atan2(dy, dx)
    const count = this.combatStats.projectileCount
    const spread = AHRI_BASIC_ATTACK.spreadRadians

    for (let i = 0; i < count; i += 1) {
      const offset = count === 1 ? 0 : (i - (count - 1) / 2) * spread
      const angle = baseAngle + offset
      const muzzleX = player.x + Math.cos(angle) * 14
      const muzzleY = player.y + Math.sin(angle) * 14
      spawnAhriBaMuzzleFlash(this, muzzleX, muzzleY, angle, player.y + 2)
      this.spawnAhriBasicProjectile(
        muzzleX,
        muzzleY,
        Math.cos(angle),
        Math.sin(angle),
        player.y + 2,
        angle,
      )
    }

    this.nextShotAt = time + resolveAhriAttackIntervalMs(this.combatStats)
  }

  private spawnAhriBasicProjectile(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    depth: number,
    angle: number,
  ) {
    const length = Math.hypot(dirX, dirY) || 1
    const nx = dirX / length
    const ny = dirY / length
    const speed = resolveAhriProjectileSpeed(this.combatStats)

    const baked = createAhriBasicProjectileVisual(this, x, y, angle, depth)
    const visual =
      baked?.root ??
      (() => {
        const fallback = this.add.image(x, y, AHRI_BASIC_ATTACK.textureKey)
        fallback.setOrigin(0.5, 0.5)
        fallback.setRotation(angle)
        fallback.setDepth(depth)
        fallback.setScale(0.95)
        fallback.setAlpha(0.94)
        return fallback
      })()

    this.projectiles.push({
      visual,
      vx: nx * speed,
      vy: ny * speed,
      remainingMs: AHRI_BASIC_ATTACK.lifetimeMs,
      lastDepth: Math.floor(depth),
      rotation: angle,
      weapon: 'powPow',
      directDamage: resolveAhriDirectDamage(this.combatStats),
      splashDamage: 0,
      splashRadius: 0,
      ahriBasic: true,
      ahriBasicVisual: baked ?? undefined,
      baTrailAccumMs: 0,
    })
  }

  private spawnProjectile(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    depth: number,
    angle: number,
    weapon: JinxWeaponId,
  ) {
    const profile = JINX_WEAPON_PROFILES[weapon]
    const length = Math.hypot(dirX, dirY) || 1
    const nx = dirX / length
    const ny = dirY / length
    const speed = resolveProjectileSpeed(this.combatStats, weapon)

    const visual = this.add.image(x, y, profile.textureKey)
    visual.setOrigin(0.5, 0.5)
    visual.setRotation(angle)
    visual.setDepth(depth)
    visual.setScale(profile.visualScale)

    const blast = resolveFishbonesBlastMods(
      effectiveJinxAbilityLevel(this.jinxAbilities.q),
    )
    const splashRadius =
      weapon === 'fishbones'
        ? profile.splashRadius * blast.radiusMult
        : profile.splashRadius
    const splashDamage =
      weapon === 'fishbones'
        ? resolveSplashDamage(this.combatStats, weapon) * blast.damageMult
        : resolveSplashDamage(this.combatStats, weapon)

    this.projectiles.push({
      visual,
      vx: nx * speed,
      vy: ny * speed,
      remainingMs: profile.lifetimeMs,
      lastDepth: Math.floor(depth),
      rotation: angle,
      weapon,
      directDamage: resolveDirectDamage(this.combatStats, weapon),
      splashDamage,
      splashRadius,
    })
  }

  private spawnMuzzleFlash(
    x: number,
    y: number,
    angle: number,
    depth: number,
    weapon: JinxWeaponId,
  ) {
    const profile = JINX_WEAPON_PROFILES[weapon]
    if (!this.textures.exists(JINX_VFX.muzzleFlash)) {
      return
    }
    const flash = this.add.image(x, y, JINX_VFX.muzzleFlash)
    flash.setOrigin(0.5, 0.5)
    flash.setRotation(angle)
    flash.setDepth(depth + 1)
    flash.setScale(profile.muzzleFlashScale)
    flash.setAlpha(0.88)
    flash.setBlendMode(Phaser.BlendModes.ADD)

    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: profile.muzzleFlashScale * 1.3,
      duration: weapon === 'fishbones' ? 110 : 85,
      onComplete: () => flash.destroy(),
    })
  }

  private getUpgradeOfferContext(): UpgradeOfferContext {
    return {
      championId: this.championId,
      stats: this.combatStats,
      abilities: this.jinxAbilities,
      ahriAbilities: this.ahriAbilities,
      luxAbilities: this.luxSystems.getAbilities(),
      missFortuneAbilities: this.missFortuneSystems.getAbilities(),
      ezrealAbilities: this.ezrealSystems.getAbilities(),
      leeSinAbilities: this.leeSinSystems.getAbilities(),
      yasuoAbilities: this.yasuoSystems.getAbilities(),
      upgradePickCount: this.upgradePickCount,
      playerLevel: this.level,
    }
  }

  private buildUpgradeRunState() {
    return createInitialUpgradeRunState(this.combatStats, this.health)
  }

  private syncUpgradeRunState(state: ReturnType<typeof applyUpgradeChoice>) {
    this.combatStats = state.stats
    this.health = state.health
    this.jinxAbilities = state.abilities
    this.ahriAbilities = state.ahriAbilities
    this.luxSystems.setAbilities(state.luxAbilities)
    this.missFortuneSystems.setAbilities(state.missFortuneAbilities)
    this.ezrealSystems.setAbilities(state.ezrealAbilities)
    this.leeSinSystems.setAbilities(state.leeSinAbilities)
    this.yasuoSystems.setAbilities(state.yasuoAbilities)
  }

  private grantMetaRewardOnGameOver() {
    if (this.metaRewardGranted) {
      return
    }
    this.metaRewardGranted = true
    const earned = computeRunCoinReward(this.kills, this.getElapsedMs(this.time.now))
    this.runCoinReward = earned
    addMetaCoins(earned)
  }

  private enemyPoints() {
    return this.enemies.map((e) => ({
      x: e.visual.x,
      y: e.visual.y,
    }))
  }

  private applyEnemySlow(enemy: Enemy, time: number, durationMs: number, mult: number) {
    enemy.slowUntil = Math.max(enemy.slowUntil, time + durationMs)
    enemy.slowMultiplier = Math.min(enemy.slowMultiplier, mult)
  }

  private handleAbilityHotkeys(time: number) {
    const keys = this.abilityHotkeys
    if (!keys || this.upgradePause || this.gameOver) {
      return
    }

    if (Phaser.Input.Keyboard.JustDown(keys.q)) {
      this.trySwapJinxWeapon(time)
    }
    if (Phaser.Input.Keyboard.JustDown(keys.w)) {
      this.tryCastW(time)
    }
    if (Phaser.Input.Keyboard.JustDown(keys.e)) {
      this.tryCastE(time)
    }
    if (Phaser.Input.Keyboard.JustDown(keys.r)) {
      this.tryCastR(time)
    }
  }

  private handleAhriAbilityHotkeys(time: number) {
    if (this.upgradePause || this.gameOver) {
      return
    }
    const keys = this.ahriAbilityHotkeys
    if (!keys) return
    if (Phaser.Input.Keyboard.JustDown(keys.q)) {
      this.tryCastAhriQ(time)
    }
    if (Phaser.Input.Keyboard.JustDown(keys.w)) {
      this.tryCastAhriW(time)
    }
    if (Phaser.Input.Keyboard.JustDown(keys.e)) {
      this.tryCastAhriE(time)
    }
    if (Phaser.Input.Keyboard.JustDown(keys.r)) {
      this.tryCastAhriR(time)
    }
  }

  private isAbilityReady(slot: 'q' | 'w' | 'e' | 'r', time: number) {
    return this.getElapsedMs(time) >= this.abilityCdEnd[slot]
  }

  private startAbilityCooldown(slot: 'q' | 'w' | 'e' | 'r', time: number, cooldownMs: number) {
    this.abilityCdEnd[slot] = this.getElapsedMs(time) + cooldownMs
  }

  private tryCastAhriQ(time: number): boolean {
    if (!isAhriAbilityUnlocked(this.ahriAbilities.q)) {
      return false
    }
    const stats = resolveQStats(effectiveAhriAbilityLevel(this.ahriAbilities.q))
    if (!stats || !this.isAbilityReady('q', time)) {
      return false
    }
    if (!this.fireAhriOrb(stats)) {
      return false
    }
    this.startAbilityCooldown('q', time, stats.cooldownMs)
    return true
  }

  private fireAhriOrb(
    stats: NonNullable<ReturnType<typeof resolveQStats>>,
  ): boolean {
    const player = this.player
    if (!player) return false

    let dirX = 1
    let dirY = 0
    const idx = this.findNearestEnemyIndex()
    if (idx >= 0) {
      const target = this.enemies[idx]
      dirX = target.visual.x - player.x
      dirY = target.visual.y - player.y
    }
    const len = Math.hypot(dirX, dirY) || 1
    dirX /= len
    dirY /= len

    const orbSpec = createAhriOrbFromStats(stats)
    const damage =
      orbSpec.damage *
      (this.combatStats.projectileDamage / BASE_PROJECTILE_DAMAGE)

    const qVisual = createAhriQOrbVisual(
      this,
      player.x,
      player.y,
      player.y + 2,
      'out',
    )
    if (!qVisual) {
      return false
    }

    this.ahriOrbs.push({
      visual: qVisual.root,
      qVisual,
      phase: 'out',
      vx: dirX * orbSpec.speed,
      vy: dirY * orbSpec.speed,
      speed: orbSpec.speed,
      remainingMs: orbSpec.remainingMs,
      lastDepth: Math.floor(player.y + 2),
      damage,
      hitRadius: orbSpec.hitRadius,
      hit: new WeakSet(),
      homeX: player.x,
      homeY: player.y,
      trailAccumMs: 0,
    })
    return true
  }

  private updateAhriOrbs(delta: number) {
    const player = this.player
    if (!player) return

    const step = delta / 1000
    const timeMs = this.time.now
    for (let i = this.ahriOrbs.length - 1; i >= 0; i -= 1) {
      const orb = this.ahriOrbs[i]
      orb.remainingMs -= delta

      if (orb.phase === 'return') {
        const dx = player.x - orb.visual.x
        const dy = player.y - orb.visual.y
        const dist = Math.hypot(dx, dy) || 1
        orb.vx = (dx / dist) * orb.speed
        orb.vy = (dy / dist) * orb.speed
        if (dist < 18) {
          orb.visual.destroy()
          this.ahriOrbs.splice(i, 1)
          continue
        }
      } else if (orb.remainingMs <= 0 && orb.phase === 'out') {
        orb.phase = 'return'
        orb.hit = new WeakSet()
        applyAhriQOrbReturnLook(orb.qVisual)
        orb.speed =
          resolveQStats(effectiveAhriAbilityLevel(this.ahriAbilities.q))
            ?.returnSpeed ?? orb.speed
        orb.remainingMs = 900
        const dx = player.x - orb.visual.x
        const dy = player.y - orb.visual.y
        const dist = Math.hypot(dx, dy) || 1
        orb.vx = (dx / dist) * orb.speed
        orb.vy = (dy / dist) * orb.speed
      }

      orb.visual.x += orb.vx * step
      orb.visual.y += orb.vy * step
      orb.lastDepth = setDepthFromY(orb.visual, orb.visual.y, orb.lastDepth)

      syncAhriQOrbVisualMotion(orb.qVisual, orb.vx, orb.vy, timeMs)

      orb.trailAccumMs += delta
      if (orb.trailAccumMs >= 42) {
        orb.trailAccumMs = 0
        const trailAngle = Math.atan2(orb.vy, orb.vx)
        const backX = orb.visual.x - Math.cos(trailAngle) * 10
        const backY = orb.visual.y - Math.sin(trailAngle) * 10
        spawnAhriQOrbTrailSegment(
          this,
          backX,
          backY,
          trailAngle,
          orb.visual.y,
          orb.qVisual.phase,
        )
      }

      for (let j = 0; j < this.enemies.length; j += 1) {
        const enemy = this.enemies[j]
        if (orb.hit.has(enemy)) continue
        const hitR = enemy.radius + orb.hitRadius
        if (
          distanceSquared(
            orb.visual.x,
            orb.visual.y,
            enemy.visual.x,
            enemy.visual.y,
          ) <
          hitR * hitR
        ) {
          orb.hit.add(enemy)
          this.damageEnemyAt(j, orb.damage)
          spawnAhriBasicImpact(this, orb.visual.x, orb.visual.y, orb.visual.y)
        }
      }

      if (
        orb.remainingMs <= 0 ||
        orb.visual.x < -40 ||
        orb.visual.x > WORLD_WIDTH + 40 ||
        orb.visual.y < -40 ||
        orb.visual.y > WORLD_HEIGHT + 40
      ) {
        orb.visual.destroy()
        this.ahriOrbs.splice(i, 1)
      }
    }
  }

  private applyAhriCharm(
    enemy: Enemy,
    time: number,
    durationMs: number,
    slowMultiplier: number,
  ) {
    enemy.charmedUntil = Math.max(enemy.charmedUntil, time + durationMs)
    this.applyEnemySlow(enemy, time, durationMs, slowMultiplier)
    enemy.windupEndCombatMs = 0
  }

  private tryCastAhriW(time: number): boolean {
    if (!isAhriAbilityUnlocked(this.ahriAbilities.w)) return false
    const stats = resolveAhriWStats(
      effectiveAhriAbilityLevel(this.ahriAbilities.w),
    )
    if (!stats || !this.isAbilityReady('w', time)) return false
    if (!this.fireAhriFoxFire(stats)) return false
    this.startAbilityCooldown('w', time, stats.cooldownMs)
    return true
  }

  private tryCastAhriE(time: number): boolean {
    if (!isAhriAbilityUnlocked(this.ahriAbilities.e)) return false
    const stats = resolveAhriEStats(
      effectiveAhriAbilityLevel(this.ahriAbilities.e),
    )
    if (!stats || !this.isAbilityReady('e', time)) return false
    if (!this.fireAhriCharmBolt(stats)) return false
    this.startAbilityCooldown('e', time, stats.cooldownMs)
    return true
  }

  private tryCastAhriR(time: number): boolean {
    if (!isAhriAbilityUnlocked(this.ahriAbilities.r)) return false
    if (this.ahriActiveSpiritDash) return false

    if (this.ahriRDashesLeft > 0 && this.ahriRDashStats) {
      return this.beginAhriSpiritDash(time)
    }

    const stats = resolveAhriRStats(
      effectiveAhriAbilityLevel(this.ahriAbilities.r),
    )
    if (!stats || !this.isAbilityReady('r', time)) return false
    this.ahriRDashStats = stats
    this.ahriRDashesLeft = stats.dashCount
    this.ahriRChargeUntil = time + AHRI_R_CHARGE_WINDOW_MS
    this.startAbilityCooldown('r', time, stats.cooldownMs)
    return this.beginAhriSpiritDash(time)
  }

  private fireAhriFoxFire(stats: AhriWAbilityStats): boolean {
    const player = this.player
    if (!player) return false

    const dmgScale =
      this.combatStats.projectileDamage / BASE_PROJECTILE_DAMAGE
    const damage = stats.damage * dmgScale

    this.ahriWFoxSpawnWave = {
      stats,
      damage,
      spiritsLeft: stats.spiritCount,
      nextSpiritIndex: 0,
      nextSpawnAt: this.time.now,
    }

    spawnAhriFoxFireCastGroundAura(this, player.x, player.y, player.y + 1)

    if (this.textures.exists(AHRI_SPELL_PARTICLE_VFX.wRingflare)) {
      const ring = this.add.image(
        player.x,
        player.y,
        AHRI_SPELL_PARTICLE_VFX.wRingflare,
      )
      ring.setOrigin(0.5, 0.5)
      ring.setDepth(player.y + 3)
      ring.setScale(0.15)
      ring.setAlpha(0.75)
      ring.setTint(0x38bdf8)
      ring.setBlendMode(Phaser.BlendModes.ADD)
      this.tweens.add({
        targets: ring,
        alpha: 0,
        scale: 0.28,
        duration: 220,
        onComplete: () => ring.destroy(),
      })
    }

    return true
  }

  private spawnOneAhriFoxSpirit(wave: AhriWFoxSpawnWave) {
    const player = this.player
    if (!player) return

    const i = wave.nextSpiritIndex
    const total = wave.stats.spiritCount
    const variant = i % 2 === 1 ? 'alt' : 'primary'
    const foxVisual = createAhriFoxFireVisual(
      this,
      player.x,
      player.y,
      player.y + 2,
      variant,
    )
    if (!foxVisual) {
      return
    }

    const orbitOffset =
      total <= 1 ? 0 : (i / total) * Math.PI * 2 - Math.PI / 2

    foxVisual.root.setPosition(
      player.x + Math.cos(orbitOffset) * AHRI_W_ORBIT_RADIUS,
      player.y + Math.sin(orbitOffset) * AHRI_W_ORBIT_RADIUS * 0.88,
    )
    foxVisual.root.setRotation(orbitOffset + Math.PI * 0.55)

    this.ahriFoxFires.push({
      visual: foxVisual.root,
      foxVisual,
      phase: 'orbit',
      vx: 0,
      vy: 0,
      remainingMs: wave.stats.lifetimeMs,
      lastDepth: Math.floor(player.y),
      damage: wave.damage,
      hitRadius: wave.stats.hitRadius,
      hit: new WeakSet(),
      trailAccumMs: 0,
      orbitMsRemaining: AHRI_W_ORBIT_CAST_MS + i * AHRI_W_ORBIT_EXTRA_PER_INDEX_MS,
      orbitAngleOffset: orbitOffset,
      orbitSpinRad: 0,
      launchAngle: 0,
      huntSpeed: wave.stats.speed,
      fadeMsRemaining: AHRI_W_FADE_ORBIT_MS,
      spiritIndex: i,
      spiritTotal: total,
      huntTargetIndex: -1,
    })
  }

  private updateAhriWFoxSpawnQueue(time: number) {
    const wave = this.ahriWFoxSpawnWave
    if (!wave || time < wave.nextSpawnAt) {
      return
    }
    this.spawnOneAhriFoxSpirit(wave)
    wave.nextSpiritIndex += 1
    wave.spiritsLeft -= 1
    if (wave.spiritsLeft <= 0) {
      this.ahriWFoxSpawnWave = null
    } else {
      wave.nextSpawnAt = time + AHRI_W_SPIRIT_STAGGER_MS
    }
  }

  private ahriFoxOrbitStep(
    fox: AhriFoxFire,
    player: Phaser.Physics.Arcade.Sprite,
    delta: number,
  ) {
    fox.orbitSpinRad += delta * 0.0042 * (fox.phase === 'fade' ? 1.15 : 1)
    const ang = fox.orbitAngleOffset + fox.orbitSpinRad
    fox.visual.x = player.x + Math.cos(ang) * AHRI_W_ORBIT_RADIUS
    fox.visual.y = player.y + Math.sin(ang) * AHRI_W_ORBIT_RADIUS * 0.88
    fox.visual.setRotation(ang + Math.PI * 0.55)
    fox.lastDepth = setDepthFromY(fox.visual, fox.visual.y, fox.lastDepth)
  }

  private tryLaunchAhriFoxFromOrbit(fox: AhriFoxFire): boolean {
    const idx = this.pickAhriFoxTargetIndex(fox.spiritIndex)
    if (idx < 0) {
      return false
    }
    const target = this.enemies[idx]
    fox.huntTargetIndex = idx
    fox.launchAngle = Math.atan2(
      target.visual.y - fox.visual.y,
      target.visual.x - fox.visual.x,
    )
    fox.phase = 'hunt'
    fox.vx = Math.cos(fox.launchAngle) * fox.huntSpeed
    fox.vy = Math.sin(fox.launchAngle) * fox.huntSpeed
    fox.visual.setAlpha(1)
    fox.visual.setRotation(fox.launchAngle)
    return true
  }

  private fireAhriCharmBolt(stats: AhriEAbilityStats): boolean {
    const player = this.player
    if (!player) return false

    let dirX = 1
    let dirY = 0
    const idx = this.findNearestEnemyIndex()
    if (idx >= 0) {
      const target = this.enemies[idx]
      dirX = target.visual.x - player.x
      dirY = target.visual.y - player.y
    }
    const len = Math.hypot(dirX, dirY) || 1
    dirX /= len
    dirY /= len
    const angle = Math.atan2(dirY, dirX)

    const spawnX = player.x + dirX * AHRI_E_SPAWN_FORWARD
    const spawnY = player.y + dirY * AHRI_E_SPAWN_FORWARD
    const depth = spawnY + 2

    spawnAhriCharmCastFlash(this, player.x, player.y, angle, depth)

    const charmVisual = createAhriCharmBoltVisual(
      this,
      spawnX,
      spawnY,
      angle,
      depth,
    )
    if (!charmVisual) {
      return false
    }

    const dmgScale =
      this.combatStats.projectileDamage / BASE_PROJECTILE_DAMAGE

    this.ahriCharmBolts.push({
      visual: charmVisual.root,
      charmVisual,
      vx: dirX * stats.speed,
      vy: dirY * stats.speed,
      remainingMs: stats.lifetimeMs,
      lastDepth: Math.floor(spawnY),
      trailAccumMs: 0,
      trailSegmentIndex: 0,
      damage: stats.damage * dmgScale,
      hitRadius: stats.hitRadius,
      charmDurationMs: stats.charmDurationMs,
      slowMultiplier: stats.slowMultiplier,
      hit: new WeakSet(),
    })

    const launchA = Math.atan2(dirY, dirX)
    spawnAhriCharmTrailSegment(this, spawnX, spawnY, launchA, depth, 0)
    spawnAhriCharmTrailSegment(this, spawnX, spawnY, launchA, depth, 1)
    return true
  }

  private updateAhriFoxFires(delta: number) {
    const step = delta / 1000
    const time = this.time.now
    const player = this.player
    for (let i = this.ahriFoxFires.length - 1; i >= 0; i -= 1) {
      const fox = this.ahriFoxFires[i]

      if (fox.phase === 'orbit' || fox.phase === 'fade') {
        if (!player) {
          fox.visual.destroy()
          this.ahriFoxFires.splice(i, 1)
          continue
        }

        if (fox.phase === 'orbit') {
          fox.orbitMsRemaining -= delta
          this.ahriFoxOrbitStep(fox, player, delta)
          syncAhriFoxFireVisualMotion(fox.foxVisual, time, 0, 0)
          if (fox.orbitMsRemaining <= 0) {
            if (!this.tryLaunchAhriFoxFromOrbit(fox)) {
              fox.phase = 'fade'
              fox.fadeMsRemaining = AHRI_W_FADE_ORBIT_MS
            }
          }
          continue
        }

        fox.fadeMsRemaining -= delta
        this.ahriFoxOrbitStep(fox, player, delta)
        syncAhriFoxFireVisualMotion(fox.foxVisual, time, 0, 0)
        const fadeT = Math.max(0, fox.fadeMsRemaining / AHRI_W_FADE_ORBIT_MS)
        fox.visual.setAlpha(fadeT)
        if (fox.fadeMsRemaining <= 0) {
          fox.visual.destroy()
          this.ahriFoxFires.splice(i, 1)
        }
        continue
      }

      fox.remainingMs -= delta

      const idx = this.resolveAhriFoxHuntTarget(fox)
      if (idx >= 0) {
        const target = this.enemies[idx]
        const dx = target.visual.x - fox.visual.x
        const dy = target.visual.y - fox.visual.y
        const dist = Math.hypot(dx, dy) || 1
        const seek = 560 * step
        fox.vx += (dx / dist) * seek
        fox.vy += (dy / dist) * seek
        const vlen = Math.hypot(fox.vx, fox.vy) || 1
        const cap = 620
        fox.vx = (fox.vx / vlen) * cap
        fox.vy = (fox.vy / vlen) * cap
        fox.visual.setRotation(Math.atan2(fox.vy, fox.vx))
      }

      fox.visual.x += fox.vx * step
      fox.visual.y += fox.vy * step
      fox.lastDepth = setDepthFromY(fox.visual, fox.visual.y, fox.lastDepth)
      syncAhriFoxFireVisualMotion(fox.foxVisual, time, fox.vx, fox.vy)

      fox.trailAccumMs += delta
      if (fox.trailAccumMs >= 34) {
        fox.trailAccumMs = 0
        const a = Math.atan2(fox.vy, fox.vx)
        spawnAhriFoxFireTrailSegment(
          this,
          fox.visual.x - Math.cos(a) * 8,
          fox.visual.y - Math.sin(a) * 8,
          a,
          fox.visual.y,
        )
      }

      const hitCandidates =
        fox.huntTargetIndex >= 0 && fox.huntTargetIndex < this.enemies.length
          ? [fox.huntTargetIndex]
          : Array.from({ length: this.enemies.length }, (_, j) => j)

      for (let c = 0; c < hitCandidates.length; c += 1) {
        const j = hitCandidates[c]
        const enemy = this.enemies[j]
        if (!enemy || fox.hit.has(enemy)) continue
        const hitR = enemy.radius + fox.hitRadius
        const dx = enemy.visual.x - fox.visual.x
        const dy = enemy.visual.y - fox.visual.y
        if (dx * dx + dy * dy <= hitR * hitR) {
          fox.hit.add(enemy)
          this.damageEnemyAt(j, fox.damage)
          spawnAhriFoxFireImpactVisual(
            this,
            fox.visual.x,
            fox.visual.y,
            fox.visual.y,
          )
          fox.remainingMs = 0
          break
        }
      }

      if (
        fox.remainingMs <= 0 ||
        fox.visual.x < -40 ||
        fox.visual.x > WORLD_WIDTH + 40 ||
        fox.visual.y < -40 ||
        fox.visual.y > WORLD_HEIGHT + 40
      ) {
        fox.visual.destroy()
        this.ahriFoxFires.splice(i, 1)
      }
    }
  }

  private updateAhriCharmBolts(time: number, delta: number) {
    const step = delta / 1000
    for (let i = this.ahriCharmBolts.length - 1; i >= 0; i -= 1) {
      const bolt = this.ahriCharmBolts[i]
      bolt.remainingMs -= delta
      bolt.visual.x += bolt.vx * step
      bolt.visual.y += bolt.vy * step
      bolt.lastDepth = setDepthFromY(bolt.visual, bolt.visual.y, bolt.lastDepth)

      syncAhriCharmBoltVisualMotion(
        bolt.charmVisual,
        bolt.vx,
        bolt.vy,
        time,
      )

      bolt.trailAccumMs += delta
      if (bolt.trailAccumMs >= AHRI_E_TRAIL_SEGMENT_MS) {
        bolt.trailAccumMs = 0
        const a = Math.atan2(bolt.vy, bolt.vx)
        spawnAhriCharmTrailSegment(
          this,
          bolt.visual.x,
          bolt.visual.y,
          a,
          bolt.visual.y,
          bolt.trailSegmentIndex,
        )
        bolt.trailSegmentIndex += 1
      }

      for (let j = this.enemies.length - 1; j >= 0; j -= 1) {
        const enemy = this.enemies[j]
        if (bolt.hit.has(enemy)) continue
        const hitR = enemy.radius + bolt.hitRadius
        const dx = enemy.visual.x - bolt.visual.x
        const dy = enemy.visual.y - bolt.visual.y
        if (dx * dx + dy * dy <= hitR * hitR) {
          bolt.hit.add(enemy)
          this.damageEnemyAt(j, bolt.damage)
          this.applyAhriCharm(
            enemy,
            time,
            bolt.charmDurationMs,
            bolt.slowMultiplier,
          )
          spawnAhriCharmImpactVisual(
            this,
            bolt.visual.x,
            bolt.visual.y,
            bolt.visual.y,
          )
          bolt.remainingMs = 0
          break
        }
      }

      if (bolt.remainingMs <= 0) {
        bolt.visual.destroy()
        this.ahriCharmBolts.splice(i, 1)
      }
    }
  }

  private resolveAhriRDashDirection(): { nx: number; ny: number } {
    const player = this.player
    if (!player) {
      return { nx: 1, ny: 0 }
    }

    const pointer = this.input.activePointer
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
    let dx = world.x - player.x
    let dy = world.y - player.y
    if (Math.abs(dx) + Math.abs(dy) > 12) {
      const len = Math.hypot(dx, dy) || 1
      return { nx: dx / len, ny: dy / len }
    }

    const move = this.readMoveVector()
    if (Math.abs(move.x) + Math.abs(move.y) > 1) {
      const len = Math.hypot(move.x, move.y) || 1
      return { nx: move.x / len, ny: move.y / len }
    }

    const idx = this.findNearestEnemyIndex(640)
    if (idx >= 0) {
      const target = this.enemies[idx]
      dx = target.visual.x - player.x
      dy = target.visual.y - player.y
      const len = Math.hypot(dx, dy) || 1
      return { nx: dx / len, ny: dy / len }
    }

    return { nx: 1, ny: 0 }
  }

  private beginAhriSpiritDash(time: number): boolean {
    const player = this.player
    const stats = this.ahriRDashStats
    if (!player || !stats || this.ahriRDashesLeft <= 0) {
      return false
    }

    const { nx, ny } = this.resolveAhriRDashDirection()
    const startX = player.x
    const startY = player.y
    const endX = Phaser.Math.Clamp(
      startX + nx * stats.dashDistance,
      PLAYER_RADIUS,
      WORLD_WIDTH - PLAYER_RADIUS,
    )
    const endY = Phaser.Math.Clamp(
      startY + ny * stats.dashDistance,
      PLAYER_RADIUS,
      WORLD_HEIGHT - PLAYER_RADIUS,
    )

    const dmgScale =
      this.combatStats.projectileDamage / BASE_PROJECTILE_DAMAGE
    const dashAngle = Math.atan2(ny, nx)

    spawnAhriSpiritRushDashBurst(this, startX, startY, dashAngle, startY + 4)
    const rushVisual = createAhriSpiritRushVisual(
      this,
      startX,
      startY,
      dashAngle,
      startY + 4,
    )

    this.ahriActiveSpiritDash = {
      startX,
      startY,
      endX,
      endY,
      nx,
      ny,
      elapsedMs: 0,
      durationMs: stats.dashDurationMs,
      damage: stats.damage * dmgScale,
      hitRadius: stats.hitRadius,
      hit: new WeakSet(),
      rushVisual,
      trailAccumMs: 0,
    }

    this.ahriRDashesLeft -= 1
    this.ahriRChargeUntil = time + AHRI_R_CHARGE_WINDOW_MS
    player.setAlpha(0.92)
    this.fireAhriRSpiritBolts(startX, startY, stats.damage * dmgScale)
    return true
  }

  /** Hasta 3 blancos: menos vida primero; empate → más cercano. */
  private pickAhriRSpiritBoltTargets(maxCount: number): number[] {
    const player = this.player
    if (!player || this.enemies.length === 0) {
      return []
    }

    const rangeSq = AHRI_R_SPIRIT_BOLT_RANGE * AHRI_R_SPIRIT_BOLT_RANGE
    const candidates: { index: number; health: number; distSq: number }[] = []

    for (let i = 0; i < this.enemies.length; i += 1) {
      const enemy = this.enemies[i]
      const dx = enemy.visual.x - player.x
      const dy = enemy.visual.y - player.y
      const distSq = dx * dx + dy * dy
      if (distSq <= rangeSq) {
        candidates.push({ index: i, health: enemy.health, distSq })
      }
    }

    candidates.sort((a, b) => {
      if (a.health !== b.health) {
        return a.health - b.health
      }
      return a.distSq - b.distSq
    })

    const picked: number[] = []
    const used = new Set<number>()
    for (let c = 0; c < candidates.length && picked.length < maxCount; c += 1) {
      const idx = candidates[c].index
      if (used.has(idx)) continue
      used.add(idx)
      picked.push(idx)
    }

    if (picked.length >= maxCount) {
      return picked
    }

    for (let i = 0; i < this.enemies.length && picked.length < maxCount; i += 1) {
      if (used.has(i)) continue
      const enemy = this.enemies[i]
      const dx = enemy.visual.x - player.x
      const dy = enemy.visual.y - player.y
      if (dx * dx + dy * dy <= rangeSq * 1.35) {
        picked.push(i)
        used.add(i)
      }
    }

    return picked
  }

  private fireAhriRSpiritBolts(fromX: number, fromY: number, damage: number) {
    const targets = this.pickAhriRSpiritBoltTargets(AHRI_R_SPIRIT_BOLT_COUNT)
    for (let t = 0; t < targets.length; t += 1) {
      const targetIndex = targets[t]
      const boltVisual = createAhriRSpiritBoltVisual(
        this,
        fromX,
        fromY,
        fromY + 2,
        t % 2 === 1 ? 'alt' : 'primary',
      )
      if (!boltVisual) {
        continue
      }
      this.ahriRSpiritBolts.push({
        visual: boltVisual.root,
        foxVisual: boltVisual,
        targetIndex,
        speed: AHRI_R_SPIRIT_BOLT_SPEED,
        damage,
        hitRadius: AHRI_R_SPIRIT_BOLT_HIT_RADIUS,
        remainingMs: AHRI_R_SPIRIT_BOLT_LIFETIME_MS,
        lastDepth: Math.floor(fromY),
        trailAccumMs: 0,
      })
    }
  }

  private updateAhriRSpiritBolts(delta: number) {
    const step = delta / 1000
    const time = this.time.now
    for (let i = this.ahriRSpiritBolts.length - 1; i >= 0; i -= 1) {
      const bolt = this.ahriRSpiritBolts[i]
      bolt.remainingMs -= delta

      let targetValid = false
      if (bolt.targetIndex >= 0 && bolt.targetIndex < this.enemies.length) {
        const target = this.enemies[bolt.targetIndex]
        const dx = target.visual.x - bolt.visual.x
        const dy = target.visual.y - bolt.visual.y
        const dist = Math.hypot(dx, dy) || 1
        const seek = bolt.speed * step
        const vx = (dx / dist) * bolt.speed
        const vy = (dy / dist) * bolt.speed
        bolt.visual.x += (dx / dist) * seek
        bolt.visual.y += (dy / dist) * seek
        bolt.lastDepth = setDepthFromY(bolt.visual, bolt.visual.y, bolt.lastDepth)
        syncAhriFoxFireVisualMotion(bolt.foxVisual, time, vx, vy)
        targetValid = true

        bolt.trailAccumMs += delta
        if (bolt.trailAccumMs >= 36) {
          bolt.trailAccumMs = 0
          const a = Math.atan2(vy, vx)
          spawnAhriFoxFireTrailSegment(
            this,
            bolt.visual.x - Math.cos(a) * 6,
            bolt.visual.y - Math.sin(a) * 6,
            a,
            bolt.visual.y,
          )
        }

        const hitR = target.radius + bolt.hitRadius
        if (dx * dx + dy * dy <= hitR * hitR) {
          this.damageEnemyAt(bolt.targetIndex, bolt.damage)
          spawnAhriFoxFireImpactVisual(
            this,
            target.visual.x,
            target.visual.y,
            target.visual.y,
          )
          bolt.visual.destroy()
          this.ahriRSpiritBolts.splice(i, 1)
          continue
        }
      }

      if (!targetValid || bolt.remainingMs <= 0) {
        bolt.visual.destroy()
        this.ahriRSpiritBolts.splice(i, 1)
      }
    }
  }

  private damageEnemiesInAhriRDash(
    dash: AhriActiveSpiritDash,
    x: number,
    y: number,
  ) {
    const r = dash.hitRadius
    for (let j = this.enemies.length - 1; j >= 0; j -= 1) {
      const enemy = this.enemies[j]
      if (dash.hit.has(enemy)) continue
      const ex = enemy.visual.x - x
      const ey = enemy.visual.y - y
      const hitR = enemy.radius + r
      if (ex * ex + ey * ey <= hitR * hitR) {
        dash.hit.add(enemy)
        this.damageEnemyAt(j, dash.damage)
        spawnAhriBasicImpact(
          this,
          enemy.visual.x,
          enemy.visual.y,
          enemy.visual.y,
        )
      }
    }
  }

  private finishAhriSpiritDash() {
    const player = this.player
    if (player) {
      player.setAlpha(1)
    }
    const dash = this.ahriActiveSpiritDash
    if (dash?.rushVisual) {
      dash.rushVisual.root.destroy()
    }
    this.ahriActiveSpiritDash = null
    if (this.ahriRDashesLeft <= 0) {
      this.ahriRDashStats = null
      this.ahriRChargeUntil = 0
    }
  }

  private updateAhriSpiritRush(time: number, delta: number) {
    if (
      this.ahriRDashesLeft > 0 &&
      !this.ahriActiveSpiritDash &&
      this.ahriRChargeUntil > 0 &&
      time >= this.ahriRChargeUntil
    ) {
      this.ahriRDashesLeft = 0
      this.ahriRDashStats = null
      this.ahriRChargeUntil = 0
    }

    const dash = this.ahriActiveSpiritDash
    if (!dash) return

    const player = this.player
    if (!player) {
      this.finishAhriSpiritDash()
      return
    }

    dash.elapsedMs += delta
    const t = Math.min(1, dash.elapsedMs / dash.durationMs)
    const eased = Phaser.Math.Easing.Cubic.Out(t)
    const x = Phaser.Math.Linear(dash.startX, dash.endX, eased)
    const y = Phaser.Math.Linear(dash.startY, dash.endY, eased)
    const angle = Math.atan2(dash.ny, dash.nx)

    player.setPosition(x, y)
    player.setDepth(y)
    this.cameras.main.centerOn(x, y)

    if (dash.rushVisual) {
      syncAhriSpiritRushVisualMotion(
        dash.rushVisual,
        x,
        y,
        angle,
        y + 4,
        time,
      )
    }

    dash.trailAccumMs += delta
    if (dash.trailAccumMs >= AHRI_R_TRAIL_SEGMENT_MS) {
      dash.trailAccumMs = 0
      spawnAhriSpiritRushTrailSegment(
        this,
        x - dash.nx * 10,
        y - dash.ny * 10,
        angle,
        y,
      )
    }

    this.damageEnemiesInAhriRDash(dash, x, y)

    if (t >= 1) {
      player.setPosition(dash.endX, dash.endY)
      player.setDepth(dash.endY)
      this.damageEnemiesInAhriRDash(dash, dash.endX, dash.endY)
      spawnAhriSpiritRushTrailSegment(
        this,
        dash.endX,
        dash.endY,
        angle,
        dash.endY,
      )
      this.finishAhriSpiritDash()
    }
  }

  private tryCastW(time: number): boolean {
    if (!isJinxAbilityUnlocked(this.jinxAbilities.w)) {
      return false
    }
    const stats = resolveWStats(effectiveJinxAbilityLevel(this.jinxAbilities.w))
    if (!stats || !this.isAbilityReady('w', time) || this.enemies.length === 0) {
      return false
    }
    if (!this.fireW(stats)) {
      return false
    }
    this.startAbilityCooldown('w', time, stats.cooldownMs)
    return true
  }

  private tryCastE(time: number): boolean {
    if (!isJinxAbilityUnlocked(this.jinxAbilities.e)) {
      return false
    }
    const stats = resolveEStats(effectiveJinxAbilityLevel(this.jinxAbilities.e))
    if (!stats || !this.isAbilityReady('e', time)) {
      return false
    }
    if (!this.tryPlaceChomper(time, stats)) {
      return false
    }
    this.startAbilityCooldown('e', time, stats.cooldownMs)
    return true
  }

  private tryCastR(time: number): boolean {
    if (!isJinxAbilityUnlocked(this.jinxAbilities.r)) {
      return false
    }
    const stats = resolveRStats(effectiveJinxAbilityLevel(this.jinxAbilities.r))
    if (!stats || !this.isAbilityReady('r', time) || this.enemies.length === 0) {
      return false
    }
    if (!this.fireMegaRocket(stats)) {
      return false
    }
    this.startAbilityCooldown('r', time, stats.cooldownMs)
    return true
  }

  private fireW(
    stats: NonNullable<ReturnType<typeof resolveWStats>>,
  ): boolean {
    const player = this.player
    if (!player) return false

    const idx = this.findNearestEnemyIndex()
    if (idx < 0) return false

    const target = this.enemies[idx]
    const dx = target.visual.x - player.x
    const dy = target.visual.y - player.y
    const angle = Math.atan2(dy, dx)
    const nx = Math.cos(angle)
    const ny = Math.sin(angle)
    const damage =
      stats.damage *
      (this.combatStats.projectileDamage / BASE_PROJECTILE_DAMAGE)

    const wVisual = createJinxWProjectileVisual(
      this,
      player.x,
      player.y,
      angle,
      player.y + 2,
    )
    if (!wVisual) {
      return false
    }

    this.wProjectiles.push({
      visual: wVisual.root,
      lightningStrip: wVisual.lightningStrip,
      vx: nx * stats.speed,
      vy: ny * stats.speed,
      remainingMs: stats.lifetimeMs,
      lastDepth: Math.floor(player.y),
      rotation: angle,
      damage,
      pierceRemaining: stats.pierce,
      hit: new WeakSet(),
    })

    return true
  }

  private tryPlaceChomper(
    time: number,
    stats: NonNullable<ReturnType<typeof resolveEStats>>,
  ): boolean {
    const player = this.player
    if (!player) return false

    this.chomperTraps = this.chomperTraps.filter((trap) => {
      if (time >= trap.expiresAt) {
        trap.visual.destroy()
        return false
      }
      return true
    })

    const placements = pickChomperVolleyPositions(
      player.x,
      player.y,
      this.enemyPoints(),
      WORLD_WIDTH,
      WORLD_HEIGHT,
    )
    if (placements.length < CHOMPERS_PLACED_PER_CAST) {
      return false
    }

    const slotsLeft = stats.maxTraps - this.chomperTraps.length
    if (slotsLeft < CHOMPERS_PLACED_PER_CAST) {
      return false
    }

    const damage =
      stats.trapDamage *
      (this.combatStats.projectileDamage / BASE_PROJECTILE_DAMAGE)

    for (const pos of placements) {
      const visual = createChomperTrapVisual(this, pos.x, pos.y, pos.y)
      this.chomperTraps.push({
        visual,
        damage,
        triggerRadius: stats.triggerRadius,
        slowMultiplier: stats.slowMultiplier,
        slowDurationMs: stats.slowDurationMs,
        expiresAt: time + stats.trapLifetimeMs,
        lastDepth: Math.floor(pos.y),
      })
    }
    return true
  }

  private fireMegaRocket(
    stats: NonNullable<ReturnType<typeof resolveRStats>>,
  ): boolean {
    const player = this.player
    if (!player) return false

    const target = pickMegaRocketTarget(
      player.x,
      player.y,
      this.enemyPoints(),
      WORLD_WIDTH,
      WORLD_HEIGHT,
    )
    if (!target) return false

    const dx = target.x - player.x
    const dy = target.y - player.y
    const angle = Math.atan2(dy, dx)
    const nx = Math.cos(angle)
    const ny = Math.sin(angle)
    const dmgScale =
      this.combatStats.projectileDamage / BASE_PROJECTILE_DAMAGE

    const visual = createRMissileVisual(
      this,
      player.x,
      player.y,
      angle,
      player.y + 3,
    )

    this.rProjectiles.push({
      visual,
      vx: nx * stats.speed,
      vy: ny * stats.speed,
      remainingMs: stats.maxTravelMs,
      lastDepth: Math.floor(player.y),
      rotation: angle,
      directDamage: stats.directDamage * dmgScale,
      splashDamage: stats.splashDamage * dmgScale,
      splashRadius: stats.splashRadius,
      targetX: target.x,
      targetY: target.y,
      hit: new WeakSet(),
      exploded: false,
    })

    return true
  }

  private updateWProjectiles(delta: number) {
    const step = delta / 1000

    for (let i = this.wProjectiles.length - 1; i >= 0; i -= 1) {
      const zap = this.wProjectiles[i]
      updateJinxWProjectileScroll(zap.lightningStrip, delta)
      zap.visual.x += zap.vx * step
      zap.visual.y += zap.vy * step
      zap.lastDepth = setDepthFromY(zap.visual, zap.visual.y, zap.lastDepth)
      zap.remainingMs -= delta

      for (let j = this.enemies.length - 1; j >= 0; j -= 1) {
        const enemy = this.enemies[j]
        if (zap.hit.has(enemy)) continue

        const hitRadius = enemy.radius + PROJECTILE_HIT_RADIUS
        if (
          distanceSquared(
            zap.visual.x,
            zap.visual.y,
            enemy.visual.x,
            enemy.visual.y,
          ) >= hitRadius * hitRadius
        ) {
          continue
        }

        zap.hit.add(enemy)
        this.damageEnemyAt(j, zap.damage)
        spawnWImpactVisual(this, zap.visual.x, zap.visual.y, zap.visual.y)
        zap.pierceRemaining -= 1

        if (zap.pierceRemaining <= 0) {
          zap.visual.destroy()
          this.wProjectiles.splice(i, 1)
          break
        }
      }

      if (this.wProjectiles[i] !== zap) {
        continue
      }

      if (
        zap.remainingMs <= 0 ||
        zap.visual.x < 0 ||
        zap.visual.x > WORLD_WIDTH ||
        zap.visual.y < 0 ||
        zap.visual.y > WORLD_HEIGHT
      ) {
        zap.visual.destroy()
        this.wProjectiles.splice(i, 1)
      }
    }
  }

  private updateChomperTraps(time: number, delta: number) {
    void delta
    for (let t = this.chomperTraps.length - 1; t >= 0; t -= 1) {
      const trap = this.chomperTraps[t]

      if (time >= trap.expiresAt) {
        trap.visual.destroy()
        this.chomperTraps.splice(t, 1)
        continue
      }

      updateChomperTrapVisualIdle(trap.visual, time)

      const triggerSq = trap.triggerRadius * trap.triggerRadius
      let triggered = false

      for (let j = this.enemies.length - 1; j >= 0; j -= 1) {
        const enemy = this.enemies[j]
        if (
          distanceSquared(
            trap.visual.x,
            trap.visual.y,
            enemy.visual.x,
            enemy.visual.y,
          ) > triggerSq
        ) {
          continue
        }

        this.applyEnemySlow(
          enemy,
          time,
          trap.slowDurationMs,
          trap.slowMultiplier,
        )
        this.damageEnemyAt(j, trap.damage)
        triggered = true
        break
      }

      if (triggered) {
        spawnChomperTriggerVisual(
          this,
          trap.visual.x,
          trap.visual.y,
          trap.visual.y,
        )
        this.tweens.add({
          targets: trap.visual,
          alpha: 0,
          scale: trap.visual.scale * 1.12,
          duration: 160,
          onComplete: () => trap.visual.destroy(),
        })
        this.chomperTraps.splice(t, 1)
      }
    }
  }

  private detonateMegaRocket(
    rocket: RProjectile,
    impactX: number,
    impactY: number,
    hitIndex: number,
  ) {
    if (rocket.exploded) {
      return
    }
    rocket.exploded = true

    spawnFishbonesExplosion(
      this,
      impactX,
      impactY,
      impactY,
      rocket.splashRadius,
    )

    const radiusSq = rocket.splashRadius * rocket.splashRadius
    for (let j = this.enemies.length - 1; j >= 0; j -= 1) {
      const enemy = this.enemies[j]
      if (rocket.hit.has(enemy)) {
        continue
      }
      const dSq = distanceSquared(
        impactX,
        impactY,
        enemy.visual.x,
        enemy.visual.y,
      )
      if (dSq > radiusSq) {
        continue
      }
      this.damageEnemyAt(j, rocket.splashDamage)
    }

    void hitIndex
  }

  private updateRProjectiles(delta: number) {
    const step = delta / 1000
    this.rTrailAccumMs += delta

    for (let i = this.rProjectiles.length - 1; i >= 0; i -= 1) {
      const rocket = this.rProjectiles[i]
      rocket.visual.x += rocket.vx * step
      rocket.visual.y += rocket.vy * step
      rocket.lastDepth = setDepthFromY(
        rocket.visual,
        rocket.visual.y,
        rocket.lastDepth,
      )
      rocket.remainingMs -= delta

      if (this.rTrailAccumMs >= 70) {
        spawnRTrailPuff(this, rocket.visual.x, rocket.visual.y, rocket.visual.y)
      }

      let lastHitIndex = -1

      for (let j = 0; j < this.enemies.length; j += 1) {
        const enemy = this.enemies[j]
        if (rocket.hit.has(enemy)) continue

        const hitRadius = enemy.radius + PROJECTILE_HIT_RADIUS + 4
        if (
          distanceSquared(
            rocket.visual.x,
            rocket.visual.y,
            enemy.visual.x,
            enemy.visual.y,
          ) >= hitRadius * hitRadius
        ) {
          continue
        }

        rocket.hit.add(enemy)
        this.damageEnemyAt(j, rocket.directDamage)
        lastHitIndex = j
      }

      const distToTargetSq = distanceSquared(
        rocket.visual.x,
        rocket.visual.y,
        rocket.targetX,
        rocket.targetY,
      )

      if (
        !rocket.exploded &&
        (distToTargetSq < 55 * 55 ||
          rocket.remainingMs <= 0 ||
          rocket.visual.x < 0 ||
          rocket.visual.x > WORLD_WIDTH ||
          rocket.visual.y < 0 ||
          rocket.visual.y > WORLD_HEIGHT)
      ) {
        this.detonateMegaRocket(
          rocket,
          rocket.visual.x,
          rocket.visual.y,
          lastHitIndex,
        )
        rocket.visual.destroy()
        this.rProjectiles.splice(i, 1)
      }
    }

    if (this.rTrailAccumMs >= 70) {
      this.rTrailAccumMs = 0
    }
  }

  private damageEnemyAt(index: number, damage: number) {
    const enemy = this.enemies[index]
    if (!enemy) {
      return
    }

    enemy.health -= damage
    syncEnemyHpBar(enemy)
    if (enemy.health > 0) {
      return
    }

    const { x, y } = enemy.visual
    enemy.visual.destroy()
    this.enemies.splice(index, 1)
    this.kills += 1
    this.spawnXpCrystal(x, y)
    this.emitHud(this.time.now, true)
  }

  private applyRocketExplosion(
    x: number,
    y: number,
    hitIndex: number,
    directDamage: number,
    splashDamage: number,
    splashRadius: number,
  ) {
    const radiusSq = splashRadius * splashRadius
    const hits: { index: number; damage: number }[] = []

    for (let j = 0; j < this.enemies.length; j += 1) {
      const enemy = this.enemies[j]
      const dSq = distanceSquared(x, y, enemy.visual.x, enemy.visual.y)
      if (dSq > radiusSq) {
        continue
      }

      hits.push({
        index: j,
        damage: j === hitIndex ? directDamage : splashDamage,
      })
    }

    hits.sort((a, b) => b.index - a.index)
    for (const hit of hits) {
      this.damageEnemyAt(hit.index, hit.damage)
    }
  }

  private updateProjectiles(delta: number) {
    const step = delta / 1000
    const time = this.time.now

    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.projectiles[i]

      projectile.visual.x += projectile.vx * step
      projectile.visual.y += projectile.vy * step
      projectile.lastDepth = setDepthFromY(
        projectile.visual,
        projectile.visual.y,
        projectile.lastDepth,
      )
      projectile.remainingMs -= delta

      if (projectile.ahriBasic && projectile.ahriBasicVisual) {
        syncAhriBasicProjectileMotion(
          projectile.ahriBasicVisual,
          projectile.vx,
          projectile.vy,
          time,
        )
        projectile.baTrailAccumMs = (projectile.baTrailAccumMs ?? 0) + delta
        if ((projectile.baTrailAccumMs ?? 0) >= 54) {
          projectile.baTrailAccumMs = 0
          const a = Math.atan2(projectile.vy, projectile.vx)
          spawnAhriBaTrailSegment(
            this,
            projectile.visual.x - Math.cos(a) * 6,
            projectile.visual.y - Math.sin(a) * 6,
            a,
            projectile.visual.y,
          )
        }
      }

      let hitIndex = -1

      for (let j = 0; j < this.enemies.length; j += 1) {
        const enemy = this.enemies[j]
        const hitRadius = enemy.radius + PROJECTILE_HIT_RADIUS
        const hitRadiusSq = hitRadius * hitRadius
        const distanceSq = distanceSquared(
          projectile.visual.x,
          projectile.visual.y,
          enemy.visual.x,
          enemy.visual.y,
        )

        if (distanceSq < hitRadiusSq) {
          hitIndex = j
          break
        }
      }

      if (hitIndex !== -1) {
        const impactX = projectile.visual.x
        const impactY = projectile.visual.y

        if (projectile.ahriBasic) {
          spawnAhriBasicImpact(this, impactX, impactY, impactY)
        } else if (projectile.weapon === 'fishbones') {
          spawnFishbonesExplosion(
            this,
            impactX,
            impactY,
            impactY,
            projectile.splashRadius,
          )
        } else {
          spawnPowPowImpact(this, impactX, impactY, impactY)
        }

        if (projectile.splashRadius > 0 && projectile.splashDamage > 0) {
          this.applyRocketExplosion(
            impactX,
            impactY,
            hitIndex,
            projectile.directDamage,
            projectile.splashDamage,
            projectile.splashRadius,
          )
        } else {
          this.damageEnemyAt(hitIndex, projectile.directDamage)
        }

        projectile.visual.destroy()
        this.projectiles.splice(i, 1)
        continue
      }

      if (
        projectile.remainingMs <= 0 ||
        projectile.visual.x < 0 ||
        projectile.visual.x > WORLD_WIDTH ||
        projectile.visual.y < 0 ||
        projectile.visual.y > WORLD_HEIGHT
      ) {
        projectile.visual.destroy()
        this.projectiles.splice(i, 1)
      }
    }
  }

  private spawnXpCrystal(x: number, y: number) {
    const visual = this.add.image(x, y, TEXTURE.xpCrystal)
    visual.setDepth(y + 1)
    visual.setScale(0.95 + Math.random() * 0.15)

    this.xpCrystals.push({
      visual,
      value: XP_CRYSTAL_VALUE,
      bobPhase: Math.random() * Math.PI * 2,
      baseY: y,
      lastDepth: Math.floor(y),
    })
  }

  private updateXpCrystals(delta: number) {
    const player = this.player
    if (!player) {
      return
    }

    const step = delta / 1000

    for (let i = this.xpCrystals.length - 1; i >= 0; i -= 1) {
      const crystal = this.xpCrystals[i]
      crystal.bobPhase += step * 4
      crystal.visual.y = crystal.baseY + Math.sin(crystal.bobPhase) * 2
      crystal.lastDepth = setDepthFromY(
        crystal.visual,
        crystal.visual.y,
        crystal.lastDepth,
      )

      const distanceSq = distanceSquared(
        player.x,
        player.y,
        crystal.visual.x,
        crystal.visual.y,
      )

      if (distanceSq <= XP_PICKUP_RADIUS_SQ) {
        this.grantExperience(crystal.value)
        crystal.visual.destroy()
        this.xpCrystals.splice(i, 1)
      }
    }
  }

  private grantExperience(amount: number) {
    const previousLevel = this.level
    const result = applyExperience(
      { level: this.level, xp: this.xp },
      amount,
    )
    this.level = result.level
    this.xp = result.xp

    if (result.levelsGained > 0) {
      recordBalanceLevelUps(result.levelsGained)
      for (
        let levelReached = previousLevel + 1;
        levelReached <= this.level;
        levelReached += 1
      ) {
        this.levelUpQueue.push(levelReached)
      }
      this.tryShowNextLevelUp(this.time.now)
    }

    this.emitHud(this.time.now, true)
  }

  private tryShowNextLevelUp(time: number) {
    if (this.gameOver || this.levelUpQueue.length === 0) {
      return
    }

    if (!this.upgradePause) {
      this.upgradePause = true
      this.pauseStartedAt = time
      this.player?.setVelocity(0, 0)
    }

    if (this.currentOfferIds.length === 0) {
      this.currentOfferIds = pickRandomUpgrades(3, this.getUpgradeOfferContext())
    }

    this.cachedOfferKey = ''
    this.emitHud(time, true)
  }

  private chooseUpgrade(id: UpgradeId) {
    if (
      this.gameOver ||
      !this.upgradePause ||
      this.choosingUpgrade ||
      this.levelUpQueue.length === 0
    ) {
      return
    }

    if (!this.currentOfferIds.includes(id)) {
      return
    }

    this.choosingUpgrade = true

    const runState = {
      ...this.buildUpgradeRunState(),
      stats: this.combatStats,
      health: this.health,
      abilities: this.jinxAbilities,
      ahriAbilities: this.ahriAbilities,
      luxAbilities: this.luxSystems.getAbilities(),
      missFortuneAbilities: this.missFortuneSystems.getAbilities(),
      ezrealAbilities: this.ezrealSystems.getAbilities(),
      leeSinAbilities: this.leeSinSystems.getAbilities(),
      yasuoAbilities: this.yasuoSystems.getAbilities(),
    }
    const applied = applyUpgradeChoice(id, runState)
    this.syncUpgradeRunState(applied)
    this.upgradePickCount += 1

    const slot = abilitySlotFromUpgradeId(id)
    const lower = id.toLowerCase()
    if (slot && (lower.includes('unlock') || lower.includes('upgrade'))) {
      this.abilityCdEnd[slot] = 0
    }

    this.levelUpQueue.shift()
    this.currentOfferIds = []

    const time = this.time.now

    if (this.levelUpQueue.length > 0 && !this.gameOver) {
      this.currentOfferIds = pickRandomUpgrades(3, this.getUpgradeOfferContext())
      this.choosingUpgrade = false
      this.cachedOfferKey = ''
      this.emitHud(time, true)
      return
    }

    this.endUpgradePause(time)
    this.choosingUpgrade = false
    this.cachedOfferKey = ''
    this.emitHud(time, true)
  }

  private endUpgradePause(time: number) {
    if (this.pauseStartedAt > 0) {
      this.totalPausedMs += time - this.pauseStartedAt
      this.pauseStartedAt = 0
    }
    this.upgradePause = false
  }

  private cancelLevelUpFlow(time: number) {
    this.levelUpQueue = []
    this.currentOfferIds = []
    this.choosingUpgrade = false

    if (this.upgradePause) {
      this.endUpgradePause(time)
    }
  }

  private getElapsedMs(time: number) {
    const activePause =
      this.upgradePause && this.pauseStartedAt > 0
        ? time - this.pauseStartedAt
        : 0

    return Math.max(0, time - this.startedAt - this.totalPausedMs - activePause)
  }

  private readMoveVector() {
    let x = 0
    let y = 0

    const left = Boolean(this.cursors?.left.isDown || this.wasd?.left.isDown)
    const right = Boolean(this.cursors?.right.isDown || this.wasd?.right.isDown)
    const up = Boolean(this.cursors?.up.isDown || this.wasd?.up.isDown)
    const down = Boolean(this.cursors?.down.isDown || this.wasd?.down.isDown)

    if (left) x -= 1
    if (right) x += 1
    if (up) y -= 1
    if (down) y += 1

    if (x === 0 && y === 0) {
      return { x: 0, y: 0 }
    }

    const length = Math.hypot(x, y)

    return {
      x: (x / length) * this.combatStats.moveSpeed,
      y: (y / length) * this.combatStats.moveSpeed,
    }
  }

  private buildLevelUpOffer(): LevelUpOffer | null {
    if (
      !this.upgradePause ||
      this.gameOver ||
      this.levelUpQueue.length === 0 ||
      this.currentOfferIds.length === 0
    ) {
      this.cachedLevelUpOffer = null
      this.cachedOfferKey = ''
      return null
    }

    const offerKey = `${this.levelUpQueue[0]}:${this.levelUpQueue.length}:${this.currentOfferIds.join(',')}`
    if (offerKey === this.cachedOfferKey && this.cachedLevelUpOffer) {
      return this.cachedLevelUpOffer
    }

    this.cachedOfferKey = offerKey
    this.cachedLevelUpOffer = {
      levelReached: this.levelUpQueue[0],
      pendingChoices: this.levelUpQueue.length,
      options: this.currentOfferIds.map((id) =>
        toUpgradeOptionView(id, this.getUpgradeOfferContext()),
      ),
    }
    return this.cachedLevelUpOffer
  }

  private balanceRunTickInput(time: number) {
    return {
      combatElapsedMs: this.getElapsedMs(time),
      level: this.level,
      kills: this.kills,
      aliveEnemies: this.enemies.length,
      health: this.health,
      maxHealth: this.combatStats.maxHealth,
      projectileDamage: this.combatStats.projectileDamage,
      attackIntervalMs: this.combatStats.attackIntervalMs,
    }
  }

  private attachBalanceDebug(time: number) {
    if (!isBalanceRunDebugEnabled()) {
      return undefined
    }
    const tick = this.balanceRunTickInput(time)
    if (this.gameOver) {
      finalizeBalanceRunRecorder(tick)
    } else {
      tickBalanceRunRecorder(tick)
    }
    const live = getBalanceDebugLive()
    if (!live) {
      return undefined
    }
    return {
      live,
      summary: getBalanceRunSummary(),
    }
  }

  private emitHud(time: number, force = false) {
    this.lastHudEmit = time

    const snapshot = {
      health: this.health,
      maxHealth: this.combatStats.maxHealth,
      elapsedMs: this.getElapsedMs(time),
      kills: this.kills,
      gameOver: this.gameOver,
      level: this.level,
      xp: this.xp,
      xpToNextLevel: xpRequiredForNextLevel(this.level),
      levelUpOffer: this.buildLevelUpOffer(),
      championId: this.championId,
      championName: resolveChampionDisplayName(this.championId),
      activeWeapon: resolveActiveWeaponHudLabel(
        this.championId,
        this.activeJinxWeapon,
      ),
      abilities: buildChampionAbilityHud(
        this.championId,
        this.jinxAbilities,
        this.ahriAbilities,
        this.yasuoSystems.getAbilities(),
        this.luxSystems.getAbilities(),
        this.leeSinSystems.getAbilities(),
        this.missFortuneSystems.getAbilities(),
        this.ezrealSystems.getAbilities(),
        this.getElapsedMs(time),
        this.abilityCdEnd,
        this.championId === 'lux' && this.luxSystems.isLuxEDetonateReady(),
        this.championId === 'leesin' && this.leeSinSystems.isQRecastReady(),
        this.championId === 'leesin' && this.leeSinSystems.isECrippleReady(),
        this.activeJinxWeapon,
      ),
      metaCoins: getMetaProgress().coins,
      runCoinReward: this.gameOver ? this.runCoinReward : null,
      ...(import.meta.env.DEV
        ? { debugFps: Math.round(this.game.loop.actualFps) }
        : {}),
      balanceDebug: this.attachBalanceDebug(time),
    }

    this.onHud?.(snapshot, force)
  }

  private drawWorldBorder() {
    const border = this.add.graphics()
    border.lineStyle(22, C_BORDER_OUTER, 0.75)
    border.strokeRect(6, 6, WORLD_WIDTH - 12, WORLD_HEIGHT - 12)
    border.lineStyle(8, C_BORDER_MID, 0.55)
    border.strokeRect(20, 20, WORLD_WIDTH - 40, WORLD_HEIGHT - 40)
    border.lineStyle(2, C_BORDER_INNER, 0.4)
    border.strokeRect(34, 34, WORLD_WIDTH - 68, WORLD_HEIGHT - 68)
    border.setDepth(3)
  }
}