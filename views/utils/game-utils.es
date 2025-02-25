/*
 * This file contains utility functions that is related to the game mechanism,
 * or formatting instructions to game data.
 */
import { ProgressBar } from 'react-bootstrap'
import { addStyle } from 'react-bootstrap/lib/utils/bootstrapUtils'
import _, { get } from 'lodash'
import { Intent } from '@blueprintjs/core'
import { shipAvatarColor } from './color'

addStyle(ProgressBar, 'green')
addStyle(ProgressBar, 'yellow')
addStyle(ProgressBar, 'orange')
addStyle(ProgressBar, 'red')

import { between } from './tools'

const aircraftExpTable = [0, 10, 25, 40, 55, 70, 85, 100, 121]
const aircraftLevelBonus = {
  6: [0, 0, 2, 5, 9, 14, 14, 22, 22], // 艦上戦闘機
  7: [0, 0, 0, 0, 0, 0, 0, 0, 0], // 艦上爆撃機
  8: [0, 0, 0, 0, 0, 0, 0, 0, 0], // 艦上攻撃機
  11: [0, 1, 1, 1, 1, 3, 3, 6, 6], // 水上爆撃機
  26: [0, 0, 2, 5, 9, 14, 14, 22, 22], // 対潜哨戒機
  45: [0, 0, 2, 5, 9, 14, 14, 22, 22], // 水上戦闘機
  47: [0, 0, 0, 0, 0, 0, 0, 0, 0], // 陸上攻撃機
  48: [0, 0, 2, 5, 9, 14, 14, 22, 22], // 局地戦闘機 陸軍戦闘機
  56: [0, 0, 0, 0, 0, 0, 0, 0, 0], // 噴式戦闘機
  57: [0, 0, 0, 0, 0, 0, 0, 0, 0], // 噴式戦闘爆撃機
  58: [0, 0, 0, 0, 0, 0, 0, 0, 0], // 噴式攻撃機
}

const speedInterpretation = {
  5: 'Slow',
  10: 'Fast',
  15: 'Fast+',
  20: 'Fastest',
}

const speedStyles = {
  [15]: { color: '#1E88E5' },
  [20]: { color: '#64B5F6' },
}

const uncountedSlotitemId = [42, 43, 145, 146, 150, 241]

export function getMaterialStyle(percent) {
  if (percent <= 50) return 'red'
  else if (percent <= 75) return 'orange'
  else if (percent < 100) return 'yellow'
  else return 'green'
}

export function getCondStyle(cond) {
  let s = 'poi-ship-cond poi-ship-cond-'
  if (cond > 52) s += '53'
  else if (cond > 49) s += '50'
  else if (cond == 49) s += '49'
  else if (cond > 39) s += '40'
  else if (cond > 29) s += '30'
  else if (cond > 19) s += '20'
  else s += '0'
  s += window.isDarkTheme ? ' dark' : ' light'
  return s
}

export function getShipAvatarColorByType(shipType) {
  switch (shipType) {
    case 1: // 海防艦
      return shipAvatarColor.GREY_BLUE
    case 2: // 駆逐艦
      return shipAvatarColor.GREEN
    case 3: // 軽巡洋艦
    case 4: // 重雷装巡洋艦
    case 21: // 練習巡洋艦
      return shipAvatarColor.YELLOW
    case 5: // 重巡洋艦
    case 6: // 航空巡洋艦
      return shipAvatarColor.ORANGE
    case 8: // 戦艦
    case 9: // 戦艦
    case 10: // 航空戦艦
    case 12: // 超弩級戦艦
      return shipAvatarColor.RED
    case 7: // 軽空母
    case 11: // 航空母艦
    case 18: // 装甲空母
      return shipAvatarColor.BLUE
    case 13: // 潜水艦
    case 14: // 潜水空母
      return shipAvatarColor.PURPLE
    default:
      // 他
      return shipAvatarColor.WHITE
  }
}

export function getShipAvatarColorByRange(rng) {
  switch (rng) {
    case 1:
      return shipAvatarColor.GREEN
    case 2:
      return shipAvatarColor.YELLOW
    case 3:
      return shipAvatarColor.ORANGE
    case 4:
      return shipAvatarColor.RED
    default:
      return shipAvatarColor.BLACK
  }
}

export function getShipAvatarColorByTag(tag, color) {
  return Number.isInteger(tag) && tag > 0 ? `${color[tag - 1]}60` : shipAvatarColor.BLACK
}

