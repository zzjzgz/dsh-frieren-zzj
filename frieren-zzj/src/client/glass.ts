/**
 * iOS-style frosted-glass material stylesheet — applied to input cards AND
 * the settings panel.
 *
 * Follows the iOS glassmorphism design language (see Apple's Human Interface
 * Guidelines and typical glassmorphism references): a semi-transparent white
 * background so the wallpaper shows through, a moderate `backdrop-filter` blur
 * with saturation boost, a translucent white border, a soft directional shadow,
 * and generous rounding. Light and dark variants are baked in (dark uses an
 * even lower-alpha dark base with a subtler white border); the material is
 * fixed — users only choose glass vs plain, nothing is adjustable.
 *
 * Targets (stable selectors):
 * - `[data-composer-card]` — the input card (ui-conversation InputBar);
 * - `[data-testid='todo-panel']` — the task-list dock card (ui-conversation
 *   TodoPanel; the root element IS the card);
 * - `[data-goal-bar] > :first-child` — the goal dock CARD (ui-goal GoalBar:
 *   `data-goal-bar` sits on the full-width positioning dock, whose only
 *   child is the 36px card, so the glass lands on the card, not the dock
 *   strip).
 * - `[role="dialog"][aria-modal="true"]` — the settings modal panel
 *   (ui-settings-general SettingsRoot: the centered 800px panel that
 *   contains every settings section).
 *
 * Message-area cards (bubbles, tool cards) are deliberately NOT glassed —
 * they keep their default surfaces, and the message area stays transparent,
 * so the wallpaper remains fully visible.
 *
 * `backdrop-filter` paints on the element itself, so it is immune to the
 * stacking-context isolation that broke earlier overlay tricks; the input
 * overlays inside the card are `position: absolute` (unaffected by the new
 * containing block) and every fixed-position popover portals to
 * `document.body`, so nothing can be trapped.
 *
 * Dark mode is keyed on `body[data-ds-dark-theme]` (the theme presenter's
 * own switch), so the dark glass params follow the user's manual
 * light/dark/system preference — not the OS media query.
 */

/** Glass targets: the input card, task-list and goal dock CARDS, plus the
 * settings modal panel. Message-area cards keep their default surfaces so
 * the wallpaper stays visible. */
const GLASS_CARDS: readonly string[] = [
  '[data-composer-card]',
  "[data-testid='todo-panel']",
  '[data-goal-bar] > :first-child',
  '[role="dialog"][aria-modal="true"]',
]

/** The fixed iOS-style glass-material stylesheet; injected while inputMaterial = 'glass'. */
export const GLASS_CSS = `${GLASS_CARDS.join(',\n')} {
  background: rgba(255, 255, 255, 0.25) !important;
  -webkit-backdrop-filter: blur(16px) saturate(1.8);
  backdrop-filter: blur(16px) saturate(1.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 24px !important;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2) !important;
}
${GLASS_CARDS.map(selector => `body[data-ds-dark-theme] ${selector}`).join(',\n')} {
  background: rgba(18, 18, 40, 0.2) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  backdrop-filter: blur(20px) saturate(1.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 24px !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36) !important;
}`
