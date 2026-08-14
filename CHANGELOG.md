# Changelog

## 14.1.0

### Upgrade Notice - Existing Worlds coming from <= v14.0.0 Arkham Horror TAH

- Version 14.1.0 changes default group IDs and nesting for Weapons and Injury & Trauma, and adds Healing, Knacks, and Items groups.
- Token Action HUD Core can sometimes preserve saved user and actor layouts and will not merge these new defaults into them.
- The module will check for groups introduced by the new layout on the first HUD build and will show affected clients a one-time dismissable warning pointing to the README guide.

#### If the new groups are missing
- An affected user can **Unlock HUD -> Edit HUD -> Reset Layout**
**OR**
- **As a GM in Game Settings -> Token Action HUD Core -> Layout Settings -> Reset All Layouts**

**IMPORTANT NOTE** both of the above options will remove any user specific HUD customization but is the fastest path if users are not seeing some of the new options that they should.  It does not modify Arkham actor or item data.

If users need to preserve a customized layout they can manually replace the legacy Weapons and Injury & Trauma subgroups and add the new top-level groups using Token Action HUD Core 2.1's unlock, `+`, and context-menu controls.

### Added

#### **Updates for Arkham Horror RPG System 14.2+**
- Added a Healing group with Heal Damage, Heal Injury, Introspection, and Counseling rolls through `api.rolls.openHealDialog`.
- Added the (GM-only workflow dialog) **Recovery** to the Healing group through `api.resources.openRecoveryDialog`.
- Added Treatment, Horror, and Recovery subgroups under Healing.

#### Updates for all
- Added an Injury & Trauma category with the Roll Injury/Trauma and current Injury and Trauma item references.
- Added Melee Combat, Ranged Combat, and Other subgroups under Weapons.
- Added an Item category with non-rolling Protective Equipment, Useful Item, Relic, Tome, and Favor references that open their item sheets.
- Added German, French, and Spanish translations for the module-owned HUD labels.
- Added a Knacks category with non-rolling Knacks, and subgroups Tier 1 through Tier 4 and NPC-only Weaknesses that open their item sheets.
- Added item image tags and tooltips for Weapons, Spells, Protective Equipment, Useful Items, Relics, Tomes, and Favors.

### Changed

#### **Changes for Arkham Horror RPG System 14.2+**
- Strain remains a Dicepool action however, it will only appear if the actor has taken damage, now following `api.resources.canStrain`, including Major NPC restrictions and once-only use.

#### Clean-up and bug fixes
- Removed the obsolete Arkham Horror selectable HUD style and replaced it with always-loaded, Arkham-scoped css styling that works with Core themes.
- General cleanup of the repo from dead TAH Core template code.
- Eliminated redundant tooltips throughout Dicepool, Simple, Complex, Reaction, Insight, and Healing.
- Moved Roll Injury/Trauma out of Dicepool and into a new category Injury & Trauma

## 14.0.0 - 2026-07-31

- Tested to allow compatibility with Foundry v14.359, Arkham Horror RPG 14.1.0.1 and Token Action HUD Core 2.1.1

## 13.0.3 - 2026-02-20

### ADVISORY
- Breaking-change advisory: Token Action Hud module `v13.0.2` does not correctly update dicepool via increment/decrement actions on Arkham Horror RPG system `>= 13.0.37`. Users should upgrade to module `v13.0.3` or newer when upgrading the base system.
- Strongly recommend updating to at least Arkham Horror RPG 13.0.37 to get the full functionality from the added "Simple Actions" functions if you have not already done so.

### Added

- Added runtime compatibility helper (`scripts/system-compat.js`) for Arkham API capability detection.
- Added API mode threshold constant `ARKHAM_API_MIN_VERSION = 13.0.37`.
- Added a new top-level **Simple** group (API mode) with:
- `Spend Regular Die` -> `api.resources.spendSimpleActionDie(..., { dieType: "regular" })`
- `Spend Horror Die` -> `api.resources.spendSimpleActionDie(..., { dieType: "horror" })`

### Changed

- Added API-first routing in `scripts/roll-handler.js` for Arkham `>= 13.0.37`:
- Skills: `api.rolls.openSkillDialog`
- Reactions: `api.rolls.openReactionDialog`
- Weapons: `api.rolls.openWeaponDialog`
- Spells: `api.rolls.openSpellDialog`
- Dicepool: `adjustDamage`, `adjustHorror`, `adjustValue`, `refresh`, `strain`, `openInjuryTraumaDialog`, `resources.discardDice`, `resources.discardAllDice`
- Insight: `openSpendDialog`, `refreshAndPost`
- In API mode, required method mismatches now fail closed (warning + no-op), with no legacy fallback.
- In legacy mode (`< 13.0.37`), existing dynamic-import routing remains.
- Action rendering in `scripts/action-handler.js` now hides/omits action groups when required API methods are unavailable in API mode.
- In the Dicepool actions group:
- `Clear` was replaced by `Discard All Dice`.
- Added `Discard Die`.

### Notes

- Dicepool operations in API mode avoid direct actor updates and defer to system API semantics.

## 13.0.2 (2026-02-04)

- Fix Token Action HUD Core requirement being treated as an exact version; use minimum compatibility instead.

## 13.0.1 (2026-02-03)

- Update minimum supported Arkham Horror RPG system version to 13.0.35.
- Update injury/trauma roll integration for Arkham Horror RPG system API changes (13.0.34+).
