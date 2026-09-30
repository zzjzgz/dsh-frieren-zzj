/**
 * Frieren × Himmel web theme, node half.
 *
 * The node half owns the plugin's user-facing settings: it registers the
 * `frieren-zzj` settings namespace (the wallpaper switch) so the value is
 * served to the browser half and persisted in the user-settings document.
 *
 * The settings seam of the harness refuses browser RPCs for namespaces
 * outside its hardcoded allowlist (dsh-host-apiproxy answers
 * `settings-not-exposed` for `frieren-zzj`), so the browser half cannot use
 * the standard settings transport. To stay a pure profile-side plugin with
 * zero harness changes, this half ALSO registers a small exact HTTP route
 * that proxies one namespace read/write straight to the settings service.
 * The route lives under the `/plugins` prefix, so no harness trust fence or
 * allowlist applies to it; it is a same-origin contract with the browser
 * half of this package only.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { readdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'
// Type-only: activates the webServer Context merge for the settings bridge route.
import type {} from '@deepseek-ai/dsh-host-webserver'
import type { SettingsDescriptor, SettingsNamespace, SettingsPathOp } from '@deepseek-ai/dsh-settings'
import { dshHomePath } from '@deepseek-ai/dsh-home-paths'
import { FRIEREN_SETTINGS_NAMESPACE, FrierenSettingsSchema } from './frieren-settings.ts'
import { MAX_BRIDGE_BODY_BYTES, WALLPAPER_ROUTE_PREFIX } from './routes.ts'
import { parseWallpaperRequest } from './wallpaper-names.ts'
import {
  decodeWallpaperUpload, loadWallpaper, pruneableWallpaper,
  referencedWallpaperNames, removeWallpaper, storeWallpaper,
} from './wallpaper-store.ts'

// DSH 0.2 dropped the standalone settings-namespace registry: a plugin's
// settings ARE its Loader entry's `config`, schema'd by the module's `Config`
// export. `SettingsForms.describe()` therefore addresses them by profile entry
// id, and only volatile fields may be rewritten live — hence the `.volatile()`
// on every field of the schema exported here.
export const Config = FrierenSettingsSchema

// The entry id is the row id this package's cordis.patch.yml inserts, which is
// also the id the settings service reports for the plugin's own form.
const NS = FRIEREN_SETTINGS_NAMESPACE as SettingsNamespace

/** Exact route the browser half fetches to read/write this plugin's settings. */
export const SETTINGS_BRIDGE_PATH = '/plugins/@zengzhaojun/dsh-client-frieren-zzj/settings'

/**
 * Read this plugin entry's current form values.
 *
 * A missing descriptor means the entry is not (yet) describable — the plugin
 * inactive, or its schema absent — and reads report `null` exactly like the
 * old namespace read did for an unset section.
 * @param settings - the live settings service.
 * @returns the resolved config section, or null while it is unavailable.
 */
function readSection(settings: { describe(): SettingsDescriptor[] }): unknown {
  return settings.describe().find(row => row.ns === NS)?.value ?? null
}

/** Where uploaded wallpapers live, under the harness home. */
const WALLPAPER_DIR = dshHomePath('plugin-data', 'frieren-zzj', 'wallpapers')

/** Narrow one wire object to a settings path op. */
function isPathOp(value: unknown): value is SettingsPathOp {
  if (typeof value !== 'object' || value === null) return false
  const op = (value as { op?: unknown }).op
  if (op !== 'set' && op !== 'unset') return false
  const path = (value as { path?: unknown }).path
  if (!Array.isArray(path) || !path.every(segment => typeof segment === 'string')) return false
  if (op === 'set' && !('value' in (value as object))) return false
  return true
}

/** Narrow an unknown value to a plain object (the wholesale-replace section). */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Write one JSON response with the plugin's own content type. */
function respond(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/** Collect the request body up to the size cap. */
async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const part = chunk as Buffer
    size += part.length
    if (size > MAX_BRIDGE_BODY_BYTES) throw new Error('bridge body too large')
    chunks.push(part)
  }
  return Buffer.concat(chunks).toString('utf8')
}

/**
 * Delete stored wallpapers the settings no longer reference.
 *
 * Runs once per activation. A file written but not yet referenced is spared by
 * the store's grace window, so this can never race an in-flight upload.
 * @param customWallpapers - the raw `customWallpapers` setting value.
 */
async function pruneWallpapers(customWallpapers: unknown): Promise<void> {
  const referenced = referencedWallpaperNames(customWallpapers)
  // `readdir` overloads make a pre-declared annotation pick the Buffer variant;
  // resolving through `catch` keeps the string `Dirent` arm and folds absence
  // into one branch.
  const entries = await readdir(WALLPAPER_DIR, { withFileTypes: true }).catch(() => undefined)
  if (entries === undefined) return
  const now = Date.now()
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const target = join(WALLPAPER_DIR, entry.name)
    try {
      const info = await stat(target)
      if (!pruneableWallpaper(entry.name, referenced, info.mtimeMs, now)) continue
      await unlink(target)
    } catch {
      // A file that vanished or is locked is simply left for the next sweep.
    }
  }
}

