# Changelog

## Unreleased

### Added

- Added a Healing group for Arkham Horror RPG 14.2.0 with Heal Damage, Heal Injury, Introspection, and Counseling rolls through `api.rolls.openHealDialog`.
- Added the Arkham Horror RPG 14.2.0 Recovery dialog to the Healing group for GMs on character and NPC actors through `api.resources.openRecoveryDialog`.
- Added Treatment, Horror, and Recovery subgroups under Healing using the Arkham system labels.
- Added an Injury & Trauma category with the Roll Injury/Trauma workflow and current Injury and Trauma item references.
- Added Melee Combat, Ranged Combat, and Other subgroups under Weapons.
- Added non-rolling Useful Item, Relic, Tome, and Favor references that open their item sheets.
- Added Protective Equipment as the first Items subgroup with non-rolling item references.
- Added German, French, and Spanish translations for the module-owned HUD labels.
- Added a Knacks category with Knacks, Tier 1 through Tier 4, and NPC-only Weaknesses non-rolling item references.
- Added optional item image tags and rich, bounded tooltips for weapons, spells, Useful Items, Relics, Tomes, and Favors.

### Changed

- Removed unused template scaffolding, unreachable action routes, stale capability probes, and CSS selectors from older Token Action HUD Core markup.
- Suppressed redundant tooltips throughout Dicepool, Simple, Complex, Reaction, Insight, and Healing without modifying Foundry's global tooltip behavior.
- Moved Roll Injury/Trauma out of Dicepool and into Injury & Trauma; Strain remains a Dicepool action.
- Recovery is hidden from players and checked again at dispatch time so Token Action HUD matches the system sheet's GM-only workflow.
- Strain eligibility now follows `api.resources.canStrain`, including Major NPC restrictions and once-only use.
- Straining now delegates the full workflow to `api.resources.strain`, avoiding duplicate injury dialogs and preserving the system's confirmation, chat, and permission behavior.

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
