# Future Features (Roadmap)

This file contains **only** the ideas/features that are **not implemented yet**.

## HUD / UX

- Investigate Token Action HUD Core hover/tooltip behavior on Dicepool +/- buttons where they obscure current values.
  - Add CSS to suppress hover if needed (e.g. `pointer-events: none` for `.disabled.shrink`).

## Multi-token

- Consider opt-in support for multi-token operations where safe:
  - Clear/Refresh could apply to all selected tokens
  - Strain/Injury dialogs should remain single-token only

## Weapons

- Split weapons into groups based on linked skill:
  - **Melee Combat**-linked weapons
  - **Ranged Combat**-linked weapons
  - (Potentially sub-group further by the weapon’s associated skill)

- Design and implement reload / ammo purchase workflow (do not ship without design):
  - Ensure it matches the system’s sheet logic and economy keys
  - Avoid side effects on roll-click

## Equipment and Knacks

- Consider adding other equipment, tomes, useful items, knacks etc to the HUD if/when the system allows for a "roll description/special rules" to chat function is implemented