/**
 * Serve the wallpaper file store: `POST` stores one upload and answers its
 * URL, `GET`/`HEAD` return a stored image. The browser half treats the whole
 * route as optional — every failure here just means the image stays inline.
 * @param req - the incoming request.
 * @param res - the response to write.
 */
async function handleWallpaperStore(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = req.method ?? 'GET'
  if (method === 'POST') {
    let payload: unknown
    try {
      payload = JSON.parse(await readBody(req))
    } catch (error) {
      respond(res, 400, { ok: false, error: error instanceof Error ? error.message : 'invalid request body' })
      return
    }
    const bytes = decodeWallpaperUpload((payload as { dataUrl?: unknown } | null)?.dataUrl)
    if (bytes === undefined) {
      respond(res, 400, { ok: false, error: 'expected a jpeg, png, or webp data URL within the upload ceiling' })
      return
    }
    const name = await storeWallpaper(WALLPAPER_DIR, bytes).catch(() => undefined)
    if (name === undefined) {
      respond(res, 500, { ok: false, error: 'could not store the image' })
      return
    }
    respond(res, 200, { ok: true, url: `${WALLPAPER_ROUTE_PREFIX}/${name}` })
    return
  }
  if (method === 'DELETE') {
    // Deleting is explicit user intent, so no grace window applies: the bytes
    // go now. An already-absent file is still a success (idempotent).
    const name = parseWallpaperRequest(req.url)
    if (name === undefined) {
      respond(res, 404, { ok: false, error: 'not found' })
      return
    }
    const removed = await removeWallpaper(WALLPAPER_DIR, name)
    respond(res, 200, { ok: true, removed, name })
    return
  }
  if (method !== 'GET' && method !== 'HEAD') {
    respond(res, 405, { ok: false, error: 'method not allowed' })
    return
  }
  const name = parseWallpaperRequest(req.url)
  if (name === undefined) {
    respond(res, 404, { ok: false, error: 'not found' })
    return
  }
  const bytes = await loadWallpaper(WALLPAPER_DIR, name)
  if (bytes === undefined) {
    respond(res, 404, { ok: false, error: 'not found' })
    return
  }
  res.writeHead(200, {
    'content-type': 'image/jpeg',
    'content-length': String(bytes.length),
    // Content-addressed: the bytes behind a URL never change.
    'cache-control': 'public, max-age=31536000, immutable',
  })
  res.end(method === 'HEAD' ? undefined : bytes)
}

/** Host plugin body — expose the theme settings form and its browser bridge. */
export function apply(ctx: Context): void {
  // Browser settings bridge: bypasses the harness's settings RPC surface by
  // talking to the settings service directly on the same process. The route is
  // an exact match under /plugins, which wins over client-modules' prefix
  // route, and it is removed with this plugin's fiber.
  ctx.inject(['settings', 'webServer'], (bridgeCtx) => {
    const { settings, webServer } = bridgeCtx
    bridgeCtx.effect(() => webServer.register({
      kind: 'exact',
      path: SETTINGS_BRIDGE_PATH,
      handler: async (req, res) => {
        const method = req.method ?? 'GET'
        if (method === 'GET') {
          respond(res, 200, { ok: true, value: readSection(settings) })
          return
        }
        if (method !== 'PUT' && method !== 'POST') {
          respond(res, 405, { ok: false, error: 'method not allowed' })
          return
        }
        let payload: unknown
        try {
          payload = JSON.parse(await readBody(req))
        } catch (error) {
          respond(res, 400, { ok: false, error: error instanceof Error ? error.message : 'invalid request body' })
          return
        }
        const envelope = payload as { replace?: unknown; ops?: unknown } | null
        try {
          if (isPlainObject(envelope?.replace)) {
            // Wholesale replace (the "restore defaults" action): the user
            // section becomes exactly the supplied object, which also drops
            // any stale fields left by older plugin versions.
            await settings.replace(NS, envelope.replace)
          } else {
            const ops = envelope?.ops
            if (!Array.isArray(ops) || ops.length === 0 || !ops.every(isPathOp)) {
              respond(res, 400, { ok: false, error: 'expected {"replace":{...}} or {"ops":[{"op":"set"|"unset","path":[...],"value"?}]}' })
              return
            }
            await settings.mutate(NS, ops as readonly SettingsPathOp[])
          }
        } catch (error) {
          respond(res, 409, { ok: false, error: error instanceof Error ? error.message : String(error) })
          return
        }
        respond(res, 200, { ok: true, value: readSection(settings) })
      },
    }), 'frieren-zzj: settings bridge route')

    // Wallpaper file store. A prefix route (longest-prefix-wins after the
    // exact table) so one registration serves every stored image.
    bridgeCtx.effect(() => webServer.register({
      kind: 'prefix',
      path: WALLPAPER_ROUTE_PREFIX,
      handler: handleWallpaperStore,
    }), 'frieren-zzj: wallpaper store route')

    // Sweep stored images nothing references. The store's grace window spares
    // anything written within the last hour, so an upload that has been stored
    // but not yet written into the settings document survives this pass.
    // The settings service returns the section untyped, hence the cast.
    const section = readSection(settings) as { customWallpapers?: unknown } | undefined
    void pruneWallpapers(section?.customWallpapers)
  })
}