export function getShipAvatarColorBySpeed(speed) {
  switch (speed) {
    // 0=陸上基地, 5=低速, 10=高速(, 15=高速+, 20=最速)
    case 5:
      return shipAvatarColor.BLUE
    case 10:
      return shipAvatarColor.GREEN
    case 15:
      return shipAvatarColor.YELLOW
    case 20:
      return shipAvatarColor.RED
    default:
      return shipAvatarColor.BLUE
  }
}

export function selectShipAvatarColor(ship, $ship, color, opt) {
  switch (opt) {
    case 'shiptype':
      return getShipAvatarColorByType($ship.api_stype)
    case 'range':
      return getShipAvatarColorByRange(ship.api_leng)
    case 'tag':
      return getShipAvatarColorByTag(ship.api_sally_area, color)
    case 'speed':
      return getShipAvatarColorBySpeed(ship.api_soku)
    default:
      return '#00000000'
  }
}

export const getSpeedLabel = (speed) => speedInterpretation[speed] || 'Unknown'

export const getSpeedStyle = (speed) => speedStyles[speed] || {}

export function getStatusStyle(status) {
  if (status != null) {
    const flag = status == 0 || status == 1 // retreat or repairing
    if (flag != null && flag) {
      return { opacity: 0.4 }
    }
  } else {
    return {}
  }
}

export function getShipLabelStatus(ship, $ship, inRepair, escaped) {
  if (!ship || !$ship) {
    return -1
  }
  if (escaped) {
    // retreated
    return 0
  } else if (inRepair) {
    // repairing
    return 1
  } else if (Math.min(ship.api_fuel / $ship.api_fuel_max, ship.api_bull / $ship.api_bull_max) < 1) {
    // supply
    return 2
  } else if (ship.api_sally_area > 0) {
    // special: locked phase
    // returns 3 for locked phase 1, 4 for phase 2, etc
    return ship.api_sally_area + 2
  }
  return -1
}

export function getHpStyle(percent) {
  if (percent <= 25) {
    return 'red'
  } else if (percent <= 50) {
    return 'orange'
  } else if (percent <= 75) {
    return 'yellow'
  } else {
    return 'green'
  }
}

/**
 * test if an equipment is aircraft using api_type[2] or api_type[3]
 * @param {Equip | number} equip equip (master) data or api_type[3]
 */
export function equipIsAircraft(equip) {
  if (Number.isInteger(equip)) {
    // compat: the function used to accept api_type[3]
    return (
      equip != null &&
      (between(equip, 6, 10) ||
        between(equip, 21, 22) ||
        between(equip, 37, 40) ||
        between(equip, 43, 51) ||
        [33, 56].includes(equip))
    )
  } else {
    const id = get(equip, 'api_type.2', 0)
    return (
      between(id, 6, 11) ||
      between(id, 25, 26) ||
      between(id, 47, 48) ||
      between(id, 56, 59) ||
      [41, 45, 94].includes(id)
    )
  }
}

