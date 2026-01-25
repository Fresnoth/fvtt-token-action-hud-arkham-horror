import { GROUP } from './constants.js'

/**
 * Default layout and groups
 */
export let DEFAULTS = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const groups = GROUP
    Object.values(groups).forEach(group => {
        group.name = coreModule.api.Utils.i18n(group.name)
        group.listName = `Group: ${coreModule.api.Utils.i18n(group.listName ?? group.name)}`
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
                nestId: 'insight',
                id: 'insight',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.Insight'),
                groups: [
                    { ...groups.insight, nestId: 'insight_actions' },
                ]
            },
            {
                nestId: 'injury_trauma',
                id: 'injury_trauma',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.InjuriesTrauma'),
                groups: [
                    { ...groups.injury_trauma, nestId: 'injury_trauma_actions' },
                ]
            },
            {
                nestId: 'weapons',
                id: 'weapons',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.Weapons'),
                groups: [
                    { ...groups.weapons, nestId: 'weapons_list' },
                ]
            },
            {
                nestId: 'spells',
                id: 'spells',
                name: coreModule.api.Utils.i18n('ARKHAM_HORROR.LABELS.Spells'),
                groups: [
                    { ...groups.spells, nestId: 'spells_list' },
                ]
            }
        ],
        groups: groupsArray
    }
})
