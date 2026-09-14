/**
 * HTTP paths this package owns, shared by both halves so the browser and the
 * host can never drift apart. Everything lives under the `/plugins` prefix,
 * which no harness trust fence or settings allowlist applies to: these are
 * same-origin contracts between this package's own two halves.
 */

/**
 * Wallpaper file store owned by the node half.
 *
 * `POST <prefix>` accepts `{ "dataUrl": "data:image/jpeg;base64,…" }` and
 * answers `{ "ok": true, "url": "<prefix>/<id>.jpg" }` after writing the bytes
 * under the harness home; `GET <prefix>/<id>.jpg` serves them back. The
 * browser half treats this as an optional optimization: when it is missing or
 * fails, the image is stored inline as a data URL exactly as before.
 */
export const WALLPAPER_ROUTE_PREFIX = '/plugins/@zengzhaojun/dsh-client-frieren-zzj/wallpaper'

/**
 * Largest JSON body either half accepts on this package's own routes.
 *
 * It is sized for the worst case a wallpaper upload can produce: a maximum
 * image travels base64-inflated (4 characters per 3 bytes) inside a JSON
 * envelope, so the ceiling must clear that with room for the wrapper.
 */
export const MAX_BRIDGE_BODY_BYTES = 8 * 1024 * 1024
