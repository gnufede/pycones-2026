import { Reveal, Scene, useScene } from 'beatdeck';
import { Code } from '../code';
import { TERM } from '../terminal';
import importMeme from '../assets/import_dependencies.jpg';

const QUESTIONS: [string, string][] = [
  ['Fast or slow tests?', 'Works best if tests are not super-fast'],
  ['Code coupling', 'Works better if low coupling'],
  ['Shape of changes', 'Works better if many commits editing only docs or AGENTS.md — skips all tests'],
  ['No blind spots?', 'If you find some, be conservative'],
];

/** the map from slide 14, drawn as the graph slide 33 showed */

function Fit_() {
  const { here, b } = useScene();
  const at = (n: number) => here && b >= n;
  return (
    <>
      {/* 06.1 will it work for my repo? */}
      <Reveal on={here && b === 0} out={at(1)} x={160} y={170}>
        <div className="t-eyebrow">// will it work for my repo?</div>
      </Reveal>
      {QUESTIONS.map(([q, a], i) => (
        <Reveal key={q} on={here && b === 0} out={at(1)} x={160} y={340 + i * 160} delay={150 + i * 150}>
          <div style={{ display: 'flex', gap: 60, alignItems: 'baseline', width: 1600, borderTop: i ? '1px solid var(--hair)' : 'none', paddingTop: i ? 34 : 0 }}>
            <div className="t-editorial" style={{ fontSize: 48, width: 620, whiteSpace: 'nowrap' }}>{q}</div>
            <div className="t-editorial" data-exact={a ? true : undefined} style={{ fontSize: 38, width: 880, color: 'var(--ink-2)' }}>{a}</div>
          </div>
        </Reveal>
      ))}

      {/* 06.2 import dependencies — with the original meme from the pptx */}
      <Reveal on={here && b === 1} out={at(2)} x={150} y={200}>
        <div className="t-statement" style={{ fontSize: 150 }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>import</span> dependencies<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
      </Reveal>
      <Reveal on={here && b === 1} out={at(2)} x={1200} y={500} delay={250}>
        <img src={importMeme} alt="import dependencies" style={{ maxHeight: 500, maxWidth: 660, display: 'block' }} />
      </Reveal>

      {/* 06.3 they matter */}
      <Reveal on={here && b === 2} out={at(3)} x={160} y={170}>
        <div className="t-eyebrow">// import dependencies matter</div>
      </Reveal>
      <Reveal on={here && b === 2} out={at(3)} x={160} y={330} delay={150}>
        <Code python size={38} lines={TERM.constProvider.map((t) => ({ t, exact: true }))} />
      </Reveal>
      <Reveal on={here && b === 2} out={at(3)} x={880} y={330} delay={300}>
        <Code python size={38} lines={TERM.constTest.map((t) => ({
          t, exact: true,
          marks: t.includes('CONST') && t.includes('import')
            ? [{ text: 'CONST', on: true, label: 'a dependency at import time' }]
            : [],
          labels: t.includes('CONST') && t.includes('import') ? 1 : 0,
        }))} />
      </Reveal>
    </>
  );
}

/** 06 FIT — does TIA work for my repo, and why import dependencies matter. */
export const Fit = () => <Scene index={5}><Fit_ /></Scene>;
