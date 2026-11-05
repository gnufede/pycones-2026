import { defineDeck } from 'beatdeck';
import '../themes/neutral.css';
import '../themes/light.css';
import './theme.css';
import { config } from './deck.config';
import { SCENES } from './scenes';
import { initialLive, timeline, type Live } from './timeline';
import { Open } from './scenes/01-Open';
import { Tia } from './scenes/02-Tia';
import { How } from './scenes/03-How';
import { Fast } from './scenes/04-Fast';
import { Accurate } from './scenes/05-Accurate';
import { Fit } from './scenes/06-Fit';
import { Tools } from './scenes/07-Tools';
import { End } from './scenes/08-End';

/** Every layer of the stage, back to front. All stay mounted; each shows itself for its own scene. */
function Stage() {
  return (
    <>
      <Open />
      <Tia />
      <How />
      <Fast />
      <Accurate />
      <Fit />
      <Tools />
      <End />
    </>
  );
}

export default defineDeck<Live>({
  id: 'tu-ci-esta-perdiendo-el-tiempo',
  title: config.title,
  lang: 'es',
  scenes: SCENES,
  Stage,
  initialLive,
  timeline,
  // the boot beat is automatic: stepping back from title or boot returns to standby;
  // stepping back from "about me" returns to the title
  prev: ({ scene, beat }) => (scene === 0
    ? (beat <= 0 ? null : beat >= 3 ? { scene: 0, beat: 2 } : { scene: 0, beat: 0 })
    : undefined),
  fonts: ['400 100px "Inter Variable"', '600 100px "Inter Variable"', '400 32px "JetBrains Mono Variable"'],
  qrUrl: config.qrUrl,
});
