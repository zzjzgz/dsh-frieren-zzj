/**
 * Standalone browser platform modules, mirrored from the harness's
 * packages/client/web/src/platform.ts. The browser bundle keeps these
 * external (the shell's module table answers them at runtime).
 */
export const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-web-react',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-schema-form',
] as const

export type PlatformModule = (typeof PLATFORM_MODULES)[number]
