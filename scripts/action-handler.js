export let ActionHandler = null

Hooks.once('tokenActionHudCoreApiReady', async (coreModule) => {
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

            await this.#buildCharacterActions(groupIds)
        }

        /**
         * Build character actions
         * @private
         */
        async #buildCharacterActions (groupIds) {
            await this.#buildSkills(groupIds)
            await this.#buildReactions(groupIds)
            await this.#buildDicePool(groupIds)
            await this.#buildInsight(groupIds)
            await this.#buildInjuryTrauma(groupIds)
            await this.#buildWeapons(groupIds)
            await this.#buildSpells(groupIds)
        }

        /**
         * Build injury/trauma actions
         * @private
         */
        async #buildInjuryTrauma (groupIds) {
            if (!this.actor) return

            const groupId = 'injury_trauma'

            // Only show if the actor has a dice pool (strain depends on it).
            if (!this.actor.system?.dicepool) return

            const actions = [
                {
                    id: 'injury_trauma_roll',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.RollInjuryTrauma'),
                    encodedValue: ['dicepool', 'injury_trauma'].join(this.delimiter),
                    system: { actionTypeId: 'dicepool', actionId: 'injury_trauma' }
                },
                {
                    id: 'injury_trauma_strain',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.StrainOneself'),
                    encodedValue: ['dicepool', 'strain'].join(this.delimiter),
                    system: { actionTypeId: 'dicepool', actionId: 'strain' }
                }
            ]

            await this.addActions(actions, { id: groupId, type: 'system' })
        }

        async #buildWeapons (groupIds) {
            const groupId = 'weapons'
            if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes(groupId)) return

            if (!this.actor) return

            const items = this.actor.items?.contents ?? []
            const weapons = items.filter(i => i?.type === 'weapon')
            if (weapons.length === 0) return

            const actions = weapons.map(item => ({
                id: `weapon_${item.id}`,
                name: item.name,
                encodedValue: ['weapon', item.id].join(this.delimiter),
                system: { actionTypeId: 'weapon', actionId: item.id }
            }))

            await this.addActions(actions, { id: groupId, type: 'system' })
        }

        async #buildSpells (groupIds) {
            const groupId = 'spells'
            if (Array.isArray(groupIds) && groupIds.length > 0 && !groupIds.includes(groupId)) return

            if (!this.actor) return

            const items = this.actor.items?.contents ?? []
            const spells = items.filter(i => i?.type === 'spell')
            if (spells.length === 0) return

            const actions = spells.map(item => ({
                id: `spell_${item.id}`,
                name: item.name,
                encodedValue: ['spell', item.id].join(this.delimiter),
                system: { actionTypeId: 'spell', actionId: item.id }
            }))

            await this.addActions(actions, { id: groupId, type: 'system' })
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

            const actions = [
                {
                    id: 'insight_spend',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.SpendInsight'),
                    encodedValue: ['insight', 'spend'].join(this.delimiter),
                    system: { actionTypeId: 'insight', actionId: 'spend' }
                },
                {
                    id: 'insight_refresh',
                    name: coreModule.api.Utils.i18n('ARKHAM_HORROR.ACTIONS.RefreshInsight'),
                    encodedValue: ['insight', 'refresh'].join(this.delimiter),
                    system: { actionTypeId: 'insight', actionId: 'refresh' }
                }
            ]

            await this.addActions(actions, { id: groupId, type: 'system' })
        }

        /**
         * Build skills (skeleton)
         * @private
         */
        async #buildSkills (groupIds) {
            if (!this.actor) return

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

            await this.addActions(actions, { id: groupId, type: 'system' })
        }

        /**
         * Build reactions (skill reactions)
         * @private
         */
        async #buildReactions (groupIds) {
            if (!this.actor) return

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

            await this.addActions(actions, { id: groupId, type: 'system' })
        }

        /**
         * Build dice pool actions
         * @private
         */
        async #buildDicePool (groupIds) {
            if (!this.actor) return

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

            // Dicepool number manipulation (clamped in RollHandler).
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

            // Damage/Horror adjustment groups
            const currentDamage = Number(this.actor.system?.damage ?? 0)
            const currentHorror = Number(this.actor.system?.horror ?? 0)

            makeAdjustSet(damageActions, 'damage', currentDamage)
            makeAdjustSet(horrorActions, 'horror', currentHorror)

            makeAction('refresh', 'ARKHAM_HORROR.ACTIONS.RefreshDicePool')
            makeAction('clear', 'ARKHAM_HORROR.ACTIONS.ClearDicePool')

            // Safety net: keep these accessible under Dicepool even if the Injury/Trauma tab is not rendered for any reason.
            makeAction('injury_trauma', 'ARKHAM_HORROR.ACTIONS.RollInjuryTrauma')
            makeAction('strain', 'ARKHAM_HORROR.ACTIONS.StrainOneself')

            if (adjustActions.length > 0) {
                await this.addActions(adjustActions, { id: adjustGroupId, type: 'system' })
            }

            if (damageActions.length > 0) {
                await this.addActions(damageActions, { id: damageGroupId, type: 'system' })
            }

            if (horrorActions.length > 0) {
                await this.addActions(horrorActions, { id: horrorGroupId, type: 'system' })
            }

            if (actions.length > 0) {
                await this.addActions(actions, { id: actionsGroupId, type: 'system' })
            }
        }
    }
})
