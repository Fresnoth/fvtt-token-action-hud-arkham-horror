# Token Action HUD Arkham Horror RPG

System module for [**Token Action HUD Core**](https://foundryvtt.com/packages/token-action-hud-core) that adds a fast action HUD for the [**Arkham Horror RPG (FVTT)**](https://github.com/MrTheBino/arkham-horror-rpg-fvtt) system.

This is an **ALPHA** build focused on usability and stability. For planned work and deferred ideas, see [Future Features](futurefeatures.md).

## Requirements

- Foundry VTT: `v13`
- Arkham Horror RPG System: `>= 13.0.32`
- Token Action HUD Core: `>= 2.0.0`

## What is available in ALPHA (current tabs)

- **Dicepool**: DP +/-, Damage/Horror +/- , Refresh, Clear, Strain, Injury/Trauma (opens the system roll dialog)
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

Output bundle: `scripts/fvtt-token-action-hud-arkham-horror.min.js`

## License

This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/) and this work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).