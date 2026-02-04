import { SystemManager } from './system-manager.js'
import { MODULE } from './constants.js'

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
