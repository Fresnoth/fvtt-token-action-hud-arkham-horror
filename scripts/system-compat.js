import { ARKHAM_API_MIN_VERSION } from './constants.js'

function _isAtLeastVersion (currentVersion, minimumVersion) {
    if (!currentVersion) return false
    return !foundry.utils.isNewerVersion(minimumVersion, currentVersion)
}

function _getApiRoot () {
    return game?.arkhamhorrorrpgfvtt?.api ?? null
}

export function getSystemCompat () {
    const systemVersion = game?.system?.version ?? ''
    const apiRoot = _getApiRoot()
    const apiMode = _isAtLeastVersion(systemVersion, ARKHAM_API_MIN_VERSION)

    return {
        systemId: game?.system?.id ?? '',
        systemVersion,
        apiMode,
        apiRoot,
        rolls: {
            openSkillDialog: typeof apiRoot?.rolls?.openSkillDialog === 'function',
            openReactionDialog: typeof apiRoot?.rolls?.openReactionDialog === 'function',
            openWeaponDialog: typeof apiRoot?.rolls?.openWeaponDialog === 'function',
            openSpellDialog: typeof apiRoot?.rolls?.openSpellDialog === 'function',
            openInjuryTraumaDialog: typeof apiRoot?.rolls?.openInjuryTraumaDialog === 'function',
            openInjuryDialog: typeof apiRoot?.rolls?.openInjuryDialog === 'function'
        },
        dicepool: {
            adjustDamage: typeof apiRoot?.dicepool?.adjustDamage === 'function',
            adjustHorror: typeof apiRoot?.dicepool?.adjustHorror === 'function',
            adjustValue: typeof apiRoot?.dicepool?.adjustValue === 'function',
            clear: typeof apiRoot?.dicepool?.clear === 'function',
            setValue: typeof apiRoot?.dicepool?.setValue === 'function',
            refresh: typeof apiRoot?.dicepool?.refresh === 'function',
            strain: typeof apiRoot?.dicepool?.strain === 'function'
        },
        insight: {
            openSpendDialog: typeof apiRoot?.insight?.openSpendDialog === 'function',
            spendAndPost: typeof apiRoot?.insight?.spendAndPost === 'function',
            refreshAndPost: typeof apiRoot?.insight?.refreshAndPost === 'function'
        },
        resources: {
            spendSimpleActionDie: typeof apiRoot?.resources?.spendSimpleActionDie === 'function',
            discardDice: typeof apiRoot?.resources?.discardDice === 'function',
            discardAllDice: typeof apiRoot?.resources?.discardAllDice === 'function'
        }
    }
}
