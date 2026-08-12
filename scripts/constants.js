/**
 * Module-based constants
 */
export const MODULE = {
    ID: 'fvtt-token-action-hud-arkham-horror'
}

/**
 * Core module
 */
export const CORE_MODULE = {
    ID: 'token-action-hud-core'
}

/**
 * Arkham Horror system version where public API routing is required.
 */
export const ARKHAM_API_MIN_VERSION = '13.0.37'

export const TOOLTIP_SUPPRESS_CLASS = 'tah-arkham-no-tooltip'

/**
 * Groups
 */
export const GROUP = {
    simple: { id: 'simple', name: 'Simple', type: 'system' },
    complex_action: { id: 'complex_action', name: 'ARKHAM_HORROR.LABELS.Skills', type: 'system' },
    reactions: { id: 'reactions', name: 'ARKHAM_HORROR.KNACK_SHEET.RollKind.Reaction', type: 'system' },
    insight: { id: 'insight', name: 'ARKHAM_HORROR.LABELS.Insight', type: 'system' },
    healing_treatment: { id: 'healing_treatment', name: 'ARKHAM_HORROR.HEALING.Treatment.Legend', type: 'system' },
    healing_horror: { id: 'healing_horror', name: 'ARKHAM_HORROR.HEALING.Horror.Legend', type: 'system' },
    healing_recovery: { id: 'healing_recovery', name: 'ARKHAM_HORROR.HEALING.Recovery.MenuLabel', type: 'system' },
    injury_trauma_actions: { id: 'injury_trauma_actions', name: 'tokenActionHud.template.actions', type: 'system' },
    injuries: { id: 'injuries', name: 'TYPES.Item.injury', type: 'system' },
    traumas: { id: 'traumas', name: 'TYPES.Item.trauma', type: 'system' },
    weapons: { id: 'weapons', name: 'ARKHAM_HORROR.LABELS.Weapons', type: 'system' },
    weapons_melee: { id: 'weapons_melee', name: 'ARKHAM_HORROR.SKILL.meleeCombat', type: 'system' },
    weapons_ranged: { id: 'weapons_ranged', name: 'ARKHAM_HORROR.SKILL.rangedCombat', type: 'system' },
    weapons_other: { id: 'weapons_other', name: 'tokenActionHud.template.otherWeapons', type: 'system' },
    protective_equipment: { id: 'protective_equipment', name: 'TYPES.Item.protective_equipment', type: 'system' },
    useful_items: { id: 'useful_items', name: 'ARKHAM_HORROR.LABELS.UsefulItems', type: 'system' },
    relics: { id: 'relics', name: 'ARKHAM_HORROR.LABELS.Relics', type: 'system' },
    tomes: { id: 'tomes', name: 'ARKHAM_HORROR.LABELS.Tomes', type: 'system' },
    favors: { id: 'favors', name: 'ARKHAM_HORROR.LABELS.Favors', type: 'system' },
    knacks_untiered: { id: 'knacks_untiered', name: 'ARKHAM_HORROR.LABELS.Knacks', type: 'system' },
    knacks_tier1: { id: 'knacks_tier1', name: 'ARKHAM_HORROR.Dialog.DiceRoll.Tier', nameData: { tier: 1 }, type: 'system' },
    knacks_tier2: { id: 'knacks_tier2', name: 'ARKHAM_HORROR.Dialog.DiceRoll.Tier', nameData: { tier: 2 }, type: 'system' },
    knacks_tier3: { id: 'knacks_tier3', name: 'ARKHAM_HORROR.Dialog.DiceRoll.Tier', nameData: { tier: 3 }, type: 'system' },
    knacks_tier4: { id: 'knacks_tier4', name: 'ARKHAM_HORROR.Dialog.DiceRoll.Tier', nameData: { tier: 4 }, type: 'system' },
    knacks_weaknesses: { id: 'knacks_weaknesses', name: 'ARKHAM_HORROR.LABELS.Weaknesses', type: 'system' },
    spells: { id: 'spells', name: 'ARKHAM_HORROR.LABELS.Spells', type: 'system' },
    dicepool_adjust: { id: 'dicepool_adjust', name: 'ARKHAM_HORROR.ABBR.Dicepool', type: 'system' },
    damage_adjust: { id: 'damage_adjust', name: 'ARKHAM_HORROR.LABELS.Damage', type: 'system' },
    horror_adjust: { id: 'horror_adjust', name: 'ARKHAM_HORROR.LABELS.Horror', type: 'system' },
    dicepool_actions: { id: 'dicepool_actions', name: 'ARKHAM_HORROR.LABELS.Dicepool', type: 'system' }
}
