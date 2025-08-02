import { html, useEffect, useSignal } from "../lib/preact.js";
import { useSettings } from "./hook-settings.js";
import { useRoute } from "./hook-router.js";
import { opacity, styled } from "./hook-theme.js";
import { Button, Toggle } from "./Buttons.js";
import { Left } from './icons.js';
import { themes } from "../lib/theme.js";

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

const Box = styled('div', ({ color }) => ({
  background: opacity(color.foreground, '0.1'),
  padding: '0.75rem',
  borderRadius: '0.75rem',
  margin: '1rem 0'  
}));

const Pre = styled(Box, {
  whiteSpaceCollapse: 'preserve',
  textWrapMode: 'wrap',
  fontFamily: 'monospace',
});

export const Debug = () => {
  const { resizeWidth, themeName } = useSettings();
  const { back } = useRoute();
  const codecs = useSignal({});
  
  const size = useSignal({
    width: window.innerWidth,
    height: window.innerHeight,
    dpi: window.devicePixelRatio
  });
  
  // actually get the values just once on mount rather than on every render
  useEffect(() => {
    codecs.value = getSupportedMediaCodecs();
  }, []);

  useEffect(() => {
    const onResize = () => {
      size.value = {
        width: window.innerWidth,
        height: window.innerHeight,
        dpi: window.devicePixelRatio
      };
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return html`
  <div style="max-width: 1000px; margin: 1rem auto; padding: 0 1rem;">
    <${Button} onClick=${() => back()} icon=${html`<${Left} height="0.8rem" thickness="3" />`}>
      back
    <//>
    <${Pre}>${navigator.userAgent}<//>
    <${Pre}>
      navigator.userAgentData.mobile: ${navigator.userAgentData ? `${navigator.userAgentData.mobile}` : 'unknown'}
    <//>
    <${Pre}>
      ${Object.entries(codecs.value).map(([codec, supported]) => `${codec} - ${supported}`).join('\n')}
    <//>
    <${Pre}>
      window size: ${size.value.width}px width • ${size.value.height}px height • ${size.value.dpi}x scaling
    <//>
    <${Box} style=${{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      lineHeight: '1.5'
    }}>
      <div style="font-weight: bold">Dynamically resize playback video</div>
      <div style="max-width: 64ch; font-size: 0.8rem">
        This helps when streaming high-resolution video on underpowered hardware, only change this value if videos don't play without it
      </div>
      <div style="align-self: start; margin-top: 0.5rem">
        <${Toggle}
          onChange=${value => {
            resizeWidth.value = value;
          }}
          options=${[{ value: 0, label: 'original (off)' }, { value: 480 }, { value: 640 }, { value: 800 }]}
          value=${+resizeWidth.value}
          label="Width"
        />
      </div>
    <//>
    <${Box} style=${{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      lineHeight: '1.5'
    }}>
      <div style="font-weight: bold">Theme</div>
      <div style="max-width: 64ch; font-size: 0.8rem">
        Pick a theme to use for the application
      </div>
      <div style="align-self: start; margin-top: 0.5rem">
        <${Toggle}
          onChange=${value => {
            themeName.value = value;
          }}
          options=${Object.keys(themes).map(value => ({ value }))}
          value=${themeName.value}
          label="Width"
        />
      </div>
    <//>
  </div>`;
};
