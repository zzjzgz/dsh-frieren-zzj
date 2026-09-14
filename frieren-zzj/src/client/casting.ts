/**
 * Pure visibility gate for the casting indicator (the floating "詠唱中…"
 * badge inside the composer card). Kept free of DOM and React imports so the
 * gate is unit-testable under `node --test`.
 */

/**
 * Decide whether the casting badge renders.
 * @param enabled - the plugin master switch.
 * @param running - the addressed agent's busy state (absent = not running).
 * @returns true exactly while the theme is on and the agent is working.
 */
export function castingVisible(enabled: boolean, running: boolean | undefined): boolean {
  return enabled && running === true
}
