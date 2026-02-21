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

/**
 * Groups
 */
export const GROUP = {
    simple: { id: 'simple', name: 'Simple', type: 'system' },
    complex_action: { id: 'complex_action', name: 'ARKHAM_HORROR.LABELS.Skills', type: 'system' },
    reactions: { id: 'reactions', name: 'ARKHAM_HORROR.KNACK_SHEET.RollKind.Reaction', type: 'system' },
    insight: { id: 'insight', name: 'ARKHAM_HORROR.LABELS.Insight', type: 'system' },
    injury_trauma: { id: 'injury_trauma', name: 'ARKHAM_HORROR.LABELS.InjuriesTrauma', type: 'system' },
    weapons: { id: 'weapons', name: 'ARKHAM_HORROR.LABELS.Weapons', type: 'system' },
    spells: { id: 'spells', name: 'ARKHAM_HORROR.LABELS.Spells', type: 'system' },
    dicepool_adjust: { id: 'dicepool_adjust', name: 'ARKHAM_HORROR.ABBR.Dicepool', type: 'system' },
    damage_adjust: { id: 'damage_adjust', name: 'ARKHAM_HORROR.LABELS.Damage', type: 'system' },
    horror_adjust: { id: 'horror_adjust', name: 'ARKHAM_HORROR.LABELS.Horror', type: 'system' },
    dicepool_actions: { id: 'dicepool_actions', name: 'ARKHAM_HORROR.LABELS.Dicepool', type: 'system' }
}
