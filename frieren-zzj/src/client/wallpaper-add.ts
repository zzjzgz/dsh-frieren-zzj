/**
 * The upload flow as a testable orchestrator.
 *
 * The order of side effects is the whole point: capacity is checked BEFORE
 * anything reaches the node half's file store, because an upload that is then
 * refused leaves a file on disk that no gallery entry references — invisible in
 * the UI and impossible to remove from it. The flow also cleans up after
 * itself when a concurrent edit fills the gallery while the upload is in
 * flight.
 *
 * Kept free of React and DOM imports so the ordering rules are unit-testable.
 */
import { MAX_WALLPAPERS } from '../frieren-settings.ts'
import { wallpaperFilesToDelete } from '../wallpaper-names.ts'

/** Collaborators the flow drives; every one is injected so tests can falsify them. */
export interface WallpaperAddPorts {
  /** Downscale the picked file into a data URL. */
  encode: () => Promise<string>
  /** Hand the image to the file store, returning the URL to persist. */
  store: (dataUrl: string) => Promise<string>
  /** The gallery as it stands right now (fresh read, not a render-scope value). */
  readGallery: () => readonly string[]
  /** Persist the gallery the entry was added to. */
  commit: (next: readonly string[]) => void
  /** Delete files whose last reference an edit removed (best effort). */
  forget: (names: readonly string[]) => void
  /** Gallery capacity; defaults to {@link MAX_WALLPAPERS}. */
  max?: number
}

/** What one pick did. */
export type WallpaperAddResult =
  /** The image was stored and appended to the gallery. */
  | 'added'
  /** The gallery had no room; nothing was uploaded. */
  | 'full'
  /** Reading or storing the image failed; the gallery is untouched. */
  | 'failed'

/**
 * Add one picked image to the wallpaper gallery.
 * @param ports - the collaborators this flow drives.
 * @returns the outcome, so the caller can render the matching message.
 */
export async function addWallpaper(ports: WallpaperAddPorts): Promise<WallpaperAddResult> {
  const max = ports.max ?? MAX_WALLPAPERS
  try {
    // Capacity first, deliberately: a pick that will be refused must not reach
    // the store, or its file lingers with no gallery entry pointing at it.
    if (ports.readGallery().length >= max) return 'full'
    const dataUrl = await ports.encode()
    const stored = await ports.store(dataUrl)
    // Re-read after the upload: a concurrent edit may have taken the last slot
    // while this image was in flight.
    const current = ports.readGallery()
    if (current.length >= max) {
      // Nothing references the file this pick just created, so drop it. The
      // diff keeps a file the gallery still shares with it.
      ports.forget(wallpaperFilesToDelete([...current, stored], current))
      return 'full'
    }
    ports.commit([...current, stored])
    return 'added'
  } catch {
    // A decode, upload, or bridge failure leaves the gallery exactly as it was.
    return 'failed'
  }
}
