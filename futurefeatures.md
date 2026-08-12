# Future Features (Roadmap)

This file contains **only** the ideas/features that are **not implemented yet**.

## HUD / UX

- Replace the scoped post-render tooltip workaround if Token Action HUD Core adds a supported per-action and per-info tooltip opt-out.
- Revisit rich Weapon, Spell, Useful Item, Relic, Tome, and Favor tooltips for consistent compact typography, property spacing, and wrapping across Core styles and dock positions.

## Multi-token

- Consider opt-in support for multi-token operations where safe:
  - Clear/Refresh could apply to all selected tokens
  - Strain/Injury dialogs should remain single-token only

## Weapons

- Design and implement reload / ammo purchase workflow (do not ship without design):
  - Ensure it matches the system’s sheet logic and economy keys
  - Avoid side effects on roll-click

## Equipment and Knacks

- Consider adding other equipment and knacks as non-rolling reference actions where useful.

## Compatibility Hardening

- Add capability-first routing hardening so mode selection does not rely only on a version threshold.
  - Keep `ARKHAM_API_MIN_VERSION` as a hint, but determine API mode by required API family presence (`rolls`, `dicepool`, `insight`, `resources`).
  - If version indicates API mode but required API families are missing, fall back to legacy mode with a one-time warning.