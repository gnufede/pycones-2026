import { Arrow, NodeBox, Reveal, Scene, useScene, type Rect } from 'beatdeck';
import { Code } from '../code';
import { TERM } from '../terminal';
import filemonLogo from '../assets/filemon.png';
import mortadeloLogo from '../assets/mortadelo.png';

const FILEMON = {
  logo: filemonLogo,
  name: 'pytest-filemon',
  features: ['File-level dependencies', 'Import graph dependencies', 'Very low collection overhead', 'Best suited for monorepos'],
  url: 'github.com/gnufede/pytest-filemon',
  pip: 'pip install pytest-filemon',
};
const MORTADELO = {
  logo: mortadeloLogo,
  name: 'pytest-mortadelo',
  features: ['Code block level dependencies', 'Bytecode-hashed dependencies', 'Low collection overhead', 'More test skips than Filemon'],
  url: 'github.com/gnufede/pytest-mortadelo',
  pip: 'pip install pytest-mortadelo',
};

const BLOCK_DEPS = [
  'Files are the index, blocks are the edges — test → (file, qualname, hash)',
  'Hash could be from AST, but Mortadelo uses bytecode',
  'Selection only compiles changed files from disk',
];

/** the idea of 7.5, drawn: a test with edges to code blocks, not to the whole file */
const TST: Rect = { x: 940, y: 470, w: 380, h: 130 };
const FHDR: Rect = { x: 1520, y: 250, w: 330, h: 80 };
const BLK1: Rect = { x: 1520, y: 330, w: 330, h: 150 };
const BLK2: Rect = { x: 1520, y: 510, w: 330, h: 150 };
const BLOCKS = [
  { code: ['def get_data():', '    return DATA'], hash: 'f3a1', dim: false },
  { code: ['def process(x):', '    return x + 1'], hash: '9c2e', dim: false },
  { code: ['def unused():', '    pass'], hash: '77b0', dim: true },
];

function Tool({ on, out, tool }: { on: boolean; out?: boolean; tool: typeof FILEMON }) {
  return (
    <>
      <Reveal on={on} out={out} x={160} y={280}>
        <img src={tool.logo} alt={tool.name} style={{ height: 240, maxWidth: 420, display: 'block' }} />
        <div className="t-statement" style={{ fontSize: 96, marginTop: 60 }}>{tool.name}</div>
      </Reveal>
      <Reveal on={on} out={out} x={1000} y={300} delay={250}>
        {tool.features.map((f) => (
          <div key={f} className="t-editorial" style={{ fontSize: 48, marginBottom: 44 }}>{f}</div>
        ))}
        <div className="mono" style={{ fontSize: 28, color: 'var(--accent)', marginTop: 30 }}>{tool.url}</div>
        <div className="mono" style={{ fontSize: 28, color: 'var(--ink-2)', marginTop: 20 }}>$ {tool.pip}</div>
      </Reveal>
    </>
  );
}

