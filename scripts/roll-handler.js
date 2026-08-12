import { getSystemCompat } from './system-compat.js'

export let RollHandler = null

let _DiceRollApp = null

let _SpendInsightApp = null
let _refreshInsightAndPost = null

let _refreshDicepoolAndPost = null
let _InjuryTraumaRollApp = null
const _missingApiWarnings = new Set()

function _isDebugEnabled () {
    // Toggle in browser console with: globalThis.tahAhDebug = true
    return globalThis?.tahAhDebug === true
}

function _debug (...args) {
    if (!_isDebugEnabled()) return
    console.log('TAH Arkham Horror [debug]:', ...args)
}

function _warnMissingApiOnce (compat, actionFamily, methodPath) {
    const key = `${actionFamily}:${methodPath}`
    if (_missingApiWarnings.has(key)) return

    _missingApiWarnings.add(key)
    const version = compat?.systemVersion || 'unknown'
    const message = `TAH Arkham Horror: ${actionFamily} requires ${methodPath} on Arkham API mode (system ${version}).`

    console.warn(message)
    ui.notifications.warn(message)
}

function _notifySimpleSpendFailure (reason) {
    const reasonMap = {
        PERMISSION_DENIED: 'ARKHAM_HORROR.Warnings.PermissionRollActor',
        INSUFFICIENT_HORROR: 'ARKHAM_HORROR.Warnings.SimpleActionInsufficientHorror',
        INSUFFICIENT_REGULAR: 'ARKHAM_HORROR.Warnings.SimpleActionInsufficientRegular',
        INSUFFICIENT_DICEPOOL: 'ARKHAM_HORROR.Warnings.SimpleActionInsufficientDicepool',
        INSUFFICIENT_RESOURCE: 'ARKHAM_HORROR.Warnings.SimpleActionInsufficientDicepool',
        AMOUNT_INVALID: 'ARKHAM_HORROR.Warnings.SimpleActionInvalidAmount',
        HORROR_EXCEEDS_TOTAL: 'ARKHAM_HORROR.Warnings.SimpleActionInvalidHorrorSplit'
    }

    const key = reasonMap[String(reason ?? '')] ?? 'ARKHAM_HORROR.Warnings.SimpleActionSpendFailed'
    ui.notifications.warn(game.i18n.localize(key))
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

            // If single actor is selected
            if (this.actor) {
                if (this.actor?.type === 'vehicle') return
                _debug('single actor route', { actorId: this.actor?.id, actorName: this.actor?.name })
                await this.#handleAction(event, this.actor, actionTypeId, actionId)
                return
            }

            // Intentionally no multi-token handling (DiceRollApp is singleton-based).
            const controlledTokens = canvas.tokens.controlled
                .filter((token) => !!token.actor && token.actor.type !== 'vehicle')

            if (controlledTokens.length !== 1) {
                _debug('multi-token click ignored', { tokenCount: controlledTokens.length })
                return
            }

            const actor = controlledTokens[0].actor
            await this.#handleAction(event, actor, actionTypeId, actionId)
        }

        /**
         * Handle action
         * @private
         * @param {object} event        The event
         * @param {object} actor        The actor
         * @param {string} actionTypeId The action type id
         * @param {string} actionId     The actionId
         */
        async #handleAction (event, actor, actionTypeId, actionId) {
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
            case 'simple':
                await this.#handleSimpleAction(event, actor, actionId)
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
            case 'healing':
                await this.#handleHealingAction(event, actor, actionId)
                break
            case 'recovery':
                await this.#handleRecoveryAction(event, actor, actionId)
                break
            case 'weapon':
                await this.#handleWeaponAction(event, actor, actionId)
                break
            case 'spell':
                await this.#handleSpellAction(event, actor, actionId)
                break
            case 'reference':
                event?.preventDefault?.()
                this.renderItem(actor, actionId)
                break
            case 'dicepool':
                await this.#handleDicePoolAction(event, actor, actionId)
                break
            }

        }

        /**
         * Handle simple-resource actions
         * @private
         * @param {object} event
         * @param {object} actor
         * @param {string} actionId One of: spend_regular | spend_horror
         */
        async #handleSimpleAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()

                if (!actor) return

                const compat = getSystemCompat()
                if (!compat.apiMode) return

                if (!compat.resources.spendSimpleActionDie) {
                    _warnMissingApiOnce(compat, 'simple', 'api.resources.spendSimpleActionDie')
                    return
                }

                const dieType = actionId === 'spend_horror' ? 'horror' : actionId === 'spend_regular' ? 'regular' : null
                if (!dieType) return

                const outcome = await compat.apiRoot.resources.spendSimpleActionDie(actor, {
                    dieType,
                    context: 'simple',
                    source: 'token-action-hud'
                })

                if (!outcome?.ok) {
                    _notifySimpleSpendFailure(outcome?.reason)
                }
            } catch (err) {
                console.error('TAH Arkham Horror: error handling simple action', { actionId, actorId: actor?.id }, err)
                _notifySimpleSpendFailure('UNHANDLED_ERROR')
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

                const compat = getSystemCompat()

                if (actionId === 'spend') {
                    const remaining = Number(actor.system?.insight?.remaining) || 0
                    if (remaining <= 0) {
                        ui.notifications.warn(game.i18n.format('ARKHAM_HORROR.INSIGHT.Errors.NoneRemaining', { actorName: actor.name }))
                        return
                    }

                    if (compat.apiMode) {
                        if (!compat.insight.openSpendDialog) {
                            _warnMissingApiOnce(compat, 'insight', 'api.insight.openSpendDialog')
                            return
                        }

                        await compat.apiRoot.insight.openSpendDialog(actor)
                        return
                    }

                    const SpendInsightApp = await _getSpendInsightApp()
                    if (!SpendInsightApp) return

                    SpendInsightApp.getInstance({ actor }).render(true)
                    return
                }

                if (actionId === 'refresh') {
                    if (compat.apiMode) {
                        if (!compat.insight.refreshAndPost) {
                            _warnMissingApiOnce(compat, 'insight', 'api.insight.refreshAndPost')
                            return
                        }

                        await compat.apiRoot.insight.refreshAndPost(actor, { source: 'token-action-hud' })
                        return
                    }

                    const refreshInsightAndPost = await _getRefreshInsightAndPost()
                    if (!refreshInsightAndPost) return

                    await refreshInsightAndPost({ actor, source: 'sheet' })
                }
            } catch (err) {
                console.error('TAH Arkham Horror: error handling insight action', { actionId, actorId: actor?.id }, err)
            }
        }

        /**
         * Handle healing roll actions
         * @private
         * @param {object} event
         * @param {object} actor
         * @param {string} actionId The healing roll kind
         */
        async #handleHealingAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()
                if (!actor) return

                const compat = getSystemCompat()
                if (!compat.rolls.openHealDialog) {
                    _warnMissingApiOnce(compat, 'healing', 'api.rolls.openHealDialog')
                    return
                }

                await compat.apiRoot.rolls.openHealDialog(actor, { rollKind: actionId })
            } catch (err) {
                console.error('TAH Arkham Horror: error handling healing action', { actorId: actor?.id, rollKind: actionId }, err)
            }
        }

        /**
         * Handle the GM recovery tool
         * @private
         * @param {object} event
         * @param {object} actor
         * @param {string} actionId
         */
        async #handleRecoveryAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()
                if (!actor || actor.type === 'vehicle' || actionId !== 'open') return

                if (!game.user?.isGM) {
                    ui.notifications.warn(game.i18n.localize('ARKHAM_HORROR.HEALING.Reasons.PERMISSION_DENIED'))
                    return
                }

                const compat = getSystemCompat()
                if (!compat.resources.openRecoveryDialog) {
                    _warnMissingApiOnce(compat, 'recovery', 'api.resources.openRecoveryDialog')
                    return
                }

                await compat.apiRoot.resources.openRecoveryDialog(actor, { source: 'token-action-hud' })
            } catch (err) {
                console.error('TAH Arkham Horror: error handling recovery action', { actorId: actor?.id }, err)
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

                const compat = getSystemCompat()
                if (compat.apiMode) {
                    if (!compat.rolls.openWeaponDialog) {
                        _warnMissingApiOnce(compat, 'weapon', 'api.rolls.openWeaponDialog')
                        return
                    }

                    await compat.apiRoot.rolls.openWeaponDialog(actor, { itemId: actionId })
                    return
                }

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

                const compat = getSystemCompat()
                if (compat.apiMode) {
                    if (!compat.rolls.openSpellDialog) {
                        _warnMissingApiOnce(compat, 'spell', 'api.rolls.openSpellDialog')
                        return
                    }

                    await compat.apiRoot.rolls.openSpellDialog(actor, { itemId: actionId })
                    return
                }

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
         * @param {string} actionId One of: refresh | discard | discard_all | strain
         */
        async #handleDicePoolAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()

                _debug('#handleDicePoolAction()', { actorId: actor?.id, actorName: actor?.name, actionId })

                if (!actor) return

                const compat = getSystemCompat()

                if (compat.apiMode) {
                    if (actionId === 'status' || actionId === 'damage_status' || actionId === 'horror_status') return

                    if (actionId === 'injury_trauma') {
                        const injuryDialog = compat.apiRoot?.rolls?.openInjuryTraumaDialog ?? compat.apiRoot?.rolls?.openInjuryDialog
                        if (typeof injuryDialog !== 'function') {
                            _warnMissingApiOnce(compat, 'dicepool', 'api.rolls.openInjuryTraumaDialog')
                            return
                        }

                        await injuryDialog(actor, { rollKind: 'injury', modifier: 0 })
                        return
                    }

                    if (actionId === 'damage_inc' || actionId === 'damage_dec') {
                        if (!compat.dicepool.adjustDamage) {
                            _warnMissingApiOnce(compat, 'dicepool', 'api.dicepool.adjustDamage')
                            return
                        }

                        const delta = actionId === 'damage_inc' ? 1 : -1
                        await compat.apiRoot.dicepool.adjustDamage(actor, { delta })
                        return
                    }

                    if (actionId === 'horror_inc' || actionId === 'horror_dec') {
                        if (!compat.dicepool.adjustHorror) {
                            _warnMissingApiOnce(compat, 'dicepool', 'api.dicepool.adjustHorror')
                            return
                        }

                        const delta = actionId === 'horror_inc' ? 1 : -1
                        await compat.apiRoot.dicepool.adjustHorror(actor, { delta })
                        return
                    }

                    if (actionId === 'inc' || actionId === 'dec') {
                        if (!compat.dicepool.adjustValue) {
                            _warnMissingApiOnce(compat, 'dicepool', 'api.dicepool.adjustValue')
                            return
                        }

                        const delta = actionId === 'inc' ? 1 : -1
                        await compat.apiRoot.dicepool.adjustValue(actor, { delta })
                        return
                    }

                    if (actionId === 'discard') {
                        if (!compat.resources.discardDice) {
                            _warnMissingApiOnce(compat, 'dicepool', 'api.resources.discardDice')
                            return
                        }

                        const outcome = await compat.apiRoot.resources.discardDice(actor, {
                            amount: 1,
                            context: 'discard',
                            source: 'token-action-hud'
                        })

                        if (!outcome?.ok) {
                            _notifySimpleSpendFailure(outcome?.reason)
                        }
                        return
                    }

                    if (actionId === 'discard_all' || actionId === 'clear') {
                        if (!compat.resources.discardAllDice) {
                            _warnMissingApiOnce(compat, 'dicepool', 'api.resources.discardAllDice')
                            return
                        }

                        const outcome = await compat.apiRoot.resources.discardAllDice(actor, {
                            context: 'discard',
                            source: 'token-action-hud'
                        })

                        if (!outcome?.ok) {
                            _notifySimpleSpendFailure(outcome?.reason)
                        }
                        return
                    }

                    if (actionId === 'refresh') {
                        if (!compat.dicepool.refresh) {
                            _warnMissingApiOnce(compat, 'dicepool', 'api.dicepool.refresh')
                            return
                        }

                        await compat.apiRoot.dicepool.refresh(actor, {
                            label: game.i18n.localize('ARKHAM_HORROR.DICEPOOL.Chat.Refresh'),
                            healDamage: false
                        })
                        return
                    }

                    if (actionId === 'strain') {
                        const strain = compat.apiRoot?.resources?.strain ?? compat.apiRoot?.dicepool?.strain
                        if (typeof strain !== 'function') {
                            _warnMissingApiOnce(compat, 'dicepool', 'api.resources.strain')
                            return
                        }

                        await strain(actor, { source: 'token-action-hud' })
                    }

                    return
                }

                if (actionId === 'status' || actionId === 'damage_status' || actionId === 'horror_status') return

                if (actionId === 'injury_trauma') {
                    const InjuryTraumaRollApp = await _getInjuryTraumaRollApp()
                    if (!InjuryTraumaRollApp) return
                    InjuryTraumaRollApp.getInstance({ actor, rollKind: 'injury' }).render(true)
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

                if (actionId === 'discard') {
                    const currentValue = Number(actor.system?.dicepool?.value ?? 0)
                    const nextValue = Math.max(0, currentValue - 1)
                    await actor.update({ 'system.dicepool.value': nextValue })
                    return
                }

                if (actionId === 'discard_all' || actionId === 'clear') {
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

                const compat = getSystemCompat()
                if (compat.apiMode) {
                    if (!compat.rolls.openReactionDialog) {
                        _warnMissingApiOnce(compat, 'reaction', 'api.rolls.openReactionDialog')
                        return
                    }

                    const rollKind = this.action?.system?.rollKind ?? 'reaction'
                    await compat.apiRoot.rolls.openReactionDialog(actor, { skillKey: actionId, rollKind })
                    return
                }

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
         * Handle skill action
         * @private
         * @param {object} event    The event
         * @param {object} actor    The actor
         * @param {string} actionId The skill id/key
         */
        async #handleSkillAction (event, actor, actionId) {
            try {
                event?.preventDefault?.()

                const compat = getSystemCompat()
                if (compat.apiMode) {
                    if (!compat.rolls.openSkillDialog) {
                        _warnMissingApiOnce(compat, 'skills', 'api.rolls.openSkillDialog')
                        return
                    }

                    const rollKind = this.action?.system?.rollKind ?? 'complex'
                    await compat.apiRoot.rolls.openSkillDialog(actor, { skillKey: actionId, rollKind })
                    return
                }

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

    }
})
