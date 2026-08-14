# Token Action HUD Arkham Horror RPG

![Downloads](https://img.shields.io/github/downloads/fresnoth/fvtt-token-action-hud-arkham-horror/total)

System module for [**Token Action HUD Core**](https://foundryvtt.com/packages/token-action-hud-core) that adds a fast action HUD for the [**Arkham Horror RPG (FVTT)**](https://github.com/MrTheBino/arkham-horror-rpg-fvtt) system.

![Demo](.github/readme/token-action-hud-v1410-arkham-horror.gif)

***Demo above running Arkham Horror RPG v14.2 and Token Action HUD Arkham Horror RPG v14.1***

## Requirements

- Foundry VTT: `>= v13.351`
- [**Arkham Horror RPG (FVTT)**](https://github.com/MrTheBino/arkham-horror-rpg-fvtt): `>= 13.0.35`
- [**Token Action HUD Core**](https://foundryvtt.com/packages/token-action-hud-core): `>= 2.1.1`

### **Upgrading from Token Action HUD Arkham Horror RPG 14.0.0 or earlier in an existing world**

Version 14.1.0 changes the default HUD group structure. Token Action HUD Core sometimes may not merge new defaults into a user specific saved customized layout. After upgrading, reload the world. If the split Weapons groups or the new Healing, Injury & Trauma, Knacks, and Items groups are missing, follow [Upgrading Existing HUD Layouts](#upgrading-existing-hud-layouts).

## Now available in 14.1.0+
This is considered a **stable release candidate** and is mostly feature complete at this stage. We will continue to update for Foundry, TAH Core and underlying Arkham Horror RPG system enhancements.

### Rolls and Actions

- **Simple**:  Spend a Regular Die or Horror Die.
- **Complex**:  Roll any available skill through the system dice roll dialog.
- **Reaction**:  Roll skills in reaction mode through the system dice roll dialog.
- **Weapons**:  See owned weapons by **Melee Combat**, **Ranged Combat**, or **Other**, then open the system weapon roll dialog.
- **Spells**:  See owned spells and open the system spell roll dialog.
- **Injury & Trauma**:  Roll for Injury & Trauma and view the actor's current Injuries and Traumas.

### Resources and Recovery

- **Dicepool**:  Adjust Dicepool, Damage, and Horror; Refresh; Discard Die; Discard All Dice; or Strain.
- **Insight**:  Spend or Refresh Insight through the system workflow.
- **Healing** *(Arkham Horror RPG 14.2+ only)*:  Heal Damage, Heal Injury, Introspection, Counseling, and *GM-only Recovery*.

### Character Knacks and Items

- **Knacks** — See Tier 1 through Tier 4 Knacks and NPC Weaknesses and open their item sheets.
- **Items** — See owned Protective Equipment, special rules-bearing Useful Items, Relics, Tomes, and Favors, and open their item sheets.

### Tooltips and Images!

Knacks, Weapons, Spells, and Items now support Token Action HUD Core's **Display Icons**. If Core's Full tooltip mode is on this module provides compact, enriched Arkham statistics, rules, and reference details from these items where available.

## Upgrading an existing world to v14.1.0

Upon upgrade to v14.1.0 Token Action HUD Core can *in some cases preserve saved user layouts* and does not merge new module defaults into them. After upgrading and reloading the world, If the new groups are already present, do not reset the layout.

### Quick Option: Reset Layout

Each affected user can select a token, unlock the HUD, open **Edit HUD** (pencil icon), and choose **Reset Layout**.

Or as a GM in in Game Settings -> Token Action HUD Core -> Layout Settings -> Reset All Layouts to do the above for all users in the game world.

This rebuilds the HUD from the current module defaults, but clears:

- The current user's saved group arrangement, custom groups, and HUD position.
- The selected actor's saved HUD group settings and action selections.

### Preserve a Customized Layout

To preserve a customized layout, unlock the HUD and use its `+` controls and context menus to update it manually

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

## Installation

### Manifest URL

- `https://github.com/fresnoth/fvtt-token-action-hud-arkham-horror/releases/latest/download/module.json`

### Steps

1. In Foundry, go to **Add-on Modules** → **Install Module**.
2. Paste the manifest URL.
3. Install.
4. Enable **Token Action HUD Core** and **Token Action HUD Arkham Horror RPG** in your world.

## License

This Foundry VTT module is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/) and this work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Development

- Install deps: `npm ci`
- Build minified bundle: `npm run build`
- Watch mode: `npm run dev`

### Smoke Testing

- Run the Foundry smoke checklist in `SMOKE-TEST.md` after making action routing changes.

Output bundle: `scripts/fvtt-token-action-hud-arkham-horror.min.js`

### Future Features

For planned work and deferred ideas, see [Future Features](futurefeatures.md).
