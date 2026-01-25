export let RollHandler = null

let _DiceRollApp = null

let _SpendInsightApp = null
let _refreshInsightAndPost = null

let _refreshDicepoolAndPost = null
let _InjuryTraumaRollApp = null

function _isDebugEnabled () {
    // Toggle in browser console with: globalThis.tahAhDebug = true
    return globalThis?.tahAhDebug === true
}

function _debug (...args) {
    if (!_isDebugEnabled()) return
    console.log('TAH Arkham Horror [debug]:', ...args)
}

async function _getDiceRollApp () {
    if (_DiceRollApp) return _DiceRollApp

    // Prefer loading from the active system's id to avoid hardcoding paths.
    const systemId = game.system?.id
    const candidates = []
    if (systemId) {
        candidates.push(`/systems/${systemId}/module/apps/dice-roll-app.mjs`)
        candidates.push(`/systems/${systemId}/module/apps/dice-roll-app.js`)
    }
    // Common fallback for this project.
    candidates.push('/systems/arkham-horror-rpg-fvtt/module/apps/dice-roll-app.mjs')

    let lastError = null
    for (const path of candidates) {
        try {
            const imported = await import(path)
            const DiceRollApp = imported?.DiceRollApp
            if (DiceRollApp) {
                _DiceRollApp = DiceRollApp
                return _DiceRollApp
            }
        } catch (err) {
            lastError = err
        }
    }

    console.warn('TAH Arkham Horror: could not import DiceRollApp from system', {
        systemId,
        candidates,
        lastError
    })
    return null
}

async function _getRefreshDicepoolAndPost () {
    if (_refreshDicepoolAndPost) return _refreshDicepoolAndPost

    const systemId = game.system?.id
    const candidates = []
    if (systemId) candidates.push(`/systems/${systemId}/module/helpers/dicepool.mjs`)
    candidates.push('/systems/arkham-horror-rpg-fvtt/module/helpers/dicepool.mjs')

    let lastError = null
    for (const path of candidates) {
        try {
            const imported = await import(path)
            if (typeof imported?.refreshDicepoolAndPost === 'function') {
                _refreshDicepoolAndPost = imported.refreshDicepoolAndPost
                return _refreshDicepoolAndPost
            }
        } catch (err) {
            lastError = err
        }
    }

    console.warn('TAH Arkham Horror: could not import refreshDicepoolAndPost from system', { systemId, candidates, lastError })
    return null
}

async function _getInjuryTraumaRollApp () {
    if (_InjuryTraumaRollApp) return _InjuryTraumaRollApp

    const systemId = game.system?.id
    const candidates = []
    if (systemId) candidates.push(`/systems/${systemId}/module/apps/injury-trauma-roll-app.mjs`)
    candidates.push('/systems/arkham-horror-rpg-fvtt/module/apps/injury-trauma-roll-app.mjs')

    let lastError = null
    for (const path of candidates) {
        try {
            const imported = await import(path)
            if (imported?.InjuryTraumaRollApp) {
                _InjuryTraumaRollApp = imported.InjuryTraumaRollApp
                return _InjuryTraumaRollApp
            }
        } catch (err) {
            lastError = err
        }
    }

    console.warn('TAH Arkham Horror: could not import InjuryTraumaRollApp from system', { systemId, candidates, lastError })
    return null
}

async function _getSpendInsightApp () {
    if (_SpendInsightApp) return _SpendInsightApp

    const systemId = game.system?.id
    const candidates = []
    if (systemId) {
        candidates.push(`/systems/${systemId}/module/apps/spend-insight-app.mjs`)
        candidates.push(`/systems/${systemId}/module/apps/spend-insight-app.js`)
    }
    candidates.push('/systems/arkham-horror-rpg-fvtt/module/apps/spend-insight-app.mjs')

    let lastError = null
    for (const path of candidates) {
        try {
            const imported = await import(path)
            if (imported?.SpendInsightApp) {
                _SpendInsightApp = imported.SpendInsightApp
                return _SpendInsightApp
            }
        } catch (err) {
            lastError = err
        }
    }

    console.warn('TAH Arkham Horror: could not import SpendInsightApp from system', { systemId, candidates, lastError })
    return null
}

