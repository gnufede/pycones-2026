import { Arrow, NodeBox, Reveal, Scene, Terminal, useScene, type Rect } from 'beatdeck';
import { Code } from '../code';
import { TERM } from '../terminal';
import venn from '../assets/coverage_gitdiff.png';

const STEP1: Rect = { x: 160, y: 330, w: 460, h: 240 };
const STEP2: Rect = { x: 730, y: 330, w: 460, h: 240 };
const STEP3: Rect = { x: 1300, y: 330, w: 460, h: 240 };
const STORE_A: Rect = { x: 160, y: 700, w: 760, h: 190 };
const STORE_B: Rect = { x: 1000, y: 700, w: 760, h: 190 };

/** the files whose hashes the map is compared against, one cell each below the map */
const FILES = ['test_provider.py', 'provider.py', 'test_util.py', 'util.py'];
const HASHES: Record<string, string> = {
  'test_provider.py': '"012345678"',
  'provider.py': '"01010101"',
  'test_util.py': '"22222222"',
  'util.py': '"99999999"',
};
const CHANGED = '"56786532"';

function HashCell({ file, on, changed, selected, delay }: {
  file: string; on: boolean; changed: boolean; selected: boolean; delay: number;
}) {
  return (
    <Reveal on={on} x={160 + FILES.indexOf(file) * 440} y={590} delay={delay}>
      <div style={{ width: 400, borderTop: '1px solid var(--hair)', paddingTop: 20 }}>
        <div className="mono" style={{ fontSize: 26, color: changed ? 'var(--accent)' : 'var(--ink)' }}>
          <span style={selected ? { textDecoration: 'underline' } : undefined}>{file}</span>
        </div>
        {!changed ? (
          <div className="mono" style={{ fontSize: 26, marginTop: 12, color: 'var(--ink)' }}>{HASHES[file]}</div>
        ) : (
          <div className="mono" style={{ fontSize: 26, marginTop: 12, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--ink-3)', textDecoration: 'line-through' }}>{HASHES[file]}</span>
            <span style={{ color: 'var(--ink-3)' }}> → </span>
            <span data-exact style={{ color: 'var(--accent)' }}>{CHANGED}</span>
          </div>
        )}
      </div>
    </Reveal>
  );
}

function How_() {
  const { here, b } = useScene();
  const at = (n: number) => here && b >= n;
  const selection = here && b >= 6;

  // eyebrows per map phase (map beats start at 4)
  const mapEyebrow = [
    '// file-level TIA map — baseline commit, builds map',
    '// next commit',
    '// test selection',
    '// selected tests run, rebuild map',
  ][Math.min(Math.max(b - 4, 0), 3)];

  return (
    <>
      {/* 03.1 coverage ∩ git diff — the data each side provides */}
      <Reveal on={here && b === 0} out={at(1)} x={160} y={170}>
        <div className="t-eyebrow">// the ingredients</div>
        <div className="t-statement" style={{ fontSize: 120, marginTop: 40 }}>Coverage <span style={{ color: 'var(--accent)' }}>∩</span> git diff</div>
      </Reveal>
      <Reveal on={here && b === 0} out={at(1)} x={160} y={520} delay={250}>
        <div className="t-meta" style={{ fontSize: 26, marginBottom: 24 }}>Coverage</div>
        <Terminal size={34} lines={TERM.coverage.map((t) => ({ t }))} />
      </Reveal>
      <Reveal on={here && b === 0} out={at(1)} x={960} y={520} delay={450}>
        <div className="t-meta" style={{ fontSize: 26, marginBottom: 24 }}>Git diff</div>
        <Terminal size={34} lines={TERM.diff.map((t) => ({ t }))} />
      </Reveal>

      {/* 03.2 the venn diagram — the original from the pptx */}
      <Reveal on={here && b === 1} out={at(2)} delay={200}>
        <div style={{ position: 'absolute', left: 0, top: 170, width: 1920, textAlign: 'center' }}>
          <img src={venn} alt="Coverage ∩ git diff venn diagram" style={{ maxHeight: 730, maxWidth: 1400, display: 'inline-block' }} />
        </div>
      </Reveal>

      {/* 03.3 how TIA works — three steps (stay until the map phase) */}
      <Reveal on={here && b >= 2 && b < 4} out={at(4)} x={160} y={170}>
        <div className="t-eyebrow">// how TIA works</div>
      </Reveal>
      <Arrow from={STEP1} to={STEP2} on={here && b >= 2 && b < 4} delay={400} />
      <Arrow from={STEP2} to={STEP3} on={here && b >= 2 && b < 4} delay={550} />
      <NodeBox rect={STEP1} on={here && b >= 2 && b < 4} kind="01 · test run"
        value={<span style={{ fontFamily: 'var(--font-sans)', fontSize: 30, lineHeight: 1.35, display: 'block', maxWidth: 400, whiteSpace: 'normal' }}>dependencies data collection (build map)</span>} />
      <NodeBox rect={STEP2} on={here && b >= 2 && b < 4} kind="02 · test selection" delay={200}
        value={<span style={{ fontFamily: 'var(--font-sans)', fontSize: 30, lineHeight: 1.35, display: 'block', maxWidth: 400, whiteSpace: 'normal' }}>compare code changes with map</span>} />
      <NodeBox rect={STEP3} on={here && b >= 2 && b < 4} kind="03 · selected tests run" delay={350}
        value={<span style={{ fontFamily: 'var(--font-sans)', fontSize: 30, lineHeight: 1.35, display: 'block', maxWidth: 400, whiteSpace: 'normal' }}>and rebuild map for them</span>} />

      {/* 03.4 where the map lives */}
      <Reveal on={here && b === 3} out={at(4)} x={160} y={620}>
        <div className="t-editorial" style={{ fontSize: 46 }}>Also, either:</div>
      </Reveal>
      <NodeBox rect={STORE_A} on={here && b === 3} tone="ghost" kind="a"
        value={<span style={{ fontFamily: 'var(--font-sans)', fontSize: 28, lineHeight: 1.35, display: 'block', maxWidth: 640, whiteSpace: 'normal' }}>Store the map somewhere, and retrieve it (read/write it on CI)</span>} />
      <NodeBox rect={STORE_B} on={here && b === 3} tone="ghost" kind="b" delay={200}
        value={<span style={{ fontFamily: 'var(--font-sans)', fontSize: 28, lineHeight: 1.35, display: 'block', maxWidth: 640, whiteSpace: 'normal' }}>Have the map on backend side, and compute there test selection</span>} />

      {/* 03.5–03.8 the map, live across four beats */}
      <Reveal on={at(4)} x={160} y={170}>
        <div className="t-eyebrow">{mapEyebrow}</div>
      </Reveal>
      <Reveal on={at(4)} x={160} y={280} delay={150}>
        <Code size={30} lines={TERM.map.map((t, i) => ({
          t,
          exact: true,
          // at selection: test_a is the affected test, test_provider.py the changed file (dep occurrence)
          // at rebuild: util.py has been removed from test_a's dependencies
          marks: i === 1
            ? [
                { text: 'test_a', on: selection },
                { text: 'test_provider.py', nth: 1, on: selection },
                { text: 'util.py', on: at(7), strike: true, label: 'removed' },
              ]
            : [],
          labels: i === 1 ? 1 : 0,
        }))} />
      </Reveal>
      {/* file hashes — one cell per file, under the map */}
      {FILES.map((f, i) => (
        <HashCell key={f} file={f} on={at(4)} changed={b >= 5 && f === 'test_provider.py'} selected={selection && f === 'test_provider.py'} delay={350 + i * 120} />
      ))}
      {/* annotations for selection / rebuild */}
      <Reveal on={selection} x={160} y={860} delay={200}>
        <div className="mono" style={{ fontSize: 38, color: 'var(--accent)' }}>test_provider.py changed → run test_a</div>
      </Reveal>
      <Reveal on={at(7)} x={160} y={950} delay={200}>
        <div className="mono" style={{ fontSize: 38, color: 'var(--ink-2)' }}>selected tests run · rebuild map for them</div>
      </Reveal>
    </>
  );
}

/** 03 HOW — coverage ∩ git diff (data, then the venn), the three steps, and the file-level map across four beats. */
export const How = () => <Scene index={2}><How_ /></Scene>;
