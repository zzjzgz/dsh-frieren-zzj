/**
 * DSH 0.2 settings seam tests, run with the Node built-in runner:
 *
 *   node --test test/settings-bridge.test.ts
 *
 * Since DSH 0.2 a plugin's settings ARE its Loader entry's `config`, schema'd
 * by the module's `Config` export and addressed by profile entry id. These
 * cases pin the two halves of that contract the plugin depends on: the schema
 * exposes volatile fields (an entry without one is not described at all, and
 * its fields cannot be rewritten live), and the browser bridge maps its old
 * namespace verbs onto `SettingsForms.describe/mutate/replace` exactly.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// The module resolves its wallpaper directory from $DSH_HOME while it loads,
// and activation sweeps unreferenced files there: redirect the home to a
// throwaway directory before importing so the sweep can never see the real one.
process.env.DSH_HOME = await mkdtemp(join(tmpdir(), 'frieren-zzj-settings-'))

const { apply, Config, SETTINGS_BRIDGE_PATH } = await import('../src/index.ts')
const { FRIEREN_SETTINGS_NAMESPACE, DEFAULT_FRIEREN_SETTINGS } = await import('../src/frieren-settings.ts')

/** One registered webServer route. */
interface Route {
  kind: string
  path: string
  handler: (req: FakeRequest, res: FakeResponse) => Promise<void> | void
}

interface FakeRequest {
  method: string
  url: string
  [Symbol.asyncIterator](): AsyncGenerator<Buffer>
}

interface FakeResponse {
  status: number
  body: string
  writeHead(status: number): void
  end(body?: string | Buffer): void
}

interface Write {
  kind: 'mutate' | 'replace'
  ns: string
  payload: unknown
}

/** A request whose body streams the supplied JSON text. */
function request(method: string, body?: unknown): FakeRequest {
  return {
    method,
    url: SETTINGS_BRIDGE_PATH,
    async *[Symbol.asyncIterator]() {
      if (body !== undefined) yield Buffer.from(JSON.stringify(body))
    },
  }
}

/** A response recording its status and body. */
function response(): FakeResponse {
  return {
    status: 0,
    body: '',
    writeHead(status: number) { this.status = status },
    end(body?: string | Buffer) { this.body = body === undefined ? '' : body.toString() },
  }
}

/** Boot the node half against a stub cordis context and capture what it does. */
function activate(options: { section?: unknown; fails?: boolean } = {}) {
  const routes: Route[] = []
  const writes: Write[] = []
  const described = options.section === undefined ? [] : [{ ns: FRIEREN_SETTINGS_NAMESPACE, value: options.section }]
  const reject = async (): Promise<never> => { throw new Error('host refused the write') }
  const settings = {
    describe: () => described,
    mutate: async (ns: string, ops: unknown) => {
      if (options.fails === true) return reject()
      writes.push({ kind: 'mutate', ns, payload: ops })
    },
    replace: async (ns: string, section: unknown) => {
      if (options.fails === true) return reject()
      writes.push({ kind: 'replace', ns, payload: section })
    },
  }
  const webServer = { register: (route: Route) => { routes.push(route); return () => {} } }
  const ctx = {
    inject: (_services: string[], callback: (context: unknown) => void) => {
      callback({ settings, webServer, effect: (fn: () => unknown) => { fn() } })
    },
  }
  apply(ctx as never)
  return { routes, writes }
}

/** The exact-match settings route of one activated node half. */
function bridgeRoute(routes: Route[]): Route {
  const route = routes.find(candidate => candidate.path === SETTINGS_BRIDGE_PATH)
  assert.ok(route, 'the settings bridge route must be registered')
  return route
}

// ---------------------------------------------------------------------------
// The schema must be a describable, live-editable form
// ---------------------------------------------------------------------------

/** The live schema fields the settings service walks (`schema.dict`). */
function schemaFields(): Record<string, { meta?: { volatile?: boolean } }> {
  return (Config as unknown as { dict: Record<string, { meta?: { volatile?: boolean } }> }).dict
}

