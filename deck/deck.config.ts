/**
 * Everything that may need changing five minutes before going on stage lives here.
 * After editing, rebuild (`npm run build` / `npm run present`).
 */
export const config = {
  title: 'Tu CI está perdiendo el tiempo',
  /** One line under the title. Empty = none. */
  subtitle: 'y la TIA lo sabe',
  author: 'Federico Mon — PyConES 2026',
  /** Typed on the standby screen, then the title lands. */
  boot: 'pytest -q',
  /** Destination of the QR on the closing screen. "TODO" = no QR (the presenter view warns). Never guess it. */
  qrUrl: 'https://github.com/gnufede/pycones-2026',
  /** Shown under the QR. */
  qrLabel: 'github.com/gnufede/pycones-2026',
} as const;
