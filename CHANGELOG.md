# Changelog

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