test('every Config field is volatile, so DSH 0.2 describes and rewrites the entry', () => {
  const fields = Object.keys(schemaFields())
  assert.ok(fields.length > 0, 'the schema must declare fields')
  for (const field of fields) {
    assert.equal(schemaFields()[field]?.meta?.volatile, true, `field "${field}" must be volatile`)
  }
})

test('the schema covers every durable setting', () => {
  assert.deepEqual(Object.keys(schemaFields()).sort(), Object.keys(DEFAULT_FRIEREN_SETTINGS).sort())
})

// ---------------------------------------------------------------------------
// The bridge maps namespace verbs onto the 0.2 settings service
// ---------------------------------------------------------------------------

test('the bridge registers its exact settings route and the wallpaper route', () => {
  const { routes } = activate()
  assert.equal(routes.length, 2)
  assert.equal(bridgeRoute(routes).kind, 'exact')
  assert.equal(routes[1]?.kind, 'prefix')
})

test('GET answers the entry section the settings service describes', async () => {
  const { routes } = activate({ section: { enabled: false } })
  const res = response()
  await bridgeRoute(routes).handler(request('GET'), res)
  assert.equal(res.status, 200)
  assert.deepEqual(JSON.parse(res.body), { ok: true, value: { enabled: false } })
})

test('GET answers null while the entry is not describable', async () => {
  const { routes } = activate()
  const res = response()
  await bridgeRoute(routes).handler(request('GET'), res)
  assert.deepEqual(JSON.parse(res.body), { ok: true, value: null })
})

test('a path-op write goes to mutate under this entry id', async () => {
  const ops = [{ op: 'set', path: ['enabled'], value: false }]
  const { routes, writes } = activate({ section: { enabled: false } })
  const res = response()
  await bridgeRoute(routes).handler(request('PUT', { ops }), res)
  assert.deepEqual(writes, [{ kind: 'mutate', ns: FRIEREN_SETTINGS_NAMESPACE, payload: ops }])
  assert.deepEqual(JSON.parse(res.body), { ok: true, value: { enabled: false } })
})

test('a wholesale write goes to replace and echoes the new section', async () => {
  const { routes, writes } = activate({ section: DEFAULT_FRIEREN_SETTINGS })
  const res = response()
  await bridgeRoute(routes).handler(request('PUT', { replace: DEFAULT_FRIEREN_SETTINGS }), res)
  assert.deepEqual(writes, [{ kind: 'replace', ns: FRIEREN_SETTINGS_NAMESPACE, payload: DEFAULT_FRIEREN_SETTINGS }])
  assert.deepEqual(JSON.parse(res.body), { ok: true, value: DEFAULT_FRIEREN_SETTINGS })
})

test('a malformed write is refused before it reaches the settings service', async () => {
  const { routes, writes } = activate()
  for (const body of [{}, { ops: [] }, { ops: [{ op: 'set', path: 'enabled', value: 1 }] }, { ops: [{ op: 'delete', path: ['enabled'] }] }]) {
    const res = response()
    await bridgeRoute(routes).handler(request('PUT', body), res)
    assert.equal(res.status, 400, JSON.stringify(body))
  }
  assert.deepEqual(writes, [])
})

test('a refused write reports 409 instead of pretending it landed', async () => {
  const { routes, writes } = activate({ fails: true })
  const res = response()
  await bridgeRoute(routes).handler(request('PUT', { ops: [{ op: 'set', path: ['enabled'], value: false }] }), res)
  assert.equal(res.status, 409)
  assert.deepEqual(writes, [])
  assert.equal(JSON.parse(res.body).ok, false)
})

test('an unsupported method is refused', async () => {
  const { routes } = activate()
  const res = response()
  await bridgeRoute(routes).handler(request('DELETE'), res)
  assert.equal(res.status, 405)
})
