# Future Features (Roadmap)

This file contains **only** the ideas/features that are **not implemented yet**.

## HUD / UX

- Replace the scoped post-render tooltip workaround if Token Action HUD Core adds a supported per-action and per-info tooltip opt-out.
- Consider hiding redundant single-subgroup labels through Core's supported group setting (`settings: { showTitle: false }`) rather than CSS or post-render DOM changes. Candidates: Simple, Reaction, Insight, and Spells.
- Evaluate using the Arkham Horror system's typography as the default HUD font when the Arkham style is selected.
  - Reuse system-owned font variables or loaded font faces rather than bundling duplicate font assets.
  - Keep a TAH/Core-safe fallback stack for missing fonts, partial system loads, and future system theme changes.
  - Verify compact labels, long translations, tooltips, and numeric controls at every supported HUD scale.
- Clean up rich tooltips for Weapons, Spells, Protective Equipment, Useful Items, Relics, Tomes, Favors, Knacks, Weaknesses, Injuries, and Traumas.
  - Establish a compact, consistent title/body hierarchy.
  - Improve inline property spacing, separators, alignment, and wrapping.
  - Keep enriched descriptions and special-rules sections readable without oversized or narrow tooltip layouts.
  - Verify behavior across Core styles, HUD scales, and dock positions.

## Multi-token

- Consider opt-in support for multi-token operations where safe:
  - Clear/Refresh could apply to all selected tokens
  - Strain/Injury dialogs should remain single-token only

## Weapons

- Design and implement reload / ammo purchase workflow (do not ship without design):
  - Ensure it matches the system’s sheet logic and economy keys
  - Avoid side effects on roll-click

## Equipment and Knacks

- Consider adding other equipment as non-rolling reference actions where useful.

## Compatibility Hardening

- Add capability-first routing hardening so mode selection does not rely only on a version threshold.
  - Keep `ARKHAM_API_MIN_VERSION` as a hint, but determine API mode by required API family presence (`rolls`, `dicepool`, `insight`, `resources`).
  - If version indicates API mode but required API families are missing, fall back to legacy mode with a one-time warning.
- Build and document a compatibility matrix for newly added HUD features before release.
  - Gate Healing, Recovery, Injury/Trauma workflows, Strain, and other API-backed actions by their exact public API methods.
  - Gracefully omit unavailable actions or subgroups instead of leaving dead buttons.
  - Treat optional item fields, images, and localization keys as capabilities: omit missing metadata and retain readable labels/image fallbacks.
  - Test the oldest supported Arkham release and the current release before deciding whether compatibility shims remain practical.

## Release / Upgrade Strategy

- Decide whether this release should retain Arkham `13.0.35+` compatibility or raise the manifest minimum to the first system version that supports the complete intended feature set.
  - Prefer capability-gated partial functionality when it remains maintainable.
  - Make a deliberate hard cut, update `module.json`, README, and changelog together, and remove obsolete legacy paths only if older releases cannot be supported reliably.
- Plan how existing Token Action HUD Core layouts receive the new category IDs, subgroup structure, labels, and ordering.
  - Do not silently force a world-wide reset that destroys user or actor customization.
  - Prefer a versioned, targeted migration of known old default groups when Core exposes a stable persistence API.
  - If a safe migration is unavailable, document a one-time per-user **Reset Layout** step prominently in the release notes.
  - Test default, user-customized, and actor-customized layouts before publishing.
- Before pushing or publishing, confirm the chosen compatibility policy, update verified/minimum versions, run the full smoke checklist, and ensure the development branch does not trigger release packaging unintentionally.