function Tools_() {
  const { here, b } = useScene();
  const at = (n: number) => here && b >= n;
  return (
    <>
      {/* 07.1 pytest-filemon */}
      <Tool on={here && b === 0} out={at(1)} tool={FILEMON} />

      {/* 07.2 filemon: import hook */}
      <Reveal on={here && b === 1} out={at(2)} x={160} y={170}>
        <div className="t-eyebrow">// filemon: import hook</div>
      </Reveal>
      <Reveal on={here && b === 1} out={at(2)} x={160} y={380} delay={150}>
        <Code python size={40} lines={TERM.importHook.map((t) => ({
          t, exact: true,
          marks: t.includes('self._wrapped_import')
            ? [{ text: 'self._wrapped_import', on: true, label: 'wrap the import builtin' }]
            : [],
          labels: t.includes('self._wrapped_import') ? 1 : 0,
        }))} />
      </Reveal>

      {/* 07.3 pytest-mortadelo */}
      <Tool on={here && b === 2} out={at(3)} tool={MORTADELO} />

      {/* 07.4 mortadelo: sys.monitoring */}
      <Reveal on={here && b === 3} out={at(4)} x={160} y={170}>
        <div className="t-eyebrow">// mortadelo: sys.monitoring</div>
      </Reveal>
      <Reveal on={here && b === 3} out={at(4)} x={160} y={320} delay={150}>
        <Code python size={34} lines={TERM.monitoring.map((t) => ({
          t, exact: true,
          marks: t === 'E = sys.monitoring.events'
            ? [{ text: 'sys.monitoring', on: true, label: 'Python 3.12+' }]
            : [],
          labels: t === 'E = sys.monitoring.events' ? 1 : 0,
        }))} />
      </Reveal>

      {/* 07.5 mortadelo: code blocks as dependencies — the facts on the left, the idea drawn on the right.
          The block contents are illustrative; the four statements stay verbatim. */}
      <Reveal on={here && b === 4} out={at(5)} x={160} y={170}>
        <div className="t-eyebrow">// mortadelo: code blocks as dependencies</div>
      </Reveal>
      {BLOCK_DEPS.map((t, i) => (
        <Reveal key={t} on={here && b === 4} out={at(5)} x={160} y={340 + i * 230} delay={150 + i * 150}>
          <div className="t-eyebrow" style={{ fontSize: 24, marginBottom: 20 }}>{String(i + 1).padStart(2, '0')}</div>
          <div className="t-editorial" data-exact style={{ fontSize: 40, width: 760 }}>{t}</div>
        </Reveal>
      ))}

      {/* the diagram: test_a depends on code blocks (with their hashes), not on the whole file */}
      <Arrow from={TST} to={FHDR} on={here && b === 4} tone="ghost" delay={200} label="file-level" ly={-34} />
      <Arrow from={TST} to={BLK1} on={here && b === 4} tone="hot" flow delay={400} />
      <Arrow from={TST} to={BLK2} on={here && b === 4} tone="hot" flow delay={500} />
      <NodeBox rect={TST} on={here && b === 4} tone="hot" kind="test" value="test_a" />
      <Reveal on={here && b === 4} out={at(5)} delay={250}>
        <div style={{ position: 'absolute', left: 1520, top: 258, width: 330 }}>
          <div className="t-meta" style={{ fontSize: 24 }}>provider.py</div>
        </div>
      </Reveal>
      {BLOCKS.map((blk, i) => (
        <div key={blk.hash} style={{
          position: 'absolute', left: 1520, top: 330 + i * 180, width: 330, height: 150,
          border: `1px ${blk.dim ? 'dashed var(--hair)' : 'solid var(--hair-strong)'}`,
          padding: 20, color: blk.dim ? 'var(--ink-3)' : 'var(--ink)',
          opacity: here && b === 4 ? 1 : 0, transition: 'opacity 400ms var(--ease) 340ms',
        }}>
          <span className="mono" style={{ position: 'absolute', bottom: 12, right: 16, fontSize: 20, color: blk.dim ? 'var(--ink-3)' : 'var(--accent)' }}>⟨{blk.hash}⟩</span>
          <div className="mono" style={{ fontSize: 26, lineHeight: 1.5 }}>
            {blk.code.map((l) => <div key={l} style={{ whiteSpace: 'pre' }}>{l}</div>)}
          </div>
        </div>
      ))}

      {/* 07.6 demo */}
      <Reveal on={at(5)} x={150} y={420}>
        <div className="t-statement" style={{ fontSize: 220 }}>Demo <span style={{ color: 'var(--accent)' }}>time</span>.</div>
      </Reveal>
    </>
  );
}

/** 07 TOOLS — pytest-filemon and pytest-mortadelo, then the demo. */
export const Tools = () => <Scene index={6}><Tools_ /></Scene>;
