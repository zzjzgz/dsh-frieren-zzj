/**
 * Package-owned invariant companion for `@deepseek-ai/dsh-client-frieren-zzj`.
 * @module @deepseek-ai/dsh-client-frieren-zzj/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-frieren-zzj'

/** Cordis companion plugin name. */
export const name = 'frieren-zzj-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: the theme surface is presentation-only. The token
 * layer is validated and published by the theme registry, the slot entries
 * ride the slot system, and the stylesheet is static text injected by this
 * plugin's own fiber. There is no durable state or event/data relation this
 * package owns.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
