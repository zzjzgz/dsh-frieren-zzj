/**
 * Pure gate for focus mode: with decorations hidden the wallpaper, theme
 * chrome (fonts, scrollbar, seal, badge, quote) and glass material all stay —
 * only the animated scenery is dropped, so a busy scene can be cleared without
 * giving up the theme. Free of DOM and React imports so the gate is
 * unit-testable under `node --test`.
 */

/**
 * Decide whether the decorative stage renders.
 * @param enabled - the plugin master switch.
 * @param focusMode - the focus-mode switch (decorations off, theme kept).
 * @returns true only while the theme is on and focus mode is off.
 */
export function decorationsVisible(enabled: boolean, focusMode: boolean): boolean {
  return enabled && !focusMode
}
