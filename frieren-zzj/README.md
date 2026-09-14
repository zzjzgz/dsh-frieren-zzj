# @zengzhaojun/dsh-client-frieren-zzj

dsh-芙莉莲-zzj — Frieren × Himmel (葬送のフリーレン) decorative web theme: an
alias-token override layer, a global stylesheet, and decorative slot entries. The browser
half stacks the token layer through the theme service, injects the global
stylesheet (fantasy serif headings, gold-lilac scrollbar, sparkles,
blue-moon-weed flowers, magic circles), and
registers the frame stage, the hero seal, the header badge, and the rotating
Himmel dock quote into their slots (click the line to roll the next quote).
Initial state has NO wallpaper; users can upload their own image as the
full-page background and adjust its blur and dimming.

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
  as an independent fixed layer (`position:fixed; z-index:-2`) with
  `transform:scale(1.1)` and `transition:filter 0.3s ease`, that does not
  interfere with the body's own CSS,
  - **wallpaper gallery and rotation**: uploads accumulate into a gallery
  (capped at 6 images, each removable, plus clear-all) stored as one JSON array
  field. The legacy single `customWallpaper` field keeps working — the resolver
  folds it into the gallery until the first edit clears it. With two or more
  images a rotation row appears: interval (5s–10min) and order (in order /
  shuffle, where shuffle always lands on a different image than the current
  one). A single image starts no timer, so its behavior is unchanged,
  - **wallpaper file store** (node half): `POST <wallpaper prefix>` decodes a
  jpeg/png/webp data URL and writes it content-addressed under
  `dshHomePath('plugin-data', 'frieren-zzj', 'wallpapers')`, answering
  `<prefix>/<sha256-32>.jpg`; `GET`/`HEAD` serve it back with an immutable
  cache header. The browser half treats the store as an optimization: any
  failure (old node half, disk error, missing file) falls back to inlining the
  image as a data URL, exactly as before. Removing a gallery entry, clearing the
  gallery, and importing a backup each issue explicit `DELETE`s for the files
  the edit orphans — content addressing means a file two entries share is
  dropped only when the last reference goes — and every activation additionally
  sweeps what the settings no longer reference, sparing anything written within
  the last five minutes so an in-flight upload is never deleted. Capacity is
  checked before anything reaches the store, so a pick refused by a full gallery
  leaves no file behind, and an upload that a concurrent edit refuses is deleted
  again by the same diff. Known limitation: an
  exported backup carries the store URLs rather than the image bytes, so a
  backup moved to another machine (or imported after `plugin-data` was deleted)
  needs those images uploaded again,
  - **wallpaper blur** (0px–20px): a slider that adjusts the CSS `filter: blur()`
  of the wallpaper layer in real time, plus four preset buttons (none / light /
  medium / heavy); changes animate smoothly via `transition: filter 0.3s ease`.
  `transform: scale(1.1)` prevents blurred edges from showing. Only shown when a
  wallpaper is set,
  - **wallpaper dimming** (0%–80%): a slider that stacks a black shading
  gradient over the wallpaper image so text stays readable on busy backgrounds,
  plus four presets (none / light / medium / heavy). 0% composes the bare image
  URL, so an unused slider renders identically to the layer before this
  feature. Only shown when a wallpaper is set,
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
- decoration tuning: element density (0.25×–2×, thinning the set with an even
  stride so it spreads across the viewport instead of collapsing to one side),
  animation speed (0.25×–4×, scaling every sparkle and blossom duration), and
  magic-circle scale (0.5×–2×, resizing around the circle's own centre), plus a
  reset-to-neutral button,
- performance tiers (full / balanced / eco): one click writes the density, the
  speed, and the material together (eco switches to `plain`, away from the
  expensive `backdrop-filter`); the row shows "custom" once any of the three has
  been hand-tuned,
- a dark-mode starfield: a fixed, slowly drifting star layer behind the content
  and above the wallpaper (`z-index: -1`), lit only under
  `body[data-ds-dark-theme]`. Focus mode takes it down with the rest of the
  scenery, and reduced motion freezes the drift,
- a casting badge (`conversation.input.overlay`): while the addressed agent is
  running, a small spinning magic circle with 「詠唱中…」 floats above the
  composer card; it renders nothing while idle, so it never reserves layout.
  Session-scoped, so it reads the busy flag through the runtime-provided
  `useSession` standard prop,
- focus mode: one switch (and the sidebar seal, which toggles the same field
  when clicked) that hides the animated scenery — sparkles, blossoms, magic
  circle, ribbon, vignette — while the wallpaper, palette, chrome, seal, badge,
  and quote stay. While it is on, the seal renders dimmed and desaturated,
- backup & share: export the whole configuration as a JSON document, or import
  one. Import validates every field individually, merges the recognized ones
  over the current settings (a file predating a field, or one without a
  wallpaper, never clears it), and reports the keys it skipped,
- quote rotation mode (random / fixed) over an 8-line quote library; in either
  mode, clicking the dock line rolls the next quote (session-local — the roll
  is not persisted),
- **restore defaults** button (at the bottom): replaces the whole section with
  the default values (no wallpaper, glass material, all decorations on, random
  quote mode, blur reset to 0px, clears custom wallpaper and stale fields
  from older plugin versions) and re-enables the plugin.

All rows read through a revision-cached observable; every field falls back to
its default while no settings document is present.

## Reduced Motion

`prefers-reduced-motion: reduce` is honored. The decorative animations stop
while the decorations stay on screen: sparkles rest at their lit opacity,
blossoms park inside the viewport instead of freezing above the top edge or
mid-fall, the magic circle holds its shape, and the wallpaper layer's
blur/dimming transition is dropped. This follows the operating system setting —
the plugin adds no row for it.

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
