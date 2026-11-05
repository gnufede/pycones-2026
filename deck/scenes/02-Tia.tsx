import { Reveal, Scene, useScene } from 'beatdeck';
import tia from '../assets/tia.jpg';
import hackerNews from '../assets/hacker_news.png';
import instrumenting from '../assets/instrumenting_pytest.png';
import optimization from '../assets/test_optimization.png';
import executionData from '../assets/test_execution_data.png';

const APPROACHES = ['Coverage-based', 'History-based', 'ML predictive', 'Dynamic call-graph', 'Diff/AST', 'Build-graph'];

/** the TIA acronym: initials stay in place while the words change around them */
const ACRONYM = [
  { y: 330, init: 'T', from: 'écnicos', to: 'est' },
  { y: 438, init: 'I', from: 'nvestigación', to: 'mpact' },
  { y: 546, init: 'A', from: 'eroterráquea', to: 'nalysis' },
];

function Tia_() {
  const { here, b } = useScene();
  const joke = here && b === 0;
  const acronym = here && b === 1;
  const quote = here && b === 6;
  const approaches = here && b === 7;

  // screenshot beats, one per click, each with its real screenshot from the pptx
  // screenshot beats, one per click, each with its real screenshot from the pptx.
  // layout: 'right' = title left, big image right (near-square images grow much more that way)
  const shots: { n: number; title: string; img: string; alt: string; layout: 'below' | 'right' }[] = [
    { n: 3, title: 'Instrumenting\nPytest', img: instrumenting, alt: 'Instrumenting Pytest', layout: 'right' },
    { n: 4, title: 'Test\nOptimization', img: optimization, alt: 'Test Optimization', layout: 'below' },
    { n: 5, title: 'Test execution\ndata over time', img: executionData, alt: 'Test execution data over time', layout: 'below' },
  ];
  return (
    <>
      {/* 02.1–02.2 the TIA acronym: initials stay in place while the words change around them.
          The two suffixes overlap by design (one is always invisible) — hence data-audit="off". */}
      {ACRONYM.map((l) => (
        <div key={l.init} className="t-statement" style={{
          position: 'absolute', left: 150, top: l.y, fontSize: 120, whiteSpace: 'nowrap',
          opacity: here && b <= 1 ? 1 : 0, transition: 'opacity 320ms',
        }}>
          <span style={{ color: 'var(--accent)' }}>{l.init}</span>
          <span data-audit="off" style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{
              position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap',
              opacity: joke ? 1 : 0, transform: joke ? 'none' : 'translateY(-24px)',
              transition: 'opacity 280ms, transform 280ms',
            }}>{l.from}</span>
            <span style={{
              whiteSpace: 'nowrap',
              opacity: acronym ? 1 : 0, transform: acronym ? 'none' : 'translateY(24px)',
              transition: 'opacity 400ms var(--ease) 340ms, transform 400ms var(--ease) 340ms',
            }}>{l.to}</span>
          </span>
        </div>
      ))}

      {/* 02.1 the joke — the real image from the pptx, bigger */}
      <Reveal on={joke} out={here && b > 0} x={970} y={230} delay={250}>
        <img src={tia} alt="TIA" style={{ maxHeight: 640, maxWidth: 850, display: 'block' }} />
      </Reveal>

      {/* 02.2 Test Impact Analysis — what TIA means here, to the right of the initials */}
      <Reveal on={acronym} out={here && b > 1} x={860} y={440} delay={600}>
        <div className="t-editorial" style={{ fontSize: 68, whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--accent)' }}>→ </span>Run only relevant tests
        </div>
      </Reveal>

      {/* 02.3 the Hacker News screenshot from the pptx */}
      <Reveal on={here && b === 2} out={here && b > 2} delay={200}>
        <div style={{ position: 'absolute', left: 0, top: 150, width: 1920, textAlign: 'center' }}>
          <img src={hackerNews} alt="Hacker News" style={{ maxHeight: 760, maxWidth: 1500, display: 'inline-block' }} />
        </div>
      </Reveal>

      {/* 02.4–02.6 the three context slides, each on its own beat with its screenshot */}
      {shots.map(({ n, title, img, alt, layout }) => (
        <div key={n}>
          {layout === 'below' ? (
            <>
              <Reveal on={here && b === n} out={here && b > n} x={160} y={140}>
                <div className="t-statement" style={{ fontSize: 84, whiteSpace: 'pre-line' }}>{title}</div>
              </Reveal>
              <Reveal on={here && b === n} out={here && b > n} delay={200}>
                <div style={{ position: 'absolute', left: 0, top: 290, width: 1920, textAlign: 'center' }}>
                  <img src={img} alt={alt} style={{ maxHeight: 730, maxWidth: 1700, display: 'inline-block' }} />
                </div>
              </Reveal>
            </>
          ) : (
            <>
              <Reveal on={here && b === n} out={here && b > n} x={160} y={400}>
                <div className="t-statement" style={{ fontSize: 100, whiteSpace: 'pre-line' }}>{title}</div>
              </Reveal>
              <Reveal on={here && b === n} out={here && b > n} x={910} y={100} delay={250}>
                <img src={img} alt={alt} style={{ maxHeight: 880, maxWidth: 950, display: 'block' }} />
              </Reveal>
            </>
          )}
        </div>
      ))}

      {/* 02.7 the Hammant quote */}
      <Reveal on={quote} out={approaches} x={160} y={280}>
        <div className="t-editorial" data-exact style={{ fontSize: 66, width: 1450 }}>
          If tests ran infinitely quickly, we would run all the
          tests all the time, but they are not, so we need to balance cost vs value when running them.
        </div>
      </Reveal>
      <Reveal on={quote} out={approaches} x={160} y={840} delay={350}>
        <div className="t-meta" style={{ fontSize: 26 }}>The Rise of Test Impact Analysis — Paul Hammant — 2017</div>
        <div className="mono" style={{ fontSize: 24, marginTop: 18, color: 'var(--accent)' }}>martinfowler.com/articles/rise-test-impact-analysis.html</div>
      </Reveal>

      {/* 02.8 different approaches */}
      <Reveal on={approaches} x={160} y={170}>
        <div className="t-eyebrow">// different approaches</div>
      </Reveal>
      {APPROACHES.map((a, i) => (
        <Reveal key={a} on={approaches} x={160 + (i % 3) * 550} y={i < 3 ? 390 : 640} delay={150 + i * 120}>
          <div className="mono" style={{
            fontSize: 40, padding: '28px 40px', border: '1px solid var(--hair-strong)',
            width: 520, textAlign: 'center', whiteSpace: 'nowrap',
          }}>{a}</div>
        </Reveal>
      ))}
    </>
  );
}

/** 02 TIA — the acronym joke and its reveal, three context slides with their screenshots, the founding quote, the approaches. */
export const Tia = () => <Scene index={1}><Tia_ /></Scene>;
