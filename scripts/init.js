import { SystemManager } from './system-manager.js'
import { MODULE, TOOLTIP_SUPPRESS_CLASS } from './constants.js'

const LAYOUT_NOTICE_VERSION = '14.1.0'
const LAYOUT_NOTICE_SETTING = 'layoutUpgradeNoticeVersion'
const CURRENT_LAYOUT_GROUP_IDS = [
    'knacks_untiered',
    'knacks_tier1',
    'knacks_tier2',
    'knacks_tier3',
    'knacks_tier4',
    'knacks_weaknesses',
    'protective_equipment'
]
let layoutNoticeHandled = false

Hooks.once('init', () => {
    game.settings.register(MODULE.ID, LAYOUT_NOTICE_SETTING, {
        scope: 'client',
        config: false,
        type: String,
        default: ''
    })
})

Hooks.on('renderTokenActionHud', (application, element) => {
    const hudElement = application?.element ?? element?.[0] ?? element ?? game.tokenActionHud?.element
    if (!hudElement?.querySelectorAll) return

    const selector = `.${TOOLTIP_SUPPRESS_CLASS}[data-tooltip], .${TOOLTIP_SUPPRESS_CLASS} [data-tooltip]`
    for (const tooltipSource of hudElement.querySelectorAll(selector)) {
        tooltipSource.removeAttribute('data-tooltip')
        tooltipSource.removeAttribute('data-tooltip-class')
        tooltipSource.removeAttribute('data-tooltip-direction')
    }
})

Hooks.on('tokenActionHudCoreHudUpdated', async () => {
    if (layoutNoticeHandled) return

    const seenVersion = game.settings.get(MODULE.ID, LAYOUT_NOTICE_SETTING)
    if (seenVersion && !foundry.utils.isNewerVersion(LAYOUT_NOTICE_VERSION, seenVersion)) {
        layoutNoticeHandled = true
        return
    }

    const groups = Object.values(game.tokenActionHud?.hudManager?.groupHandler?.groups ?? {})
    const currentGroupIds = new Set(groups.map(group => group?.id))
    const hasCurrentLayout = CURRENT_LAYOUT_GROUP_IDS.every(groupId => currentGroupIds.has(groupId))
    if (hasCurrentLayout) {
        layoutNoticeHandled = true
        return
    }

    layoutNoticeHandled = true
    ui.notifications.warn(game.i18n.localize('tokenActionHud.arkhamHorror.upgrade.layoutNotice'), {
        permanent: true,
        console: false
    })
    await game.settings.set(MODULE.ID, LAYOUT_NOTICE_SETTING, LAYOUT_NOTICE_VERSION)
})

Hooks.on('tokenActionHudCoreApiReady', async () => {
    /**
     * Return the SystemManager to Token Action HUD Core
     */
    const module = game.modules.get(MODULE.ID)
    module.api = {
        SystemManager
    }
    Hooks.call('tokenActionHudSystemReady', module)
})
