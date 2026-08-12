import { getSystemCompat } from './system-compat.js'
import { TOOLTIP_SUPPRESS_CLASS } from './constants.js'

export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
    const ITEM_ACTION_CLASS = 'tah-arkham-item-action'

    const escapeHtml = value => String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')

    const localize = (key, fallback = key) => {
        const value = coreModule.api.Utils.i18n(key)
        return value && value !== key ? value : fallback
    }

    const enrichItemField = async (item, key) => {
        const value = foundry.utils.getProperty(item, key)
        if (!value) return ''

        return foundry.applications.ux.TextEditor.implementation.enrichHTML(value, {
            secrets: item.isOwner,
            async: true,
            rollData: item.getRollData(),
            relativeTo: item
        })
    }

    const buildItemTooltip = async (item, { properties = [], fields = ['system.description'] } = {}) => {
        const propertyHtml = properties
            .filter(property => property.value !== null && property.value !== undefined && property.value !== '')
            .map(property => `<span class="tah-arkham-tooltip-property"><strong>${escapeHtml(property.label)}:</strong> ${escapeHtml(property.value)}</span>`)
            .join('&nbsp;|&nbsp;')

        const fieldHtml = []
        for (const field of fields) {
            const content = await enrichItemField(item, field.key ?? field)
            if (!content) continue

            const labelKey = field.labelKey
            const heading = labelKey ? `<div class="tah-arkham-tooltip-section-title">${escapeHtml(localize(labelKey))}</div>` : ''
            fieldHtml.push(`<section class="tah-arkham-tooltip-section">${heading}${content}</section>`)
        }

        const content = [
            `<div class="tah-arkham-tooltip-title">${escapeHtml(item.name)}</div>`,
            propertyHtml ? `<div class="tah-arkham-tooltip-properties">${propertyHtml}</div>` : '',
            ...fieldHtml
        ].join('')

        return `<div class="tah-arkham-item-tooltip-content">${content}</div>`
    }

    const getItemImage = item => coreModule.api.Utils.getImage(item)

    const suppressTooltips = actions => actions.map(action => ({
        ...action,
        cssClass: [...new Set([
            ...String(action.cssClass ?? '').split(/\s+/).filter(Boolean),
            TOOLTIP_SUPPRESS_CLASS
        ])].join(' ')
    }))

    /**
     * Extends Token Action HUD Core's ActionHandler class and builds system-defined actions for the HUD
     */
    ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        /**
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */
        async buildSystemActions (groupIds) {
            // IMPORTANT: This system module intentionally avoids multi-token handling.
            // DiceRollApp is singleton-based in the system and multi-token UX is currently confusing.
            // Also exclude Vehicle actors entirely.

            let actor = this.actor

            // If Core didn't provide a single actor, only build actions when exactly one token is controlled.
            if (!actor) {
                const controlledTokens = canvas?.tokens?.controlled ?? []
                const controlledActors = controlledTokens
                    .map(token => token?.actor)
                    .filter(a => !!a && a.type !== 'vehicle')

                if (controlledActors.length !== 1) return
                actor = controlledActors[0]
                this.actor = actor
            }

            if (actor?.type === 'vehicle') return

            this.actors = [actor]
            this.actorType = actor?.type
            this.systemCompat = getSystemCompat()

            await this.#buildCharacterActions(groupIds)
        }

        /**
         * Build character actions
         * @private
         */
        async #buildCharacterActions (groupIds) {
            await this.#buildSimple(groupIds)
            await this.#buildSkills(groupIds)
            await this.#buildReactions(groupIds)
            await this.#buildDicePool(groupIds)
            await this.#buildInsight(groupIds)
            await this.#buildHealing(groupIds)
            await this.#buildInjuryTrauma(groupIds)
            await this.#buildWeapons(groupIds)
            await this.#buildReferenceItems(groupIds)
            await this.#buildSpells(groupIds)
        }

        #canStrainActor () {
            const compat = this.systemCompat
            if (!compat?.apiMode) return true
            if (!compat?.resources?.strain && !compat?.dicepool?.strain) return false
            if (!compat?.resources?.canStrain) return true

            return compat.apiRoot.resources.canStrain(this.actor)?.ok === true
        }

        /**
         * Build simple-resource actions (Arkham API mode)
         * @private
         */
        async #buildSimple (groupIds) {
            const groupId = 'simple'
            if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes(groupId)) return
            if (!this.actor) return

            const compat = this.systemCompat
            if (!compat?.apiMode || !compat?.resources?.spendSimpleActionDie) return

            const actions = [
                {
                    id: 'simple_spend_regular',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.SpendRegularDie'),
                    encodedValue: ['simple', 'spend_regular'].join(this.delimiter),
                    system: { actionTypeId: 'simple', actionId: 'spend_regular' }
                },
                {
                    id: 'simple_spend_horror',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.SpendHorrorDie'),
                    encodedValue: ['simple', 'spend_horror'].join(this.delimiter),
                    system: { actionTypeId: 'simple', actionId: 'spend_horror' }
                }
            ]

            await this.addActions(suppressTooltips(actions), { id: groupId, type: 'system' })
        }

        /**
         * Build injury/trauma actions
         * @private
         */
        async #buildInjuryTrauma (groupIds) {
            if (!this.actor) return

            const injuryTraumaGroupIds = ['injury_trauma_actions', 'injuries', 'traumas']
            const requestedGroupIds = Array.isArray(groupIds) && groupIds.length > 0 ? groupIds : null
            if (requestedGroupIds && !injuryTraumaGroupIds.some(groupId => requestedGroupIds.includes(groupId))) return

            if (!this.actor.system?.dicepool) return

            const compat = this.systemCompat
            const apiMode = compat?.apiMode === true

            if ((!requestedGroupIds || requestedGroupIds.includes('injury_trauma_actions')) &&
                (!apiMode || compat?.rolls?.openInjuryTraumaDialog || compat?.rolls?.openInjuryDialog)) {
                const actions = [{
                    id: 'injury_trauma_roll',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.RollInjuryTrauma'),
                    encodedValue: ['dicepool', 'injury_trauma'].join(this.delimiter),
                    system: { actionTypeId: 'dicepool', actionId: 'injury_trauma' }
                }]
                await this.addActions(suppressTooltips(actions), { id: 'injury_trauma_actions', type: 'system' })
            }

            const items = this.actor.items?.contents ?? []
            const itemGroups = [
                { groupId: 'injuries', type: 'injury' },
                { groupId: 'traumas', type: 'trauma' }
            ]

            for (const itemGroup of itemGroups) {
                if (requestedGroupIds && !requestedGroupIds.includes(itemGroup.groupId)) continue

                const actions = await Promise.all(items
                    .filter(item => item?.type === itemGroup.type)
                    .map(async item => ({
                        id: `reference_${item.id}`,
                        name: item.name,
                        encodedValue: ['reference', item.id].join(this.delimiter),
                        system: { actionTypeId: 'reference', actionId: item.id },
                        cssClass: ITEM_ACTION_CLASS,
                        img: getItemImage(item),
                        isItem: true,
                        tooltip: {
                            content: await enrichItemField(item, 'system.description'),
                            class: 'tah-arkham-item-tooltip'
                        }
                    })))

                if (actions.length > 0) {
                    await this.addActions(actions, { id: itemGroup.groupId, type: 'system' })
                }
            }
        }

        async #buildWeapons (groupIds) {
            if (this.systemCompat?.apiMode && !this.systemCompat?.rolls?.openWeaponDialog) return

            const weaponGroupIds = ['weapons_melee', 'weapons_ranged', 'weapons_other']
            const requestedGroupIds = Array.isArray(groupIds) && groupIds.length > 0 ? groupIds : null
            if (requestedGroupIds && !weaponGroupIds.some(groupId => requestedGroupIds.includes(groupId))) return

            if (!this.actor) return

            const items = this.actor.items?.contents ?? []
            const weapons = items.filter(i => i?.type === 'weapon')
            if (weapons.length === 0) return

            const makeWeaponAction = async item => {
                const skillKey = String(item.system?.skill ?? '')
                const skillLabel = skillKey ? localize(`ARKHAM_HORROR.SKILL.${skillKey}`, skillKey) : ''
                const ammunition = item.system?.ammunition
                const ammunitionLabel = Number(ammunition?.max ?? 0) > 0
                    ? `${Number(ammunition.current ?? 0)}/${Number(ammunition.max ?? 0)}`
                    : ''

                return {
                    id: `weapon_${item.id}`,
                    name: item.name,
                    encodedValue: ['weapon', item.id].join(this.delimiter),
                    system: { actionTypeId: 'weapon', actionId: item.id },
                    cssClass: ITEM_ACTION_CLASS,
                    img: getItemImage(item),
                    tooltip: {
                        content: await buildItemTooltip(item, {
                            properties: [
                                { label: localize('ARKHAM_HORROR.PROPS.Skill'), value: skillLabel },
                                { label: localize('ARKHAM_HORROR.PROPS.Damage'), value: item.system?.damage },
                                { label: localize('ARKHAM_HORROR.PROPS.Range'), value: item.system?.range },
                                { label: localize('ARKHAM_HORROR.PROPS.InjuryRating'), value: item.system?.injuryRating },
                                { label: localize('ARKHAM_HORROR.PROPS.Ammunition'), value: ammunitionLabel }
                            ],
                            fields: [
                                'system.description',
                                { key: 'system.specialRules', labelKey: 'ARKHAM_HORROR.PROPS.SpecialRules' }
                            ]
                        }),
                        class: 'tah-arkham-item-tooltip'
                    }
                }
            }

            const weaponsByGroup = {
                weapons_melee: weapons.filter(item => item.system?.skill === 'meleeCombat'),
                weapons_ranged: weapons.filter(item => item.system?.skill === 'rangedCombat'),
                weapons_other: weapons.filter(item => !['meleeCombat', 'rangedCombat'].includes(item.system?.skill))
            }

            for (const groupId of weaponGroupIds) {
                if (requestedGroupIds && !requestedGroupIds.includes(groupId)) continue
                const actions = await Promise.all(weaponsByGroup[groupId].map(makeWeaponAction))
                if (actions.length > 0) await this.addActions(actions, { id: groupId, type: 'system' })
            }
        }

        async #buildSpells (groupIds) {
            if (this.systemCompat?.apiMode && !this.systemCompat?.rolls?.openSpellDialog) return

            const groupId = 'spells'
            if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes(groupId)) return

            if (!this.actor) return

            const items = this.actor.items?.contents ?? []
            const spells = items.filter(i => i?.type === 'spell')
            if (spells.length === 0) return

            const actions = await Promise.all(spells.map(async item => {
                const skillKey = String(item.system?.skill ?? '')
                const skillLabel = skillKey ? localize(`ARKHAM_HORROR.SKILL.${skillKey}`, skillKey) : ''

                return {
                    id: `spell_${item.id}`,
                    name: item.name,
                    encodedValue: ['spell', item.id].join(this.delimiter),
                    system: { actionTypeId: 'spell', actionId: item.id },
                    cssClass: ITEM_ACTION_CLASS,
                    img: getItemImage(item),
                    tooltip: {
                        content: await buildItemTooltip(item, {
                            properties: [
                                { label: localize('ARKHAM_HORROR.PROPS.Skill'), value: skillLabel }
                            ]
                        }),
                        class: 'tah-arkham-item-tooltip'
                    }
                }
            }))

            await this.addActions(actions, { id: groupId, type: 'system' })
        }

        async #buildReferenceItems (groupIds) {
            const itemGroupIds = ['useful_items', 'relics', 'tomes', 'favors']
            const requestedGroupIds = Array.isArray(groupIds) && groupIds.length > 0 ? groupIds : null
            if (requestedGroupIds && !itemGroupIds.some(groupId => requestedGroupIds.includes(groupId))) return
            if (!this.actor) return

            const items = this.actor.items?.contents ?? []
            const itemsByGroup = {
                useful_items: items.filter(item => item?.type === 'useful_item'),
                relics: items.filter(item => item?.type === 'relic'),
                tomes: items.filter(item => item?.type === 'tome'),
                favors: items.filter(item => item?.type === 'favor')
            }

            const makeReferenceAction = async item => {
                const usage = item.system?.usage
                const usageMax = Number(usage?.max ?? 0)
                const usageLabel = usageMax > 0
                    ? `${Number(usage?.remaining ?? 0)}/${usageMax}`
                    : ''

                const properties = [
                    { label: localize('ARKHAM_HORROR.PROPS.Quantity'), value: Number(item.system?.quantity ?? 1) > 1 ? item.system.quantity : '' },
                    { label: localize('ARKHAM_HORROR.LABELS.Remaining'), value: usageLabel }
                ]
                const fields = ['system.description']

                if (item.type === 'useful_item' && item.system?.hasSpecialRules !== false) {
                    fields.push({ key: 'system.specialRules', labelKey: 'ARKHAM_HORROR.PROPS.SpecialRules' })
                } else if (item.type === 'tome') {
                    properties.push(
                        { label: localize('ARKHAM_HORROR.ITEM.Tome.understood'), value: item.system?.understood ? localize('Yes', 'Yes') : localize('No', 'No') },
                        { label: localize('ARKHAM_HORROR.ITEM.Tome.attuned'), value: item.system?.attuned ? localize('Yes', 'Yes') : localize('No', 'No') },
                        { label: localize('ARKHAM_HORROR.ITEM.Tome.attunementDifficulty'), value: item.system?.attunementDifficulty }
                    )
                } else if (item.type === 'favor') {
                    properties.push({ label: localize('ARKHAM_HORROR.ITEM.Favor.xp'), value: item.system?.xp })
                    fields.push(
                        { key: 'system.benefit', labelKey: 'ARKHAM_HORROR.ITEM.Favor.benefit' },
                        { key: 'system.decliningText', labelKey: 'ARKHAM_HORROR.ITEM.Favor.decliningText' },
                        { key: 'system.losingText', labelKey: 'ARKHAM_HORROR.ITEM.Favor.losingText' }
                    )
                }

                return {
                    id: `reference_${item.id}`,
                    name: item.name,
                    encodedValue: ['reference', item.id].join(this.delimiter),
                    system: { actionTypeId: 'reference', actionId: item.id },
                    cssClass: ITEM_ACTION_CLASS,
                    img: getItemImage(item),
                    isItem: true,
                    tooltip: {
                        content: await buildItemTooltip(item, {
                            properties,
                            fields
                        }),
                        class: 'tah-arkham-item-tooltip'
                    }
                }
            }

            for (const groupId of itemGroupIds) {
                if (requestedGroupIds && !requestedGroupIds.includes(groupId)) continue
                const actions = await Promise.all(itemsByGroup[groupId].map(makeReferenceAction))
                if (actions.length > 0) await this.addActions(actions, { id: groupId, type: 'system' })
            }
        }

        /**
         * Build insight actions
         * @private
         */
        async #buildInsight (groupIds) {
            if (!this.actor) return

            const groupId = 'insight'
            if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes(groupId)) return

            // Only character actors have Insight in this system.
            if (this.actor?.type !== 'character') return

            const insight = this.actor.system?.insight
            if (!insight) return

            const compat = this.systemCompat
            const canSpend = !compat?.apiMode || compat?.insight?.openSpendDialog
            const canRefresh = !compat?.apiMode || compat?.insight?.refreshAndPost

            const actions = [
                ...(canSpend
                    ? [{
                        id: 'insight_spend',
                        name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.SpendInsight'),
                        encodedValue: ['insight', 'spend'].join(this.delimiter),
                        system: { actionTypeId: 'insight', actionId: 'spend' }
                    }]
                    : []),
                ...(canRefresh
                    ? [{
                        id: 'insight_refresh',
                        name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.RefreshInsight'),
                        encodedValue: ['insight', 'refresh'].join(this.delimiter),
                        system: { actionTypeId: 'insight', actionId: 'refresh' }
                    }]
                    : [])
            ]

            if (actions.length === 0) return

            await this.addActions(suppressTooltips(actions), { id: groupId, type: 'system' })
        }

        /**
         * Build healing and recovery actions
         * @private
         */
        async #buildHealing (groupIds) {
            if (!this.actor || this.actor.type === 'vehicle') return

            const canRollHealing = this.actor.type === 'character' && this.systemCompat?.rolls?.openHealDialog
            const canRecover = game.user?.isGM && this.systemCompat?.resources?.openRecoveryDialog
            if (!canRollHealing && !canRecover) return

            const healingGroupIds = ['healing_treatment', 'healing_horror', 'healing_recovery']
            const requestedGroupIds = Array.isArray(groupIds) && groupIds.length > 0 ? groupIds : null
            if (requestedGroupIds && !healingGroupIds.some(groupId => requestedGroupIds.includes(groupId))) return

            const makeHealingAction = rollKind => ({
                    id: `healing_${rollKind}`,
                    name: coreModule.api.Utils.i18n(`ARKHAM_HORROR.HEALING.RollKind.${rollKind}`),
                    encodedValue: ['healing', rollKind].join(this.delimiter),
                    system: { actionTypeId: 'healing', actionId: rollKind }
                })

            const treatmentActions = canRollHealing
                ? ['heal-damage', 'heal-injury'].map(makeHealingAction)
                : []
            const horrorActions = canRollHealing
                ? ['introspection', 'counseling'].map(makeHealingAction)
                : []
            const recoveryActions = []

            if (canRecover) {
                recoveryActions.push({
                    id: 'recovery_open',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.HEALING.Recovery.MenuLabel'),
                    encodedValue: ['recovery', 'open'].join(this.delimiter),
                    system: { actionTypeId: 'recovery', actionId: 'open' }
                })
            }

            if ((!requestedGroupIds || requestedGroupIds.includes('healing_treatment')) && treatmentActions.length > 0) {
                await this.addActions(suppressTooltips(treatmentActions), { id: 'healing_treatment', type: 'system' })
            }
            if ((!requestedGroupIds || requestedGroupIds.includes('healing_horror')) && horrorActions.length > 0) {
                await this.addActions(suppressTooltips(horrorActions), { id: 'healing_horror', type: 'system' })
            }
            if ((!requestedGroupIds || requestedGroupIds.includes('healing_recovery')) && recoveryActions.length > 0) {
                await this.addActions(suppressTooltips(recoveryActions), { id: 'healing_recovery', type: 'system' })
            }
        }

        /**
         * Build skills (skeleton)
         * @private
         */
        async #buildSkills (groupIds) {
            if (!this.actor) return

            if (this.systemCompat?.apiMode && !this.systemCompat?.rolls?.openSkillDialog) return

            // Only build the group if it's requested, or if groupIds is not provided.
            const groupId = 'complex_action'
            if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes(groupId)) return

            const skillsObject = this.actor.system?.skills ?? this.actor.system?.statistics ?? null
            if (!skillsObject || typeof skillsObject !== 'object') return

            const actions = []

            for (const [key, value] of Object.entries(skillsObject)) {
                const encodedValue = ['skills', key].join(this.delimiter)
                const labelKey = `ARKHAM_HORROR.SKILL.${key}`
                const translated = coreModule.api.Utils.i18n(labelKey)
                const name = translated && translated !== labelKey ? translated : key

                actions.push({
                    id: key,
                    name,
                    encodedValue,
                    system: { actionTypeId: 'skills', actionId: key }
                })
            }

            await this.addActions(suppressTooltips(actions), { id: groupId, type: 'system' })
        }

        /**
         * Build reactions (skill reactions)
         * @private
         */
        async #buildReactions (groupIds) {
            if (!this.actor) return

            if (this.systemCompat?.apiMode && !this.systemCompat?.rolls?.openReactionDialog) return

            const groupId = 'reactions'
            if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes(groupId)) return

            const skillsObject = this.actor.system?.skills ?? null
            if (!skillsObject || typeof skillsObject !== 'object') return

            const actions = []

            for (const [key, value] of Object.entries(skillsObject)) {
                const encodedValue = ['reaction', key].join(this.delimiter)

                const labelKey = `ARKHAM_HORROR.SKILL.${key}`
                const translated = coreModule.api.Utils.i18n(labelKey)
                const name = translated && translated !== labelKey ? translated : key

                actions.push({
                    id: `reaction_${key}`,
                    name,
                    encodedValue,
                    system: { actionTypeId: 'reaction', actionId: key, rollKind: 'reaction' }
                })
            }

            await this.addActions(suppressTooltips(actions), { id: groupId, type: 'system' })
        }

        /**
         * Build dice pool actions
         * @private
         */
        async #buildDicePool (groupIds) {
            if (!this.actor) return

            const compat = this.systemCompat
            const apiMode = compat?.apiMode === true

            const adjustGroupId = 'dicepool_adjust'
            const damageGroupId = 'damage_adjust'
            const horrorGroupId = 'horror_adjust'
            const actionsGroupId = 'dicepool_actions'
            if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes(adjustGroupId) && !groupIds.includes(damageGroupId) && !groupIds.includes(horrorGroupId) && !groupIds.includes(actionsGroupId)) return

            // Only show if the actor actually has a dice pool.
            const dicepool = this.actor.system?.dicepool
            if (!dicepool) return

            const currentValue = Number(dicepool.value ?? 0)
            const baseMax = Number(dicepool.max ?? 0)
            const damage = Number(this.actor.system?.damage ?? 0)
            const effectiveMax = Math.max(0, baseMax - damage)
            const valueText = `${currentValue}/${effectiveMax}`

            const canAdjustValue = !apiMode || compat?.dicepool?.adjustValue
            const canAdjustDamage = !apiMode || compat?.dicepool?.adjustDamage
            const canAdjustHorror = !apiMode || compat?.dicepool?.adjustHorror
            const canRefresh = !apiMode || compat?.dicepool?.refresh
            const canDiscard = !apiMode || compat?.resources?.discardDice
            const canDiscardAll = !apiMode || compat?.resources?.discardAllDice
            const canStrain = this.#canStrainActor()

            const adjustActions = []
            const damageActions = []
            const horrorActions = []
            const actions = []

            const makeAction = (idSuffix, nameKey) => {
                const encodedValue = ['dicepool', idSuffix].join(this.delimiter)
                actions.push({
                    id: `dicepool_${idSuffix}`,
                    name: coreModule.api.Utils.i18n(nameKey),
                    encodedValue,
                    system: { actionTypeId: 'dicepool', actionId: idSuffix }
                })
            }

            const makeDeltaAction = (idSuffix, label) => {
                const encodedValue = ['dicepool', idSuffix].join(this.delimiter)
                adjustActions.push({
                    id: `dicepool_${idSuffix}`,
                    name: label,
                    encodedValue,
                    system: { actionTypeId: 'dicepool', actionId: idSuffix }
                })
            }

            const makeAdjustSet = (target, idPrefix, current) => {
                const pushTo = target

                const makeAdjustAction = (idSuffix, label) => {
                    const actionId = `${idPrefix}_${idSuffix}`
                    const encodedValue = ['dicepool', actionId].join(this.delimiter)
                    pushTo.push({
                        id: `dicepool_${actionId}`,
                        name: label,
                        encodedValue,
                        system: { actionTypeId: 'dicepool', actionId }
                    })
                }

                makeAdjustAction('dec', '-1')

                const statusId = `${idPrefix}_status`
                pushTo.push({
                    id: `dicepool_${statusId}`,
                    name: String(current),
                    encodedValue: ['dicepool', statusId].join(this.delimiter),
                    system: { actionTypeId: 'dicepool', actionId: statusId },
                    cssClass: 'disabled shrink'
                })

                makeAdjustAction('inc', '+1')
            }

            if (canAdjustValue) {
                // Dicepool number manipulation is handled by system API in apiMode.
                makeDeltaAction('dec', '-1')

                // Display-only status button.
                adjustActions.push({
                    id: 'dicepool_status',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ABBR.Dicepool'),
                    encodedValue: ['dicepool', 'status'].join(this.delimiter),
                    system: { actionTypeId: 'dicepool', actionId: 'status' },
                    cssClass: 'disabled shrink',
                    info1: { text: valueText }
                })

                makeDeltaAction('inc', '+1')
            }

            // Damage/Horror adjustment groups
            const currentDamage = Number(this.actor.system?.damage ?? 0)
            const currentHorror = Number(this.actor.system?.horror ?? 0)

            if (canAdjustDamage) makeAdjustSet(damageActions, 'damage', currentDamage)
            if (canAdjustHorror) makeAdjustSet(horrorActions, 'horror', currentHorror)

            if (canRefresh) makeAction('refresh', 'ARKHAM_HORROR.ACTIONS.RefreshDicePool')
            if (canDiscard) makeAction('discard', 'ARKHAM_HORROR.ACTIONS.DiscardDie')
            if (canDiscardAll) makeAction('discard_all', 'ARKHAM_HORROR.ACTIONS.DiscardAllDice')

            if (canStrain) makeAction('strain', 'ARKHAM_HORROR.ACTIONS.StrainOneself')

            if (adjustActions.length > 0) {
                await this.addActions(suppressTooltips(adjustActions), { id: adjustGroupId, type: 'system' })
            }

            if (damageActions.length > 0) {
                await this.addActions(suppressTooltips(damageActions), { id: damageGroupId, type: 'system' })
            }

            if (horrorActions.length > 0) {
                await this.addActions(suppressTooltips(horrorActions), { id: horrorGroupId, type: 'system' })
            }

            if (actions.length > 0) {
                await this.addActions(suppressTooltips(actions), { id: actionsGroupId, type: 'system' })
            }
        }
    }
})