export function getTyku(equipsData, landbaseStatus = 0) {
  let minTyku = 0
  let maxTyku = 0
  let basicTyku = 0
  let reconBonus = 1
  for (let i = 0; i < equipsData.length; i++) {
    if (!equipsData[i]) {
      continue
    }
    for (let j = 0; j < equipsData[i].length; j++) {
      if (!equipsData[i][j]) {
        continue
      }
      const [_equip, $equip, onslot] = equipsData[i][j]
      if (onslot < 1 || onslot == undefined) {
        continue
      }
      let tempTyku = 0.0
      let tempAlv
      // Basic tyku
      if (_equip.api_alv) {
        tempAlv = _equip.api_alv
      } else {
        tempAlv = 0
      }
      // 改修：艦戦×0.2、爆戦×0.25
      const levelFactor = $equip.api_tyku > 3 ? ($equip.api_baku > 0 ? 0.25 : 0.2) : 0
      if (
        [6, 7, 45, 47, 57].includes($equip.api_type[2]) ||
        ([26].includes($equip.api_type[2]) && $equip.api_tyku > 0)
      ) {
        // 艦戦 · 爆戦 · 水上戦闘機 · 陸上攻撃機 · 噴式機
        // 対潜哨戒機 (一式戦 隼II型改(20戦隊) · 一式戦 隼III型改(熟練/20戦隊))
        tempTyku += Math.sqrt(onslot) * ($equip.api_tyku + (_equip.api_level || 0) * levelFactor)
        tempTyku += aircraftLevelBonus[$equip.api_type[2]][tempAlv]
        basicTyku += Math.floor(Math.sqrt(onslot) * $equip.api_tyku)
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
      } else if ([8, 11].includes($equip.api_type[2])) {
        // 艦攻 · 水上爆撃機
        tempTyku += Math.sqrt(onslot) * $equip.api_tyku
        tempTyku += aircraftLevelBonus[$equip.api_type[2]][tempAlv]
        basicTyku += Math.floor(Math.sqrt(onslot) * $equip.api_tyku)
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
      } else if ([48].includes($equip.api_type[2])) {
        // 局戦 · 陸戦
        let landbaseBonus = 0
        if (landbaseStatus === 1) landbaseBonus = 1.5 * $equip.api_houk // (対空 ＋ 迎撃 × 1.5)
        if (landbaseStatus === 2) landbaseBonus = $equip.api_houk + 2 * $equip.api_houm // (対空 ＋ 迎撃 ＋ 対爆 × 2)
        tempTyku +=
          Math.sqrt(onslot) *
          ($equip.api_tyku + landbaseBonus + (_equip.api_level || 0) * levelFactor)
        tempTyku += aircraftLevelBonus[$equip.api_type[2]][tempAlv]
        basicTyku += Math.floor(Math.sqrt(onslot) * $equip.api_tyku)
        minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
        maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
      } else if ([10, 41].includes($equip.api_type[2])) {
        // 水偵・飛行艇
        if (landbaseStatus == 2) {
          if ($equip.api_saku >= 9) {
            reconBonus = Math.max(reconBonus, 1.16)
          } else if ($equip.api_saku == 8) {
            reconBonus = Math.max(reconBonus, 1.13)
          } else {
            reconBonus = Math.max(reconBonus, 1.1)
          }
        } else if (landbaseStatus == 1) {
          tempTyku += Math.sqrt(onslot) * $equip.api_tyku
          minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
          maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
        }
      } else if ([9].includes($equip.api_type[2]) && landbaseStatus == 2) {
        // 艦偵
        if ($equip.api_saku >= 9) {
          reconBonus = Math.max(reconBonus, 1.3)
        } else {
          reconBonus = Math.max(reconBonus, 1.2)
        }
      } else if ([49].includes($equip.api_type[2])) {
        // 陸上偵察機
        if (landbaseStatus == 1) {
          tempTyku += Math.sqrt(onslot) * ($equip.api_tyku + (_equip.api_level || 0) * levelFactor)
          basicTyku += Math.floor(Math.sqrt(onslot) * $equip.api_tyku)
          minTyku += Math.floor(tempTyku + Math.sqrt(aircraftExpTable[tempAlv] / 10))
          maxTyku += Math.floor(tempTyku + Math.sqrt((aircraftExpTable[tempAlv + 1] - 1) / 10))
          if ($equip.api_saku >= 9) {
            reconBonus = Math.max(reconBonus, 1.18)
          } else {
            reconBonus = Math.max(reconBonus, 1.15)
          }
        } else if (landbaseStatus == 2) {
          if ($equip.api_saku >= 9) {
            reconBonus = Math.max(reconBonus, 1.23)
          } else {
            reconBonus = Math.max(reconBonus, 1.18)
          }
        }
      }
    }
  }
  return {
    basic: Math.floor(basicTyku * reconBonus),
    min: Math.floor(minTyku * reconBonus),
    max: Math.floor(maxTyku * reconBonus),
  }
}

