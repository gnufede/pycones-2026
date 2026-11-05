import { QR, Reveal, Scene, qrConfigured, useScene } from 'beatdeck';
import { config } from '../deck.config';

const SUMMARY = [
  'sys.monitoring API is great',
  'Import dependencies matter',
  'TIA has to be fast and reliable',
  'Better be conservative than aggressively skipping tests',
];

const BEYOND: [string, string][] = [
  ['Benchmarks', 'Why run benchmarks that are not relevant with the changes?'],
  ['Flaky test detection (deflaker)', 'If a test fails and is not actually impacted by the changes, it is flaky'],
];

function End_() {
  const { here, b } = useScene();
  const at = (n: number) => here && b >= n;
  const qr = qrConfigured(config.qrUrl);
  return (
    <>
      {/* 08.1 summary */}
      <Reveal on={here && b === 0} out={at(1)} x={160} y={170}>
        <div className="t-eyebrow">// summary</div>
      </Reveal>
      {SUMMARY.map((s, i) => (
        <Reveal key={s} on={here && b === 0} out={at(1)} x={160} y={330 + i * 160} delay={150 + i * 150}>
          <div className="t-eyebrow" style={{ fontSize: 24, marginBottom: 22 }}>{String(i + 1).padStart(2, '0')}</div>
          <div className="t-editorial" data-exact style={{ fontSize: 64 }}>{s}</div>
        </Reveal>
      ))}

      {/* 08.2 beyond TIA */}
      <Reveal on={here && b === 1} out={at(2)} x={160} y={170}>
        <div className="t-eyebrow">// beyond TIA</div>
      </Reveal>
      <Reveal on={here && b === 1} out={at(2)} x={160} y={280} delay={150}>
        <div className="t-statement" style={{ fontSize: 90 }}>Other uses for<br />coverage <span style={{ color: 'var(--accent)' }}>∩</span> git diff</div>
      </Reveal>
      {BEYOND.map(([k, v], i) => (
        <Reveal key={k} on={here && b === 1} out={at(2)} x={160} y={640 + i * 160} delay={350 + i * 200}>
          <div style={{ display: 'flex', gap: 60, alignItems: 'baseline' }}>
            <div className="t-editorial" style={{ fontSize: 46, width: 640, whiteSpace: 'nowrap' }}>{k}</div>
            <div className="t-editorial" data-exact style={{ fontSize: 36, width: 900, color: 'var(--ink-2)' }}>{v}</div>
          </div>
        </Reveal>
      ))}

      {/* 08.3 gracias */}
      <Reveal on={at(2)} x={150} y={400}>
        <div className="t-statement" style={{ fontSize: 220 }}>¡Gracias<span style={{ color: 'var(--accent)' }}>!</span></div>
      </Reveal>
      <Reveal on={at(2)} x={160} y={700} delay={250}>
        <div className="t-editorial" style={{ fontSize: 72 }}>¿Preguntas?</div>
      </Reveal>
      {config.author && (
        <Reveal on={at(2)} x={168} y={880} delay={400}>
          <div className="t-meta" style={{ fontSize: 26 }}>{config.author}</div>
        </Reveal>
      )}
      {qr && (
        <Reveal on={at(2)} x={1440} y={330} delay={500}>
          <QR url={config.qrUrl} size={320} />
          {config.qrLabel && (
            <div className="t-meta" style={{ fontSize: 18, marginTop: 24, width: 320, textAlign: 'center', textTransform: 'none', letterSpacing: '0.02em' }}>{config.qrLabel}</div>
          )}
        </Reveal>
      )}
    </>
  );
}

/** 08 END — summary, what else coverage ∩ git diff is good for, and thanks. */
export const End = () => <Scene index={7}><End_ /></Scene>;
