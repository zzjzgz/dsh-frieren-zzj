/**
 * Input-card glass material — fixed frosted-glass stylesheet.
 *
 * Follows the OceanAvenu Dark Glass method
 * (https://blog.csdn.net/qq_43433246/article/details/162127888): a very
 * low-alpha glass background so the wallpaper shows through, a strong
 * `backdrop-filter` blur, a low-opacity white border, a layered shadow, and
 * generous rounding. Light and dark variants are baked in (dark keeps an
 * even lower alpha and a subtler white border, per the article); the
 * material is fixed — users only choose glass vs plain, nothing is
 * adjustable.
 *
 * Targets (stable data attributes):
 * - `[data-composer-card]` — the input card (ui-conversation InputBar);
 * - `[data-testid='todo-panel']` — the task-list dock card (ui-conversation
 *   TodoPanel; the root element IS the card);
 * - `[data-goal-bar] > :first-child` — the goal dock CARD (ui-goal GoalBar:
 *   `data-goal-bar` sits on the full-width positioning dock, whose only
 *   child is the 36px card, so the glass lands on the card, not the dock
 *   strip).
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

/** Glass targets: the input card plus the task-list and goal dock CARDS
 * (the goal selector reaches the card through the dock's only child).
 * Message-area cards keep their default surfaces so the wallpaper stays
 * visible. */
const GLASS_CARDS: readonly string[] = [
  '[data-composer-card]',
  "[data-testid='todo-panel']",
  '[data-goal-bar] > :first-child',
]

/** The fixed glass-material stylesheet; injected while inputMaterial = 'glass'. */
export const GLASS_CSS = `${GLASS_CARDS.join(',\n')} {
  background: rgba(255, 255, 255, 0.18) !important;
  -webkit-backdrop-filter: blur(28px) saturate(1.35);
  backdrop-filter: blur(28px) saturate(1.35) !important;
  border: 1px solid rgba(255, 255, 255, 0.38) !important;
  border-radius: 14px !important;
  /* Directional float shadow: a 4px offset carries the floating feel; the
     16px blur keeps the sides from smudging the wallpaper (the earlier
     20px blur spread a visible smudge on both sides of the card). */
  box-shadow: 0 4px 16px rgba(30, 30, 70, 0.16) !important;
}
${GLASS_CARDS.map(selector => `body[data-ds-dark-theme] ${selector}`).join(',\n')} {
  background: rgba(16, 17, 33, 0.12) !important;
  -webkit-backdrop-filter: blur(40px) saturate(1.2);
  backdrop-filter: blur(40px) saturate(1.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 14px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.32) !important;
}`