// Saku (2-5 旧式)
// 偵察機索敵値×2 ＋ 電探索敵値 ＋ √(艦隊の装備込み索敵値合計 - 偵察機索敵値 - 電探索敵値)
export function getSaku25(shipsData, equipsData) {
  let reconSaku = 0
  let shipSaku = 0
  let radarSaku = 0
  let totalSaku = 0
  for (let i = 0; i < equipsData.length; i++) {
    if (!shipsData[i] || !equipsData[i]) continue
    const [_ship] = shipsData[i]
    shipSaku += _ship.api_sakuteki[0]
    for (let j = 0; j < equipsData[i].length; j++) {
      if (!equipsData[i][j]) {
        continue
      }
      const $equip = equipsData[i][j][1]
      switch ($equip.api_type[3]) {
        case 9:
          reconSaku += $equip.api_saku
          shipSaku -= $equip.api_saku
          break
        case 10:
          if ($equip.api_type[2] == 10) {
            reconSaku += $equip.api_saku
            shipSaku -= $equip.api_saku
          }
          break
        case 11:
          radarSaku += $equip.api_saku
          shipSaku -= $equip.api_saku
          break
        default:
          break
      }
    }
  }
  reconSaku = reconSaku * 2.0
  shipSaku = Math.sqrt(shipSaku)
  totalSaku = reconSaku + radarSaku + shipSaku

  return {
    recon: parseFloat(reconSaku.toFixed(2)),
    radar: parseFloat(radarSaku.toFixed(2)),
    ship: parseFloat(shipSaku.toFixed(2)),
    total: parseFloat(totalSaku.toFixed(2)),
  }
}

// Saku (2-5 秋式)
// 索敵スコア = 艦上爆撃機 × (1.04) + 艦上攻撃機 × (1.37) + 艦上偵察機 × (1.66) + 水上偵察機 × (2.00)
//            + 水上爆撃機 × (1.78) + 小型電探 × (1.00) + 大型電探 × (0.99) + 探照灯 × (0.91)
//            + √(各艦毎の素索敵) × (1.69) + (司令部レベルを5の倍数に切り上げ) × (-0.61)
export function getSaku25a(shipsData, equipsData, teitokuLv) {
  let totalSaku = 0
  let shipSaku = 0
  let equipSaku = 0
  let teitokuSaku = 0
  for (let i = 0; i < equipsData.length; i++) {
    if (!shipsData[i] || !equipsData[i]) continue
    const [_ship] = shipsData[i]
    let shipPureSaku = _ship.api_sakuteki[0]
    for (let j = 0; j < equipsData[i].length; j++) {
      if (!equipsData[i][j]) {
        continue
      }
      const $equip = equipsData[i][j][1]
      shipPureSaku -= $equip.api_saku
      switch ($equip.api_type[3]) {
        case 7:
          equipSaku += $equip.api_saku * 1.04
          break
        case 8:
          equipSaku += $equip.api_saku * 1.37
          break
        case 9:
          equipSaku += $equip.api_saku * 1.66
          break
        case 10:
          if ($equip.api_type[2] == 10) {
            equipSaku += $equip.api_saku * 2.0
          } else if ($equip.api_type[2] == 11) {
            equipSaku += $equip.api_saku * 1.78
          }
          break
        case 11:
          if ($equip.api_type[2] == 12) {
            equipSaku += $equip.api_saku * 1.0
          } else if ($equip.api_type[2] == 13) {
            equipSaku += $equip.api_saku * 0.99
          }
          break
        case 24:
          equipSaku += $equip.api_saku * 0.91
          break
        default:
          break
      }
    }
    shipSaku += Math.sqrt(shipPureSaku) * 1.69
  }
  teitokuSaku = 0.61 * Math.floor((teitokuLv + 4) / 5) * 5
  totalSaku = shipSaku + equipSaku - teitokuSaku

  return {
    ship: parseFloat(shipSaku.toFixed(2)),
    item: parseFloat(equipSaku.toFixed(2)),
    teitoku: parseFloat(teitokuSaku.toFixed(2)),
    total: parseFloat(totalSaku.toFixed(2)),
  }
}

// Saku (33)
// 索敵スコア = Sigma(CiSi) + Sigma(sqrt(s)) - Ceil(0.4H) + 2M
//     Si(改修): 電探(1.25 * Sqrt(Star)) 水上偵察機(1.2 * Sqrt(Star))
//     Ci(装備):
//              6 0.6 艦上戦闘機
//              7 0.6 艦上爆撃機
//              8 0.8 艦上攻撃機
//              9 1.0 艦上偵察機
//             10 1.2 水上偵察機
//             11 1.1 水上爆撃機
//             12 0.6 小型電探
//             13 0.6 大型電探
//             26 0.6 対潜哨戒機
//             29 0.6 探照灯
//             34 0.6 司令部施設
//             35 0.6 航空要員
//             39 0.6 水上艦要員
//             40 0.6 大型ソナー
//             41 0.6 大型飛行艇
//             42 0.6 大型探照灯
//             45 0.6 水上戦闘機
//             93 大型電探(II) null
//             94 艦上偵察機(II) null
//     S(各艦毎の素索敵)
//     H(レベル)
//     M(空き数)

