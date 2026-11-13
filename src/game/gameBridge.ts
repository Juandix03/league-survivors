import type { UpgradeId } from './upgrades'

export type ChooseUpgradeHandler = (id: UpgradeId) => void

export const REGISTRY_CHOOSE_UPGRADE = 'chooseUpgrade'
