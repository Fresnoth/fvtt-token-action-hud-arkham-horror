import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach(group => {
        group.name = group.nameData
            ? game.i18n.format(group.name, group.nameData)
            : coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${group.listName ? coreModule.api.Utils.i18n(group.listName) : group.name}`
        delete group.nameData
    })
    const groupsArray = Object.values(groups)
    DEFAULTS = {
        layout: [
            {
                nestId: 'dicepool',
                id: 'dicepool',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.Dicepool'),
                groups: [
                    { ...groups.dicepool_adjust, nestId: 'dicepool_adjust' },
                    { ...groups.damage_adjust, nestId: 'dicepool_damage' },
                    { ...groups.horror_adjust, nestId: 'dicepool_horror' },
                    { ...groups.dicepool_actions, nestId: 'dicepool_actions' }
                ]
            },
            {
                nestId: 'insight',
                id: 'insight',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.Insight'),
                groups: [
                    { ...groups.insight, nestId: 'insight_actions' },
                ]
            },
            {
                nestId: 'simple',
                id: 'simple',
                name: 'Simple',
                groups: [
                    { ...groups.simple, nestId: 'simple_actions' }
                ]
            },
            {
                nestId: 'complex',
                id: 'complex',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.KNACK_SHEET.RollKind.Complex'),
                groups: [
                    { ...groups.complex_action, nestId: 'complex_skillaction' },
                ]
            },
            {
                nestId: 'reactions',
                id: 'reactions',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.KNACK_SHEET.RollKind.Reaction'),
                groups: [
                    { ...groups.reactions, nestId: 'reactions_reactions' },
                ]
            },
            {
                nestId: 'weapons',
                id: 'weapons',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.Weapons'),
                groups: [
                    { ...groups.weapons_melee, nestId: 'weapons_melee' },
                    { ...groups.weapons_ranged, nestId: 'weapons_ranged' },
                    { ...groups.weapons_other, nestId: 'weapons_other' },
                ]
            },
            {
                nestId: 'spells',
                id: 'spells',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.Spells'),
                groups: [
                    { ...groups.spells, nestId: 'spells_list' },
                ]
            },
            {
                nestId: 'healing',
                id: 'healing',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.HEALING.SectionTitle'),
                groups: [
                    { ...groups.healing_treatment, nestId: 'healing_treatment' },
                    { ...groups.healing_horror, nestId: 'healing_horror' },
                    { ...groups.healing_recovery, nestId: 'healing_recovery' },
                ]
            },
            {
                nestId: 'injurytrauma',
                id: 'injurytrauma',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.InjuriesTrauma'),
                groups: [
                    { ...groups.injury_trauma_actions, nestId: 'injurytrauma_actions' },
                    { ...groups.injuries, nestId: 'injurytrauma_injuries' },
                    { ...groups.traumas, nestId: 'injurytrauma_traumas' },
                ]
            },
            {
                nestId: 'knacks',
                id: 'knacks',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.Knacks'),
                groups: [
                    { ...groups.knacks_untiered, nestId: 'knacks_untiered' },
                    { ...groups.knacks_tier1, nestId: 'knacks_tier1' },
                    { ...groups.knacks_tier2, nestId: 'knacks_tier2' },
                    { ...groups.knacks_tier3, nestId: 'knacks_tier3' },
                    { ...groups.knacks_tier4, nestId: 'knacks_tier4' },
                    { ...groups.knacks_weaknesses, nestId: 'knacks_weaknesses' },
                ]
            },
            {
                nestId: 'items',
                id: 'items',
                name: coreModule.api.Utils.i18n('tokenActionHud.template.items'),
                groups: [
                    { ...groups.protective_equipment, nestId: 'items_protective' },
                    { ...groups.useful_items, nestId: 'items_useful' },
                    { ...groups.relics, nestId: 'items_relics' },
                    { ...groups.tomes, nestId: 'items_tomes' },
                    { ...groups.favors, nestId: 'items_favors' },
                ]
            }
        ],
        groups: groupsArray
    }
})
