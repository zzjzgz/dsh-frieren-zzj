/**
 * Frieren × Himmel theme chrome stylesheet: fonts, headings, scrollbar,
 * selection, focus ring, and the seal/badge/dock slot chrome. Applied
 * whenever the plugin is composed; the wallpaper scene (watercolor background
 * and its decorative stage) lives in ./fri-theme.css.ts and is gated by the
 * wallpaper switch.
 */
export const FRI_BASE_CSS = `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Noto+Serif+SC:wght@400;500;600&display=swap');

h1, h2, h3, h4, h5, h6, [class*="title"] {
  font-family: 'Cinzel', 'Noto Serif SC', Georgia, 'Songti SC', serif !important;
  letter-spacing: 0.03em;
}

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--dsw-alias-brand-primary, #5a63b8), var(--dsw-alias-state-warn-primary, #c08f3e));
  border-radius: 8px;
}

::selection { background: rgba(90, 99, 184, 0.30); }

:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #5a63b8);
  outline-offset: 1px;
}

@keyframes fri-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 0.55; transform: scale(1.15) rotate(20deg); }
}

@keyframes fri-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fri-seal {
  position: relative;
  width: 32px;
  height: 32px;
  margin: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f7ead0, #e3c98f);
  border: 2px solid #c9a44d;
  box-shadow: 0 0 12px rgba(220, 180, 99, 0.45);
  cursor: default;
}
.fri-seal-ring {
  position: absolute;
  inset: 3px;
  border: 1px dashed #b08f3c;
  border-radius: 50%;
  opacity: 0.7;
  animation: fri-spin 14s linear infinite;
}

.fri-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Cormorant Garamond', 'Noto Serif SC', Georgia, 'Songti SC', serif;
  font-size: 12.5px;
  letter-spacing: 0.14em;
  color: var(--dsw-alias-brand-primary, #5a63b8);
  opacity: 0.92;
  white-space: nowrap;
}

.fri-dock {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-family: 'Cormorant Garamond', 'Noto Serif SC', Georgia, 'Songti SC', serif;
  font-size: 12.5px;
  letter-spacing: 0.06em;
  color: var(--dsw-alias-label-secondary, #6f6a80);
}
.fri-dock-star {
  color: var(--dsw-alias-state-warn-primary, #c08f3e);
  animation: fri-twinkle 3s ease-in-out infinite;
}
.fri-dock-sub {
  font-size: 11px;
  opacity: 0.75;
  letter-spacing: 0.12em;
}
`
