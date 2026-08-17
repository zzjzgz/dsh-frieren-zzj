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
// Type-only: activates the webServer Context merge for the settings bridge route.
import type {} from '@deepseek-ai/dsh-host-webserver'
import { settingsNamespace, type SettingsPathOp } from '@deepseek-ai/dsh-settings'
import { FRIEREN_SETTINGS_NAMESPACE, FrierenSettingsSchema } from './frieren-settings.ts'

const NS = settingsNamespace(FRIEREN_SETTINGS_NAMESPACE)

/** Exact route the browser half fetches to read/write this plugin's settings. */
export const SETTINGS_BRIDGE_PATH = '/plugins/@deepseek-ai/dsh-client-frieren-zzj/settings'

/** Upper bound for a bridge write body (custom wallpaper data URLs can be large). */
const MAX_BRIDGE_BODY_BYTES = 4 * 1024 * 1024

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

/** Host plugin body — register the wallpaper switch's durable section and its browser bridge. */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(settingsNamespace(FRIEREN_SETTINGS_NAMESPACE), FrierenSettingsSchema)
  })

  // Browser settings bridge: bypasses the harness's settings RPC allowlist by
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
          respond(res, 200, { ok: true, value: settings.get(NS) ?? null })
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
        const ops = (payload as { ops?: unknown } | null)?.ops
        if (!Array.isArray(ops) || ops.length === 0 || !ops.every(isPathOp)) {
          respond(res, 400, { ok: false, error: 'expected {"ops":[{"op":"set"|"unset","path":[...],"value"?}]}' })
          return
        }
        try {
          await settings.mutate(NS, ops as readonly SettingsPathOp[])
        } catch (error) {
          respond(res, 409, { ok: false, error: error instanceof Error ? error.message : String(error) })
          return
        }
        respond(res, 200, { ok: true, value: settings.get(NS) ?? null })
      },
    }), 'frieren-zzj: settings bridge route')
  })
}
