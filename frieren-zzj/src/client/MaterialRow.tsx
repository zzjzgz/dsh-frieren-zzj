/**
 * Input-bar material row in the Frieren theme section: glass / plain
 * segmented choice. Glass applies the fixed frosted treatment (article
 * method, not adjustable); plain restores the default input-card surface.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { InputMaterial } from '../frieren-settings.ts'
import type { FrierenLocaleKey } from './locales.ts'
import css from './fri-rows.module.css'

/** Registrant-private business face: the material write plus its observable. */
export interface MaterialRowInjected {
  /** Persist the input-bar material. */
  setMaterial: (material: InputMaterial) => void
  /** Bare observable of the current material. */
  hooks: {
    material: {
      getSnapshot(): InputMaterial
      subscribe(fn: () => void): () => void
    }
    enabled: {
      getSnapshot(): boolean
      subscribe(fn: () => void): () => void
    }
  }
}

/** Full component props: runtime share + locale seat + the injected face. */
export type MaterialRowProps =
  PropsRuntime<'settings.frieren.item'> & PropsLocale<'settings.frieren'> & InjectFace<MaterialRowInjected>

/** Materials in display order. */
const MATERIALS: readonly { id: InputMaterial; labelKey: FrierenLocaleKey }[] = [
  { id: 'glass', labelKey: 'material.glass' },
  { id: 'plain', labelKey: 'material.plain' },
]

/**
 * Render the input-bar material row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function MaterialRow({ t, setMaterial, useMaterial, useEnabled }: MaterialRowProps) {
  const pluginEnabled = useEnabled(value => value)
  const material = useMaterial(value => value) ?? 'glass'
  if (pluginEnabled === false) return null
  return (
    <div className={css.group}>
      <div className={css.copy}>
        <div className={css.title}>{t('material.title')}</div>
        <div className={css.description}>{t('material.description')}</div>
      </div>
      <div className={css.segmented}>
        {MATERIALS.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={css.segBtn}
            aria-pressed={material === id}
            onClick={() => { setMaterial(id) }}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  )
}
