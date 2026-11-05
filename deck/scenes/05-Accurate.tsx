import { CountUp, Reveal, Scene, useScene } from 'beatdeck';
import { Code } from '../code';
import { TERM } from '../terminal';

/** the slide-24 diagram, redrawn from its own description: 4 TP · 2 FP · 1 FN · 2 TN */
const CELLS = ['ok', 'ok', 'warning', 'ok', 'fault', 'ok', 'warning', 'dim', 'dim'] as const;
const TONES: Record<string, { bg: string; label: string }> = {
  ok: { bg: 'var(--ok)', label: 'True positives (4)' },
  warning: { bg: 'var(--warning)', label: 'False positives (2)' },
  fault: { bg: 'var(--fault)', label: 'False negatives (1)' },
  dim: { bg: 'transparent', label: 'True negatives (2)' },
};

const BLIND_COVERAGE = [
  'Native code (C/C++, Rust …)',
  'Reading files (JSON, yaml, …)',
  'Subprocess / Multi-process interactions',
  'DB data',
  'functools.lru_cache',
  'State due to code executed before the test (esp. at import time)',
  'Clock, Random seed, I/O …',
];
const BLIND_DIFF = ['Any non-tracked file (.so)', 'All of the above'];

function Accurate_() {
  const { here, b, entry } = useScene();
  const at = (n: number) => here && b >= n;
  return (
    <>
      {/* 05.1 a classifier */}
      <Reveal on={here && b === 0} out={at(1)} x={150} y={280}>
        <div className="t-statement" style={{ fontSize: 130 }}>TIA needs to be <span style={{ color: 'var(--accent)' }}>accurate</span>.</div>
      </Reveal>
      <Reveal on={here && b === 0} out={at(1)} x={160} y={540} delay={400}>
        <div className="t-editorial" style={{ fontSize: 58 }}>Let's see TIA as a classifier.</div>
      </Reveal>
      <Reveal on={here && b === 0} out={at(1)} x={160} y={660} delay={650}>
        <div className="mono" style={{ fontSize: 44, color: 'var(--ink-2)' }}>test is relevant for the change: yes / no</div>
      </Reveal>

      {/* 05.2 precision and recall */}
      <Reveal on={here && b === 1} out={at(2)} x={160} y={170}>
        <div className="t-eyebrow">// precision and recall</div>
      </Reveal>
      {CELLS.map((c, i) => (
        <Reveal key={i} on={here && b === 1} out={at(2)} x={160 + (i % 3) * 190} y={340 + Math.floor(i / 3) * 190} delay={150 + i * 80}>
          <div style={{
            width: 150, height: 150,
            background: c === 'dim' ? 'transparent' : TONES[c].bg,
            opacity: c === 'dim' ? 1 : 0.85,
            border: c === 'dim' ? '1px dashed var(--hair-strong)' : 'none',
          }} />
        </Reveal>
      ))}
      <Reveal on={here && b === 1} out={at(2)} x={850} y={360} delay={500}>
        {(['ok', 'warning', 'fault', 'dim'] as const).map((k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 34 }}>
            <div style={{ width: 30, height: 30, background: TONES[k].bg, border: k === 'dim' ? '1px dashed var(--hair-strong)' : 'none' }} />
            <div className="mono" style={{ fontSize: 28, color: 'var(--ink-2)' }}>{TONES[k].label}</div>
          </div>
        ))}
      </Reveal>
      <Reveal on={here && b === 1} out={at(2)} x={850} y={660} delay={700}>
        <div className="mono" data-exact style={{ fontSize: 44, marginBottom: 30 }}>
          Precision: 4/(4+2) = <CountUp value={66.7} from={0} entry={entry} ms={1400} decimals={1} />%
        </div>
        <div className="mono" data-exact style={{ fontSize: 44 }}>
          Recall: 4/(4+1) = <CountUp value={80} from={0} entry={entry} ms={1400} />%
        </div>
      </Reveal>

      {/* 05.3 the cardinal sin */}
      <Reveal on={here && b === 2} out={at(3)} x={160} y={170}>
        <div className="t-eyebrow">// the true cost of TIA</div>
      </Reveal>
      <Reveal on={here && b === 2} out={at(3)} x={160} y={300} delay={150}>
        <div className="t-editorial" data-exact style={{ fontSize: 60, width: 1500 }}>
          Test selection has exactly one cardinal sin: skipping a test
          that would have failed. A tool you can't trust on that is worse than no tool. So before any feature list,
          here is where this project earned — or failed to earn — that trust.
        </div>
      </Reveal>
      <Reveal on={here && b === 2} out={at(3)} x={160} y={760} delay={400}>
        <div className="mono" style={{ fontSize: 24, color: 'var(--accent)' }}>pypi.org/project/pytest-tia/</div>
      </Reveal>

      {/* 05.4 risk-adjusted break even */}
      <Reveal on={here && b === 3} out={at(4)} x={160} y={170}>
        <div className="t-eyebrow">// risk-adjusted break even</div>
      </Reveal>
      <Reveal on={here && b === 3} out={at(4)} x={160} y={300} delay={150}>
        <div className="mono" data-exact style={{ fontSize: 68, color: 'var(--ink)' }}>
          S &gt; p · (1 − <span style={{ color: 'var(--accent)' }}>recall</span>) · C_inc
        </div>
      </Reveal>
      <Reveal on={here && b === 3} out={at(4)} x={160} y={470} delay={350}>
        {[
          ['S', 'Money saved on CI ~ $0.50'],
          ['p', 'Probability a PR contains a bug tests would have revealed ~ 1%'],
          ['C_inc', 'Incident cost ~ $100k'],
          ['recall', 'Affected tests we actually run > 99.95% (we can miss 1 out of 2000)'],
        ].map(([k, v], i, rows) => {
          const last = i === rows.length - 1;
          return last ? (
            <div key={k} style={{
              display: 'flex', gap: 40, alignItems: 'baseline',
              border: '2px solid var(--accent)', background: 'var(--surface)',
              padding: '26px 32px', marginTop: 14, width: 1560,
            }}>
              <div className="mono" style={{ fontSize: 36, color: 'var(--accent)', width: 180 }}>{k}</div>
              <div className="t-editorial" data-exact style={{ fontSize: 38, color: 'var(--accent)' }}>{v}</div>
            </div>
          ) : (
            <div key={k} style={{ display: 'flex', gap: 40, marginBottom: 36, alignItems: 'baseline' }}>
              <div className="mono" style={{ fontSize: 36, color: 'var(--ink-2)', width: 180 }}>{k}</div>
              <div className="t-editorial" data-exact style={{ fontSize: 38, width: 1400, color: 'var(--ink-2)' }}>{v}</div>
            </div>
          );
        })}
      </Reveal>

      {/* 05.5 blind spots */}
      <Reveal on={here && b === 4} out={at(5)} x={160} y={170}>
        <div className="t-eyebrow">// blind spots</div>
      </Reveal>
      <Reveal on={here && b === 4} out={at(5)} x={160} y={300} delay={150}>
        <div className="t-meta" style={{ fontSize: 22, marginBottom: 30 }}>Invisible to coverage</div>
        {BLIND_COVERAGE.map((t) => (
          <div key={t} className="t-editorial" data-exact style={{ fontSize: 38, width: 860, marginBottom: 36 }}>{t}</div>
        ))}
      </Reveal>
      <Reveal on={here && b === 4} out={at(5)} x={1100} y={300} delay={350}>
        <div className="t-meta" style={{ fontSize: 22, marginBottom: 30 }}>Invisible to git diff</div>
        {BLIND_DIFF.map((t) => (
          <div key={t} className="t-editorial" data-exact style={{ fontSize: 38, width: 660, marginBottom: 36 }}>{t}</div>
        ))}
      </Reveal>

      {/* 05.6 the expired code */}
      <Reveal on={here && b === 5} out={at(6)} x={160} y={170}>
        <div className="t-eyebrow">// blind spot: the clock</div>
      </Reveal>
      <Reveal on={here && b === 5} out={at(6)} x={160} y={330} delay={150}>
        <Code python size={34} lines={TERM.expiredTest.map((t) => ({ t, exact: true }))} />
      </Reveal>
      <Reveal on={here && b === 5} out={at(6)} x={900} y={330} delay={300}>
        <Code python size={34} lines={TERM.expiredProvider.map((t) => ({
          t, exact: true,
          marks: t.includes('date(2026, 11, 7)') ? [{ text: '2026, 11, 7', on: true, label: 'expired yesterday' }] : [],
          labels: t.includes('date(2026, 11, 7)') ? 1 : 0,
        }))} />
      </Reveal>

      {/* 05.7 takeaway 2 */}
      <Reveal on={at(6)} x={160} y={170}>
        <div className="t-eyebrow">// takeaway 2</div>
      </Reveal>
      <Reveal on={at(6)} x={150} y={400} delay={200} ms={900}>
        <div className="t-statement" style={{ fontSize: 120 }}>We need to be<br /><span style={{ color: 'var(--accent)' }}>conservative</span><br />on test selection.</div>
      </Reveal>
      <Reveal on={at(6)} x={160} y={880} delay={500}>
        <div className="t-editorial" data-exact style={{ fontSize: 48 }}>We may still deselect tests that could have failed</div>
      </Reveal>
    </>
  );
}

/** 05 ACCURATE — TIA as a classifier: what a miss really costs, and where coverage can't see. */
export const Accurate = () => <Scene index={4}><Accurate_ /></Scene>;
