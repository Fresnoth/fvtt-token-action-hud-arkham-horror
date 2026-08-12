import { SystemManager } from './system-manager.js'
import { MODULE, TOOLTIP_SUPPRESS_CLASS } from './constants.js'

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
