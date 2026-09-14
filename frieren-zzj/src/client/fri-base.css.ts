/**
 * Frieren × Himmel theme chrome stylesheet: fonts, headings, scrollbar,
 * selection, focus ring, and the seal/badge/dock slot chrome. Applied
 * whenever the plugin is composed; the wallpaper scene (watercolor background
 * and its decorative stage) lives in ./fri-theme.css.ts and is gated by the
 * wallpaper switch.
 */
import { FRI_REDUCED_MOTION_CSS } from './fri-theme.css.ts'

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
  cursor: pointer;
  transition: opacity 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}
.fri-seal:hover {
  box-shadow: 0 0 16px rgba(220, 180, 99, 0.65);
}
.fri-seal:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #5a63b8);
  outline-offset: 2px;
}

/* Focus mode is on: the ring reads as "set aside" — dimmed, drained of glow. */
.fri-seal-focused {
  opacity: 0.55;
  filter: saturate(0.45);
  box-shadow: none;
}
.fri-seal-focused .fri-seal-ring {
  animation: none;
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

/* The dock quote is clickable: one click rolls the next line. */
.fri-dock-clickable {
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  padding: 2px 4px;
  transition: opacity 0.15s ease;
}
.fri-dock-clickable:hover { opacity: 1; }
.fri-dock-clickable:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #5a63b8);
  outline-offset: 2px;
}

/* Casting badge: floats above the composer card while the agent is working.
   Its host (the composer's overlay anchor) is a zero-height strip pinned to
   the card's top edge, and entries position themselves against the card with
   bottom: 100% plus a gap. */
.fri-casting {
  position: absolute;
  bottom: 100%;
  right: 12px;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 11px 4px 7px;
  border-radius: 999px;
  font-family: 'Cormorant Garamond', 'Noto Serif SC', Georgia, 'Songti SC', serif;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--dsw-alias-brand-primary, #5a63b8);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(154, 163, 232, 0.35);
  box-shadow: 0 2px 10px rgba(90, 99, 184, 0.12);
  -webkit-backdrop-filter: blur(8px) saturate(1.1);
  backdrop-filter: blur(8px) saturate(1.1);
  pointer-events: none;
}
body[data-ds-dark-theme] .fri-casting {
  background: rgba(28, 30, 52, 0.55);
  border-color: rgba(154, 163, 232, 0.28);
  color: var(--dsw-alias-brand-primary, #9aa3e8);
}
.fri-casting-ring {
  flex: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px dashed currentColor;
  animation: fri-spin 3.2s linear infinite;
}

${FRI_REDUCED_MOTION_CSS}
`
