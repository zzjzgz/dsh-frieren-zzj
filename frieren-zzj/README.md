# @zengzhaojun/dsh-client-frieren-zzj

dsh-芙莉莲-zzj — Frieren × Himmel (葬送のフリーレン) decorative web theme: an
alias-token override layer, a global stylesheet, and decorative slot entries. The browser
half stacks the token layer through the theme service, injects the global
stylesheet (fantasy serif headings, gold-lilac scrollbar, sparkles,
blue-moon-weed flowers, magic circles), and
registers the frame stage, the hero seal, the header badge, and the rotating
Himmel dock quote into their slots. Initial state has NO wallpaper; users can
upload their own image as the full-page background and adjust its opacity.

## Configuration

The plugin owns a dedicated **「芙莉莲主题」settings section** (a
`settings.section` entry beside the shell's General page) with durable
`frieren-zzj` namespace rows:

- **plugin master switch** (defaults on): off removes EVERY theme effect —
  token layer, chrome stylesheet, wallpaper, stage, glass, seal, badge, dock
  quote — so the app returns to its default look; the section keeps only the
  switch and the restore button so it can always be turned back on,
- appearance (light / dark / system — rides the theme service's own
  `ui-theme` preference namespace, in sync with the built-in Appearance row),
- custom wallpaper upload stored as a downscaled JPEG data URL in the
  settings document (uploading again replaces the image; "remove wallpaper"
  clears it). Initial state is NO wallpaper; after upload, the image renders
  as an independent fixed layer (`position:fixed; z-index:-2`) that does not
  interfere with the body's own CSS,
- **wallpaper opacity** (0%–100%): a slider that adjusts the CSS `opacity` of
  the wallpaper layer in real time (0% = invisible, 100% = fully opaque);
  only shown when a wallpaper is set,
- overall material (glass / plain): `glass` applies a FIXED frosted look to
  the input card (`[data-composer-card]`), the task-list dock card
  (`[data-testid='todo-panel']`), the goal dock card
  (`[data-goal-bar] > :first-child`), and the settings panel
  (`[role="dialog"][aria-modal="true"]`)
  via `backdrop-filter`, following the OceanAvenu Dark Glass method
  (https://blog.csdn.net/qq_43433246/article/details/162127888): very
  low-alpha background, strong blur (28px light / 40px dark), low-opacity
  white border, a light directional floating shadow, generous rounding — light and dark variants
  are baked in and NOT user-adjustable; `plain` removes the stylesheet and
  every card falls back to its default surface. Message-area cards (bubbles,
  tool cards) are deliberately not glassed and the message area stays
  transparent, so the wallpaper remains fully visible. Dark rules ride
  `body[data-ds-dark-theme]`, so the dark glass follows the user's manual
  light/dark/system preference, not the OS media query,
- per-layer decoration toggles (sparkles, blossoms, magic circle, ribbon,
  vignette),
- quote rotation mode (daily / random / fixed) over an 8-line quote library,
- **restore defaults** button (at the bottom): replaces the whole section with
  the default values (no wallpaper, glass material, all decorations on, random
  quote mode, opacity reset to 100%, clears custom wallpaper and stale fields
  from older plugin versions) and re-enables the plugin.

All rows read through a revision-cached observable; every field falls back to
its default while no settings document is present.

## Model Experience

None, as this package affects no model context: it only overrides theme
tokens, injects a static stylesheet, and registers decorative slot entries.

#### KV Cache effect

Does not invalidate: the package neither reads nor writes model requests, so
it never changes the prompt or message prefix; provider cache availability and
eviction remain outside the package contract.

## Known Limitations and Deferred Work

- Custom wallpapers persist as JPEG data URLs inside the user settings
  document (uploads are downscaled to a 1920px long edge first).
- Quote lines are fan-curated Japanese originals with fan glosses, not
  official translations.
- Heading fonts load from Google Fonts at runtime; offline sessions fall back
  to local serif stacks.
