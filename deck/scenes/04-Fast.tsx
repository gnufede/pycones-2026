import { CountUp, Reveal, Scene, Terminal, useScene } from 'beatdeck';
import { TERM } from '../terminal';

function Fast_() {
  const { here, b, entry } = useScene();
  const at = (n: number) => here && b >= n;
  return (
    <>
      {/* 04.1 */}
      <Reveal on={here && b === 0} out={at(1)} x={150} y={300}>
        <div className="t-statement" style={{ fontSize: 150 }}>TIA needs to be <span style={{ color: 'var(--accent)' }}>fast</span>.</div>
      </Reveal>
      <Reveal on={here && b === 0} out={at(1)} x={160} y={560} delay={400}>
        <div className="t-editorial" style={{ fontSize: 60 }}>— faster than running all your tests.</div>
      </Reveal>

      {/* 04.2 break even, 50% overhead */}
      <Reveal on={here && b === 1} out={at(2)} x={160} y={170}>
        <div className="t-eyebrow">// break even example (50% overhead)</div>
      </Reveal>
      <Reveal on={here && b === 1} out={at(2)} x={160} y={330} delay={150}>
        <div className="t-meta" style={{ fontSize: 26, marginBottom: 24 }}>with TIA</div>
        <Terminal size={36} lines={TERM.breakEvenTia.map((t, i) => ({
          t, dim: i < 6, marks: i === 6 ? [{ text: '4.5s', on: true }] : [],
        }))} />
      </Reveal>
      <Reveal on={here && b === 1} out={at(2)} x={1000} y={330} delay={300}>
        <div className="t-meta" style={{ fontSize: 26, marginBottom: 24 }}>all tests, twice</div>
        <Terminal size={36} lines={TERM.breakEvenAll.map((t, i) => ({
          t, dim: i < 6, marks: i === 6 ? [{ text: '4s', on: true }] : [],
        }))} />
      </Reveal>

      {/* 04.3 coverage overhead */}
      <Reveal on={here && b === 2} out={at(3)} x={160} y={170}>
        <div className="t-eyebrow">// coverage overhead (100% overhead!)</div>
      </Reveal>
      <Reveal on={here && b === 2} out={at(3)} x={160} y={330} delay={150}>
        <Terminal size={36} lines={[
          { t: TERM.covNo, dim: true, labels: 1, marks: [{ text: '11.65s', on: true, label: 'without pytest-cov' }] },
          { t: TERM.covYes, labels: 1, marks: [{ text: '24.24s', on: true, label: 'with pytest-cov' }] },
        ]} />
      </Reveal>
      <Reveal on={here && b === 2} out={at(3)} x={1490} y={330} delay={400}>
        <div className="t-numeral" style={{ fontSize: 240 }}>
          ×<CountUp value={2} from={0} entry={entry} ms={1200} />
        </div>
        <div className="t-meta" style={{ fontSize: 26, marginTop: 30 }}>test runtime</div>
      </Reveal>

      {/* 04.4 coverage-adjusted break even */}
      <Reveal on={here && b === 3} out={at(4)} x={160} y={170}>
        <div className="t-eyebrow">// coverage-adjusted break even example</div>
      </Reveal>
      <Reveal on={here && b === 3} out={at(4)} x={160} y={300} delay={150}>
        <div className="t-meta" style={{ fontSize: 26, marginBottom: 24 }}>with coverage-based TIA</div>
        <Terminal size={30} lines={TERM.adjustedTia.map((t, i) => ({
          t,
          // 250 passed / 750 skipped: the 75% of tests you must skip to break even at ×2 overhead
          dim: i < 10 && i !== 7,
          marks: i === 7 ? [{ text: '750 skipped', on: true, label: '75% of the tests' }] : [],
          labels: i === 7 ? 1 : 0,
        }))} />
      </Reveal>
      <Reveal on={here && b === 3} out={at(4)} x={1100} y={300} delay={300}>
        <div className="t-meta" style={{ fontSize: 26, marginBottom: 24 }}>all tests, three times</div>
        <Terminal size={30} lines={TERM.adjustedAll.map((t, i) => ({
          t, dim: i < 5, marks: i === 5 ? [{ text: '3000s', on: true }] : [],
        }))} />
      </Reveal>
      <Reveal on={here && b === 3} out={at(4)} x={160} y={930} delay={600}>
        <div className="t-editorial" style={{ fontSize: 48 }}>
          ×2 overhead → you must skip <span style={{ color: 'var(--accent)' }}>75%</span> of the tests, just to break even.
        </div>
      </Reveal>

      {/* 04.5 takeaway 1 */}
      <Reveal on={at(4)} x={160} y={170}>
        <div className="t-eyebrow">// takeaway 1</div>
      </Reveal>
      <Reveal on={at(4)} x={150} y={440} delay={200} ms={900}>
        <div className="t-statement" style={{ fontSize: 140 }}>Coverage may be<br /><span style={{ color: 'var(--accent)' }}>too slow</span>.</div>
      </Reveal>
    </>
  );
}

/** 04 FAST — TIA must pay for itself; coverage often doesn't. */
export const Fast = () => <Scene index={3}><Fast_ /></Scene>;
