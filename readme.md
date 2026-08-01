# Token Action HUD Arkham Horror RPG

![Downloads](https://img.shields.io/github/downloads/fresnoth/fvtt-token-action-hud-arkham-horror/total)

System module for [**Token Action HUD Core**](https://foundryvtt.com/packages/token-action-hud-core) that adds a fast action HUD for the [**Arkham Horror RPG (FVTT)**](https://github.com/MrTheBino/arkham-horror-rpg-fvtt) system.

![Demo](.github/readme/token-action-hud-v1300-arkham-horror.gif)

This is an **ALPHA** build focused on usability and stability. For planned work and deferred ideas, see [Future Features](futurefeatures.md).

## Requirements

- Foundry VTT: `>= v13`
- Arkham Horror RPG System: `>= 13.0.35`
- Token Action HUD Core: `>= 2.0.0`

## Compatibility Mode v13.0.3

- `Arkham < 13.0.37`: legacy compatibility mode (existing dynamic-import routing).
- `Arkham >= 13.0.37`: API mode (routes through `game.arkhamhorrorrpgfvtt.api`).

API mode details:

- No legacy fallback if a required API method is missing in API mode.
- Missing methods fail closed (action is skipped and a warning is shown).
- Dicepool actions use system API methods instead of direct actor data writes.

Upgrade note:

- If you are on module `v13.0.2` and upgrade Arkham to `>= 13.0.37`, dicepool increment/decrement actions will not update correctly due to a system API breaking change.
- Upgrade this module to `v13.0.3` (or newer) when upgrading the base Arkham system.

## What is available in ALPHA (current tabs)

- **Dicepool**: DP +/-, Damage/Horror +/-, Refresh, Discard Die, Discard All Dice, Strain, Injury/Trauma
- **Simple**: Spend Regular Die / Spend Horror Die (API mode)
- **Complex**: Skill rolls (opens the system dice roll dialog)
- **Reaction**: Reaction-mode skill rolls (opens the system roll dialog)
- **Insight**: Spend / Refresh (opens the system roll dialog)
- **Weapons**: Lists owned weapons by order on the actor sheet and rolls them via the system dialog
- **Spells**: Lists owned spells by order on the actor sheet and rolls them via the system dialog

## Installation

### Manifest URL

- `https://github.com/fresnoth/fvtt-token-action-hud-arkham-horror/releases/latest/download/module.json`

### Steps

1. In Foundry, go to **Add-on Modules** → **Install Module**.
2. Paste the manifest URL.
3. Install.
4. Enable **Token Action HUD Core** and **Token Action HUD Arkham Horror RPG** in your world.

## Development

- Install deps: `npm ci`
- Build minified bundle: `npm run build`
- Watch mode: `npm run dev`

### Smoke Testing

- Run the Foundry smoke checklist in `SMOKE-TEST.md` after making action routing changes.

Output bundle: `scripts/fvtt-token-action-hud-arkham-horror.min.js`

## License

This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/) and this work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).