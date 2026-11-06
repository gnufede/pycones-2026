import type { Position, TimelineHost } from 'beatdeck';
import { config } from './deck.config';

/** Geometry of the boot terminal (also read by the scene that renders it). */
export const BOOT = {
  /** visible rows of the terminal */
  rows: 19,
  /** dots per row (terminal width in characters) */
  cols: 93,
  /** total dots: fill the viewport, then scroll 8 more rows up */
  get totalDots() {
    return 26 * this.cols;
  },
} as const;

/** Automatic sub-state. Every field has a value for every beat, so any beat renders straight from the URL. */
export interface Live {
  /** 01.2 characters of the boot command typed so far. */
  typed: number;
  /** 01.2 progress dots printed by pytest so far. */
  dots: number;
}

export function initialLive({ scene: s, beat: b }: Position): Live {
  return {
    typed: s === 0 && b <= 1 ? 0 : config.boot.length,
    dots: s === 0 && b === 1 ? 0 : BOOT.totalDots,
  };
}

/** Motion that runs by itself inside a beat. Only where the talk wants it; everything else waits for a click. */
export function timeline({ scene: s, beat: b }: Position, host: TimelineHost<Live>) {
  if (s === 0 && b === 1) {
    const cmd = config.boot;
    for (let i = 1; i <= cmd.length; i++) host.at(300 + i * 38, () => host.setLive({ typed: i }));

    // pytest collects for a couple of seconds, then the dots start —
    // slowly at first, faster as the suite warms up, filling the screen
    // and scrolling it up like a real terminal.
    let t = 300 + cmd.length * 38 + 2000;
    let printed = 0;
    let rate = 2;
    while (printed < BOOT.totalDots) {
      const step = Math.min(rate, BOOT.totalDots - printed);
      const at = printed + step;
      host.at(t, () => host.setLive({ dots: at }));
      printed = at;
      rate = Math.min(rate + 1, 40);
      t += 30;
    }
    host.at(t + 700, () => host.autoGo({ scene: 0, beat: 2 }));
  }
}
