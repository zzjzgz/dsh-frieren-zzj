/**
 * The Frieren theme settings section: one column rendering the theme-owned
 * item contributions, registered into the settings shell's `settings.section`
 * nav. Mirrors the General section pattern — the section declares its own
 * item slot so rows never touch another feature's surface.
 */
import type { PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import css from './FriSection.module.css'

/** Full component props: section owner share plus item render share. */
export type FriSectionProps =
  PropsRuntime<'settings.section'> & PropsRenderSlots<'settings.frieren.item'>

/**
 * Render the Frieren theme section content column.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export function FriSection({ renderSlot }: FriSectionProps) {
  return (
    <div className={css.section}>
      {renderSlot('settings.frieren.item', {})}
    </div>
  )
}
