import { QR, Reveal, Scene, useDeck, useScene, type DeckState } from 'beatdeck';
import { config } from '../deck.config';
import { BOOT, type Live } from '../timeline';
import avatar from '../assets/avatar.jpg';

const PAD_X = 120;
const TOP = 140;
const LINE_H = 45;

function Open_() {
  const { here, b } = useScene();
  const typed = useDeck((s: DeckState<Live>) => s.live.typed);
  const dots = useDeck((s: DeckState<Live>) => s.live.dots);
  const term = here && b <= 1;
  const title = here && b === 2;
  const about = here && b === 3;

  // the terminal buffer: the command line, then rows of pytest dots.
  // Only the last BOOT.rows lines are on stage: when the buffer grows past
  // the viewport, everything moves up exactly like a real terminal.
  const cmd = config.boot;
  const buffer: React.ReactNode[] = [
    <span key="cmd">
      <span style={{ color: 'var(--accent)' }}>$</span> {cmd.slice(0, typed)}
      {dots === 0 && <span className="cursor">_</span>}
    </span>,
  ];
  const full = Math.floor(dots / BOOT.cols);
  const partial = dots % BOOT.cols;
  for (let i = 0; i < full; i++) buffer.push('.'.repeat(BOOT.cols));
  if (dots > 0) buffer.push('.'.repeat(partial));
  const visible = buffer.slice(-BOOT.rows);

  return (
    <>
      {/* 01.1–01.2 the terminal: a quiet prompt, the typed command, then pytest dots */}
      <div style={{
        position: 'absolute', left: PAD_X, top: TOP, width: 1920 - 2 * PAD_X,
        opacity: term ? 1 : 0, transition: 'opacity 300ms',
      }}>
        {visible.map((l, i) => (
          <div key={i} className="mono" style={{
            fontSize: 30, height: LINE_H, lineHeight: `${LINE_H}px`, whiteSpace: 'nowrap',
            color: i === 0 ? 'var(--ink)' : 'var(--ink-2)',
          }}>{l}</div>
        ))}
      </div>

      {/* 01.3 title */}
      {config.subtitle && (
        <Reveal on={title} out={about} x={168} y={318}>
          <div className="t-eyebrow">// {config.subtitle}</div>
        </Reveal>
      )}
      <Reveal on={title} out={about} x={150} y={400} delay={120} ms={1100}>
        <div className="t-statement" style={{ fontSize: 176 }}>
          Tu CI está<br />perdiendo el tiempo<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
      </Reveal>
      {config.author && (
        <Reveal on={title} out={about} x={168} y={880} delay={400}>
          <div className="t-meta" style={{ fontSize: 24 }}>{config.author}</div>
        </Reveal>
      )}
      {/* the live deck: QR on the title slide, so people can follow along */}
      <Reveal on={title} out={about} x={1480} y={730} delay={800}>
        <QR url={config.qrUrl} size={270} />
        <div className="t-meta" style={{ fontSize: 18, marginTop: 18, width: 270, textAlign: 'center', textTransform: 'none', letterSpacing: '0.02em' }}>{config.qrLabel}</div>
      </Reveal>

      {/* 01.4 about me — photo left, name / handle / role right */}
      <Reveal on={about} x={190} y={300}>
        <img src={avatar} alt="Federico Mon" style={{
          height: 440, width: 440, borderRadius: '50%', objectFit: 'cover',
          border: '2px solid var(--hair-strong)', display: 'block',
        }} />
      </Reveal>
      <Reveal on={about} x={780} y={330} delay={250}>
        <div className="t-statement" style={{ fontSize: 140 }}>Federico Mon</div>
      </Reveal>
      <Reveal on={about} x={784} y={560} delay={450}>
        <div className="mono" style={{ fontSize: 44, color: 'var(--accent)' }}>@gnufede</div>
      </Reveal>
      <Reveal on={about} x={784} y={680} delay={650}>
        <div className="t-editorial" style={{ fontSize: 56 }}>Test Optimization @ DataDog</div>
      </Reveal>
    </>
  );
}

/** 01 OPEN — the pytest terminal boot, the title (with the live-deck QR), about me. */
export const Open = () => <Scene index={0}><Open_ /></Scene>;
