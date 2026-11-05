import { Reveal, Scene, useDeck, useScene, type DeckState } from 'beatdeck';
import { config } from '../deck.config';
import type { Live } from '../timeline';
import avatar from '../assets/avatar.jpg';

function Open_() {
  const { here, b } = useScene();
  const typed = useDeck((s: DeckState<Live>) => s.live.typed);
  const prompt = here && b <= 1;
  const title = here && b === 2;
  const about = here && b === 3;
  return (
    <>
      {/* 01.1–01.2 standby: a quiet prompt; 01.2 types the boot command by itself */}
      <div className="mono" style={{ position: 'absolute', left: 0, width: 1920, top: 510, textAlign: 'center', fontSize: 38, color: 'var(--ink-2)', opacity: prompt ? 1 : 0, transition: 'opacity 300ms' }}>
        <span style={{ color: 'var(--accent)' }}>$</span> {config.boot.slice(0, typed)}<span className="cursor">_</span>
      </div>

      {/* 01.3 title */}
      {config.subtitle && (
        <Reveal on={title} x={168} y={318}>
          <div className="t-eyebrow">// {config.subtitle}</div>
        </Reveal>
      )}
      <Reveal on={title} x={150} y={400} delay={120} ms={1100}>
        <div className="t-statement" style={{ fontSize: 176 }}>
          Tu CI está<br />perdiendo el tiempo<span style={{ color: 'var(--accent)' }}>.</span>
        </div>
      </Reveal>
      {config.author && (
        <Reveal on={title} out={about} x={168} y={880} delay={400}>
          <div className="t-meta" style={{ fontSize: 24 }}>{config.author}</div>
        </Reveal>
      )}

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

/** 01 OPEN — standby prompt, automatic boot, title. */
export const Open = () => <Scene index={0}><Open_ /></Scene>;
