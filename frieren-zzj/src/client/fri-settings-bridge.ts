/**
 * Browser settings transport for the Frieren theme section.
 *
 * The harness's settings RPC (`settings.describe` / `settings.mutate`)
 * refuses namespaces outside its hardcoded allowlist, so `frieren-zzj` can
 * never cross that seam. Instead this store talks to the plugin's own node
 * half through the same-origin bridge route (`/plugins/<package>/settings`),
 * which proxies straight to the settings service on the host. The surface
 * mirrors the settingsScope contract the presentation code already consumes:
 * a sync snapshot (value + revision), a subscribe/notify pair, and a `set`
 * that applies optimistically and reconciles with the host answer.
 */

import type { FrierenSettings } from '../frieren-settings.ts'

/** Same-origin bridge route registered by this package's node half. */
const SETTINGS_BRIDGE_PATH = '/plugins/@zengzhaojun/dsh-client-frieren-zzj/settings'

/** One snapshot of the durable section, revision-stamped for consumer caches. */
export interface FriSettingsSnapshot {
  status: 'ready' | 'unavailable'
  value: FrierenSettings | undefined
  revision: number
}

/** One wire write op, shaped exactly like the settings service's path op. */
interface FriBridgeOp {
  op: 'set' | 'unset'
  path: string[]
  value?: unknown
}

/**
 * Local observable store backed by the host settings bridge route. Reads
 * never block activation; writes apply optimistically, then reconcile with
 * the host's answer (or revert by re-reading when the host refuses).
 */
export class FriSettingsBridge {
  private readonly listeners = new Set<() => void>()
  private snapshot: FriSettingsSnapshot = { status: 'unavailable', value: undefined, revision: 0 }
  private started = false

  /** @returns the current sync snapshot (stable reference until the next change). */
  getSnapshot(): FriSettingsSnapshot {
    return this.snapshot
  }

  /** Observe snapshot replacements. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** Start the initial host read; safe to call more than once. */
  start(): void {
    if (this.started) return
    this.started = true
    void this.reload()
  }

  /** Drop every subscriber; the fiber is being disposed. */
  dispose(): void {
    this.listeners.clear()
  }

  /**
   * Write one field through the bridge. The optimistic snapshot renders the
   * change immediately; the host answer replaces it (or a re-read reverts it
   * when the write was refused). Never rejects: the presentation calls this
   * fire-and-forget.
   * @param field - scalar field inside the namespace section.
   * @param value - JSON-shaped value selected by the user.
   */
  async set(field: string, value: unknown): Promise<void> {
    const current = this.snapshot.value
    this.publish({
      status: 'ready',
      value: { ...(current ?? {}), [field]: value } as FrierenSettings,
      revision: this.snapshot.revision + 1,
    })
    const ops: FriBridgeOp[] = [{ op: 'set', path: [field], value }]
    try {
      const response = await fetch(SETTINGS_BRIDGE_PATH, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ops }),
      })
      const body = await response.json() as { ok?: boolean; value?: FrierenSettings | null }
      if (body.ok === true) {
        this.publish({ status: 'ready', value: body.value ?? undefined, revision: this.snapshot.revision + 1 })
        return
      }
    } catch {
      // bridge unreachable: fall through to the re-read so the UI reverts
    }
    await this.reload()
  }

  /**
   * Replace the whole section through the bridge (the "restore defaults"
   * action). The optimistic snapshot renders immediately; the host answer
   * replaces it (or a re-read reverts when the write was refused). Never
   * rejects.
   * @param section - the complete section to store (unknown fields dropped).
   */
  async replace(section: FrierenSettings): Promise<void> {
    this.publish({ status: 'ready', value: section, revision: this.snapshot.revision + 1 })
    try {
      const response = await fetch(SETTINGS_BRIDGE_PATH, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ replace: section }),
      })
      const body = await response.json() as { ok?: boolean; value?: FrierenSettings | null }
      if (body.ok === true) {
        this.publish({ status: 'ready', value: body.value ?? undefined, revision: this.snapshot.revision + 1 })
        return
      }
    } catch {
      // bridge unreachable: fall through to the re-read so the UI reverts
    }
    await this.reload()
  }

  private publish(next: FriSettingsSnapshot): void {
    this.snapshot = next
    for (const listener of this.listeners) listener()
  }

  private async reload(): Promise<void> {
    try {
      const response = await fetch(SETTINGS_BRIDGE_PATH, { method: 'GET', cache: 'no-store' })
      const body = await response.json() as { ok?: boolean; value?: FrierenSettings | null }
      if (body.ok === true) {
        this.publish({ status: 'ready', value: body.value ?? undefined, revision: this.snapshot.revision + 1 })
      }
    } catch {
      // host not reachable: keep the last snapshot; defaults continue to apply
    }
  }
}
