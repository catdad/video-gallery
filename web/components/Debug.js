import { html, useEffect, useSignal } from "../lib/preact.js";
import { Button } from "./Buttons.js";
import { useRoute } from "./hook-router.js";
import { Left } from './icons.js';
import { opacity, styled } from "../lib/theme.js";

function getSupportedMediaCodecs() {
  const videoElement = document.createElement('video');

  const videoCodecs = [
    'video/mp4; codecs="avc1.42E01E"',
    'video/mp4; codecs="vp8"',
    'video/mp4; codecs="vp9"',
    'video/webm; codecs="vp8"',
    'video/webm; codecs="vp9"',
    'video/mp4; codecs="hvc1.1.6.L90.B0"',
    'video/mp4; codecs="av01.0.05M.08"',
  ];

  const audioCodecs = [
    'audio/mpeg',
    'audio/ogg; codecs="vorbis"',
    'audio/ogg; codecs="opus"',
    'audio/aac',
  ];

  return [...videoCodecs, ...audioCodecs].reduce((memo, codec) => {
    memo[codec] = videoElement.canPlayType(codec) || 'no';
    return memo;
  }, {});
}

const Pre = styled('div', (color) => ({
  background: opacity(color.foreground, '0.15'),
  padding: '0.75rem',
  borderRadius: '0.75rem',
  whiteSpaceCollapse: 'preserve',
  textWrapMode: 'wrap',
  fontFamily: 'monospace',
  margin: '1rem 0'
}));

export const Debug = () => {
  const { back } = useRoute();
  const codecs = useSignal({});

  // actually get the values just once on mount rather than on every render
  useEffect(() => {
    codecs.value = getSupportedMediaCodecs();
  }, []);

  return html`
  <div style="max-width: 1000px; margin: 1rem auto; padding: 0 1rem;">
    <${Button} onClick=${() => back()} icon=${html`<${Left} height="0.8rem" thickness="3" />`}>
      back
    <//>
    <${Pre}>${navigator.userAgent}<//>
    ${navigator.userAgentData ? html`<${Pre}>
      ${JSON.stringify(navigator.userAgentData, null, 2)}
    <//>` : ''}
    <${Pre}>
      ${Object.entries(codecs.value).map(([codec, supported]) => `${codec} - ${supported}`).join('\n')}
    <//>
  </div>`;
};