async function _getRefreshInsightAndPost () {
    if (_refreshInsightAndPost) return _refreshInsightAndPost

    const systemId = game.system?.id
    const candidates = []
    if (systemId) candidates.push(`/systems/${systemId}/module/helpers/insight.mjs`)
    candidates.push('/systems/arkham-horror-rpg-fvtt/module/helpers/insight.mjs')

    let lastError = null
    for (const path of candidates) {
        try {
            const imported = await import(path)
            if (typeof imported?.refreshInsightAndPost === 'function') {
                _refreshInsightAndPost = imported.refreshInsightAndPost
                return _refreshInsightAndPost
            }
        } catch (err) {
            lastError = err
        }
    }

    console.warn('TAH Arkham Horror: could not import refreshInsightAndPost from system', { systemId, candidates, lastError })
    return null
}

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    _debug('RollHandler initializing (tokenActionHudCoreApiReady)')
    /**
     * Extends Token Action HUD Core's RollHandler class and handles action events triggered when an action is clicked
     */
    RollHandler = class RollHandler extends coreModule.api.RollHandler {
        /**
         * Parse the encodedValue into action type + id.
         * Token Action HUD Core provides a delimiter, but be defensive because custom modules/core versions
         * may differ and some environments have historically used commas.
         * @private
         * @param {string} encodedValue
         */
        #parseEncodedValue (encodedValue) {
            if (typeof encodedValue !== 'string' || encodedValue.length === 0) return { actionTypeId: null, actionId: null }

            // Token Action HUD Core uses a delimiter. Use the core-provided delimiter when available, fall back to '|'.
            const delimiter = this.delimiter ?? '|'
            const parts = encodedValue.split(delimiter)
            return { actionTypeId: parts?.[0] ?? null, actionId: parts?.[1] ?? null }
        }

        /**
         * Handle action click
         * Called by Token Action HUD Core when an action is left or right-clicked
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionClick (event, encodedValue) {
            // IMPORTANT: prefer the clicked button's encodedValue (it is authoritative).
            // In some cases Token Action HUD Core may attach the wrong this.action (e.g. duplicate action ids).
            const parsed = typeof encodedValue === 'string' ? this.#parseEncodedValue(encodedValue) : { actionTypeId: null, actionId: null }
            const systemAction = this.action?.system ?? null

            let actionTypeId = parsed.actionTypeId ?? systemAction?.actionTypeId ?? null
            let actionId = parsed.actionId ?? systemAction?.actionId ?? null

            _debug('handleActionClick()', { encodedValue, parsed, actionTypeId, actionId })

            // If Core gave us an action object that doesn't match the clicked encodedValue, trust the click.
            if (parsed.actionTypeId && systemAction?.actionTypeId && parsed.actionTypeId !== systemAction.actionTypeId) {
                _debug('MISMATCH: trusting encodedValue', { parsedActionTypeId: parsed.actionTypeId, systemActionTypeId: systemAction.actionTypeId })
            }

            const renderable = ['item']

            if (renderable.includes(actionTypeId) && this.isRenderItem()) {
                const renderItem = this.renderItem ?? this.doRenderItem
                return renderItem?.call(this, this.actor, actionId)
            }

            // If single actor is selected
            if (this.actor) {
                if (this.actor?.type === 'vehicle') return
                _debug('single actor route', { actorId: this.actor?.id, actorName: this.actor?.name })
                await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId)
                return
            }

            // Intentionally no multi-token handling (DiceRollApp is singleton-based).
            const controlledTokens = canvas.tokens.controlled
                .filter((token) => !!token.actor && token.actor.type !== 'vehicle')

            if (controlledTokens.length !== 1) {
                _debug('multi-token click ignored', { tokenCount: controlledTokens.length })
                return
            }

            const token = controlledTokens[0]
            const actor = token.actor
            await this.#handleAction(event, actor, token, actionTypeId, actionId)
        }

        /**
         * Handle action hover
         * Called by Token Action HUD Core when an action is hovered on or off
         * @override
         * @param {object} event        The event
         * @param {string} encodedValue The encoded value
         */
        async handleActionHover (event, encodedValue) {}

        /**
         * Handle group click
         * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
         * @override
         * @param {object} event The event
         * @param {object} group The group
         */
        async handleGroupClick (event, group) {}

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {object} token        The token
         * @param {string} actionTypeId The action type id
         * @param {string} actionId     The actionId
         */
        async #handleAction (event, actor, token, actionTypeId, actionId) {
            if (actor?.type === 'vehicle') return

            // Some systems/actions want to override the action type via metadata.
            // If the action indicates a reaction rollKind, always route it to the reaction handler.
            if (this.action?.system?.rollKind === 'reaction') {
                _debug('route override via action.system.rollKind=reaction', { actionTypeId, actionId })
                await this.#handleReactionAction(event, actor, actionId)
                return
            }

            _debug('route via actionTypeId', { actionTypeId, actionId })

            switch (actionTypeId) {
            case 'item':
                this.#handleItemAction(event, actor, actionId)
                break
            case 'skills':
                await this.#handleSkillAction(event, actor, actionId)
                break
            case 'reaction':
                await this.#handleReactionAction(event, actor, actionId)
                break
            case 'insight':
                await this.#handleInsightAction(event, actor, actionId)
                break
            case 'weapon':
                await this.#handleWeaponAction(event, actor, actionId)
                break
            case 'spell':
                await this.#handleSpellAction(event, actor, actionId)
                break
            case 'dicepool':
                await this.#handleDicePoolAction(event, actor, actionId)
                break
            case 'utility':
                this.#handleUtilityAction(token, actionId)
                break
            }

        }

        /**
         * Handle insight actions
         * @private
         * @param {object} event
         * @param {object} actor
         * @param {string} actionId One of: spend | refresh
         */
        async #handleInsightAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()

                if (!actor) return
                if (actor?.type === 'vehicle') return

                if (!(actor?.isOwner || game.user?.isGM)) {
                    if (actionId === 'spend') ui.notifications.warn(game.i18n.localize('ARKHAM_HORROR.INSIGHT.Errors.PermissionSpend'))
                    if (actionId === 'refresh') ui.notifications.warn(game.i18n.localize('ARKHAM_HORROR.INSIGHT.Errors.PermissionRefresh'))
                    return
                }

                if (actor?.type !== 'character') return

                if (actionId === 'spend') {
                    const remaining = Number(actor.system?.insight?.remaining) || 0
                    if (remaining <= 0) {
                        ui.notifications.warn(game.i18n.format('ARKHAM_HORROR.INSIGHT.Errors.NoneRemaining', { actorName: actor.name }))
                        return
                    }

                    const SpendInsightApp = await _getSpendInsightApp()
                    if (!SpendInsightApp) return

                    SpendInsightApp.getInstance({ actor }).render(true)
                    return
                }

                if (actionId === 'refresh') {
                    const refreshInsightAndPost = await _getRefreshInsightAndPost()
                    if (!refreshInsightAndPost) return

                    await refreshInsightAndPost({ actor, source: 'sheet' })
                }
            } catch (err) {
                console.error('TAH Arkham Horror: error handling insight action', { actionId, actorId: actor?.id }, err)
            }
        }

        /**
         * Handle weapon actions
         * @private
         * @param {object} event
         * @param {object} actor
         * @param {string} actionId The item id
         */
        async #handleWeaponAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()
                if (!actor) return

                const item = actor.items?.get?.(actionId)
                if (!item) return

                const ammoMax = Number(item.system?.ammunition?.max ?? 0)
                const ammoCurrent = Number(item.system?.ammunition?.current ?? 0)
                if (ammoMax > 0 && ammoCurrent <= 0) {
                    ui.notifications.warn(game.i18n.format('ARKHAM_HORROR.Warnings.WeaponOutOfAmmo', { itemName: item.name }))
                    return
                }

                const skillKey = String(item.system?.skill ?? '')
                const skillData = actor.system?.skills?.[skillKey]
                if (!skillKey || !skillData) return

                const DiceRollApp = await _getDiceRollApp()
                if (!DiceRollApp) return

                const skillCurrent = skillData.current ?? skillData.value ?? 0
                const skillMax = skillData.max ?? 0
                const currentDicePool = actor?.system?.dicepool?.value ?? actor?.system?.dicePool?.value ?? 0

                DiceRollApp.getInstance({
                    actor,
                    skillKey,
                    skillCurrent,
                    skillMax,
                    currentDicePool,
                    weaponToUse: item,
                    spellToUse: null
                }).render(true)
            } catch (err) {
                console.error('TAH Arkham Horror: error handling weapon click', { actorId: actor?.id, itemId: actionId }, err)
            }
        }

        /**
         * Handle spell actions
         * @private
         * @param {object} event
         * @param {object} actor
         * @param {string} actionId The item id
         */
        async #handleSpellAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()
                if (!actor) return

                const item = actor.items?.get?.(actionId)
                if (!item) return

                const skillKey = String(item.system?.skill ?? '')
                const skillData = actor.system?.skills?.[skillKey]
                if (!skillKey || !skillData) return

                const DiceRollApp = await _getDiceRollApp()
                if (!DiceRollApp) return

                const skillCurrent = skillData.current ?? skillData.value ?? 0
                const skillMax = skillData.max ?? 0
                const currentDicePool = actor?.system?.dicepool?.value ?? actor?.system?.dicePool?.value ?? 0

                DiceRollApp.getInstance({
                    actor,
                    skillKey,
                    skillCurrent,
                    skillMax,
                    currentDicePool,
                    spellToUse: item,
                    weaponToUse: null
                }).render(true)
            } catch (err) {
                console.error('TAH Arkham Horror: error handling spell click', { actorId: actor?.id, itemId: actionId }, err)
            }
        }

        /**
         * Handle dice pool actions
         * @private
         * @param {object} event
         * @param {object} actor
         * @param {string} actionId One of: refresh | clear | strain
         */
        async #handleDicePoolAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()

                _debug('#handleDicePoolAction()', { actorId: actor?.id, actorName: actor?.name, actionId })

                if (!actor) return

                if (actionId === 'status' || actionId === 'damage_status' || actionId === 'horror_status') return

                if (actionId === 'injury_trauma') {
                    const InjuryTraumaRollApp = await _getInjuryTraumaRollApp()
                    if (!InjuryTraumaRollApp) return
                    InjuryTraumaRollApp.getInstance({ actor, rollKind: 'injury', modifier: 0 }).render(true)
                    return
                }

                if (actionId === 'damage_inc' || actionId === 'damage_dec') {
                    const delta = actionId === 'damage_inc' ? 1 : -1
                    const current = Number(actor.system?.damage ?? 0)
                    const max = Number(actor.system?.dicepool?.max ?? 0)
                    const next = Math.min(max, Math.max(0, current + delta))
                    await actor.update({ 'system.damage': next })
                    return
                }

                if (actionId === 'horror_inc' || actionId === 'horror_dec') {
                    const delta = actionId === 'horror_inc' ? 1 : -1
                    const current = Number(actor.system?.horror ?? 0)
                    const max = Number(actor.system?.dicepool?.max ?? 0)
                    const next = Math.min(max, Math.max(0, current + delta))
                    await actor.update({ 'system.horror': next })
                    return
                }

                if (actionId === 'inc' || actionId === 'dec') {
                    const delta = actionId === 'inc' ? 1 : -1
                    const currentValue = Number(actor.system?.dicepool?.value ?? 0)
                    const baseMax = Number(actor.system?.dicepool?.max ?? 0)
                    const damage = Number(actor.system?.damage ?? 0)
                    const effectiveMax = Math.max(0, baseMax - damage)
                    const nextValue = Math.min(effectiveMax, Math.max(0, currentValue + delta))

                    await actor.update({ 'system.dicepool.value': nextValue })
                    return
                }

                if (actionId === 'clear') {
                    await actor.update({ 'system.dicepool.value': 0 })
                    return
                }

                const refreshDicepoolAndPost = await _getRefreshDicepoolAndPost()
                if (!refreshDicepoolAndPost) return

                if (actionId === 'refresh') {
                    await refreshDicepoolAndPost({
                        actor,
                        label: game.i18n.localize('ARKHAM_HORROR.DICEPOOL.Chat.Refresh'),
                        healDamage: false
                    })
                    return
                }

                if (actionId === 'strain') {
                    if (!actor?.isOwner) {
                        ui.notifications.warn(game.i18n.localize('ARKHAM_HORROR.Warnings.PermissionStrainActor'))
                        return
                    }

                    const currentDamage = Number(actor.system?.damage ?? 0)
                    if (currentDamage <= 0) {
                        ui.notifications.warn(game.i18n.localize('ARKHAM_HORROR.Warnings.StrainRequiresDamage'))
                        return
                    }

                    await refreshDicepoolAndPost({
                        actor,
                        label: game.i18n.localize('ARKHAM_HORROR.ACTIONS.StrainOneself'),
                        healDamage: true
                    })

                    const InjuryTraumaRollApp = await _getInjuryTraumaRollApp()
                    if (!InjuryTraumaRollApp) return

                    InjuryTraumaRollApp.getInstance({
                        actor,
                        rollKind: 'injury',
                        modifier: 0,
                        rollSource: 'strain'
                    }).render(true)
                }
            } catch (err) {
                console.error('TAH Arkham Horror: error handling dicepool action', { actionId, actorId: actor?.id }, err)
            }
        }

        /**
         * Handle reaction action (skill reaction)
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The skill id/key
         */
        async #handleReactionAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()

                _debug('#handleReactionAction()', { actionId, actorId: actor?.id })

                const DiceRollApp = await _getDiceRollApp()
                if (!DiceRollApp) {
                    return
                }

                const skillKey = actionId
                const skillData = actor?.system?.skills?.[skillKey]
                if (!skillData) {
                    console.warn('TAH Arkham Horror: reaction skill data not found on actor', { actorId: actor?.id, skillKey })
                    return
                }

                const skillCurrent = skillData.current ?? skillData.value ?? 0
                const skillMax = skillData.max ?? 0
                const currentDicePool = actor?.system?.dicepool?.value ?? actor?.system?.dicePool?.value ?? 0

                const rollKind = this.action?.system?.rollKind ?? 'reaction'
                const options = {
                    actor,
                    rollKind,
                    skillKey,
                    skillCurrent,
                    skillMax,
                    currentDicePool,
                    weaponToUse: null,
                    spellToUse: null
                }

                DiceRollApp.getInstance(options).render(true)
            } catch (err) {
                console.error('TAH Arkham Horror: error handling reaction click', err)
            }
        }

        /**
         * Handle skill action (skeleton)
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The skill id/key
         */
        async #handleSkillAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()

                // If the system provides a dedicated skill roll API, prefer it.
                if (actor && typeof actor.rollSkill === 'function') {
                    return actor.rollSkill(actionId, { event })
                }

                const DiceRollApp = await _getDiceRollApp()
                if (!DiceRollApp) return

                const skillKey = actionId
                const skillData = actor?.system?.skills?.[skillKey]
                if (!skillData) {
                    console.warn('TAH Arkham Horror: skill data not found on actor', { actorId: actor?.id, skillKey })
                    return
                }

                const skillCurrent = skillData.current ?? skillData.value ?? 0
                const skillMax = skillData.max ?? 0
                const currentDicePool = actor?.system?.dicepool?.value ?? actor?.system?.dicePool?.value ?? 0

                DiceRollApp.getInstance({
                    actor,
                    skillKey,
                    skillCurrent,
                    skillMax,
                    currentDicePool,
                    weaponToUse: null,
                    spellToUse: null
                }).render(true)
            } catch (err) {
                console.error('TAH Arkham Horror: error handling skill click', err)
            }
        }

        /**
         * Handle item action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The action id
         */
        #handleItemAction (event, actor, actionId) {
            const item = actor.items.get(actionId)
            item.toChat(event)
        }

        /**
         * Handle utility action
         * @private
         * @param {object} token    The token
         * @param {string} actionId The action id
         */
        async #handleUtilityAction (token, actionId) {
            switch (actionId) {
            case 'endTurn':
                if (game.combat?.current?.tokenId === token.id) {
                    await game.combat?.nextTurn()
                }
                break
            }
        }
    }
})