export function getSaku33(shipsData, equipsData, teitokuLv, mapModifier = 1.0, slotCount = 6) {
  let totalSaku = 0
  let shipSaku = 0
  let equipSaku = 0
  let teitokuSaku = 0
  let emptySlot = slotCount
  for (let i = 0; i < equipsData.length; i++) {
    if (!shipsData[i] || !equipsData[i]) continue
    emptySlot -= 1
    const [_ship] = shipsData[i]
    let shipPureSaku = _ship.api_sakuteki[0]
    for (let j = 0; j < equipsData[i].length; j++) {
      if (!equipsData[i][j]) {
        continue
      }
      const [_equip, $equip] = equipsData[i][j]
      shipPureSaku -= $equip.api_saku
      switch ($equip.api_type[2]) {
        case 8:
          equipSaku += $equip.api_saku * 0.8
          break
        case 9:
          equipSaku += $equip.api_saku * 1.0
          break
        case 10:
          equipSaku += ($equip.api_saku + 1.2 * Math.sqrt(_equip.api_level || 0)) * 1.2
          break
        case 11:
          equipSaku += ($equip.api_saku + 1.15 * Math.sqrt(_equip.api_level || 0)) * 1.1
          break
        case 12:
          equipSaku += ($equip.api_saku + 1.25 * Math.sqrt(_equip.api_level || 0)) * 0.6
          break
        case 13:
          equipSaku += ($equip.api_saku + 1.25 * Math.sqrt(_equip.api_level || 0)) * 0.6
          break
        default:
          equipSaku += $equip.api_saku * 0.6
          break
      }
    }
    shipSaku += Math.sqrt(shipPureSaku)
  }
  equipSaku *= mapModifier
  teitokuSaku = Math.ceil(teitokuLv * 0.4)
  totalSaku = shipSaku + equipSaku - teitokuSaku + 2 * emptySlot

  return {
    ship: parseFloat(shipSaku.toFixed(2)),
    item: parseFloat(equipSaku.toFixed(2)),
    teitoku: parseFloat(teitokuSaku.toFixed(2)),
    total: parseFloat(totalSaku.toFixed(2)),
  }
}

// returns fleet's minimal api_soku value, returns 0 when all elements undefined
export const getFleetSpeed = (shipsData) => ({
  speed:
    _(shipsData)
      .map(([ship = {}] = []) => ship.api_soku || Infinity)
      .min() || 0,
})

export async function isInGame() {
  try {
    if (
      document.querySelector('webview').getURL() ===
      'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/'
    ) {
      return true
    }

    const exists =
      (await document
        .querySelector('webview')
        ?.executeJavaScript("document.querySelector('embed') !== null")) ?? false
    return exists
  } catch (e) {
    return false
  }
}

export const getSlotitemCount = (slotitems) => {
  return Object.values(slotitems).filter(
    ({ api_slotitem_id }) => !uncountedSlotitemId.includes(api_slotitem_id),
  ).length
}

export const FLEET_INTENTS = [
  Intent.SUCCESS,
  Intent.WARNING,
  Intent.DANGER,
  Intent.NONE,
  Intent.PRIMARY,
  Intent.NONE,
]

/**
 *
 * 0: Cond >= 40, Supplied, Repaired, In port
 * 1: 20 <= Cond < 40, or not supplied, or medium damage
 * 2: Cond < 20, or heavy damage
 * 3: Repairing
 * 4: In mission
 * 5: In map
 */
export const getFleetIntent = (state, disabled) =>
  state >= 0 && state <= 5 && !disabled ? FLEET_INTENTS[state] : Intent.NONE

export const DEFAULT_FLEET_NAMES = ['I', 'II', 'III', 'IV']

export const LBAC_INTENTS = [
  Intent.NONE,
  Intent.DANGER,
  Intent.WARNING,
  Intent.PRIMARY,
  Intent.SUCCESS,
]

export const LBAC_STATUS_NAMES = ['Standby', 'Sortie', 'Defense', 'Retreat', 'Rest']

export const LBAC_STATUS_AVATAR_COLOR = [
  shipAvatarColor.WHITE,
  shipAvatarColor.RED,
  shipAvatarColor.ORANGE,
  shipAvatarColor.BLUE,
  shipAvatarColor.GREEN,
]
