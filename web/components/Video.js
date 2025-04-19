import { html, useEffect, useRef, useState } from "../lib/preact.js";
import { usePersistedSignal } from "../lib/persisted-signal.js";
import { useRefSignal } from "../lib/ref-signal.js";
import { useRoute } from "./hook-router.js";
import { Button, Toggle } from "./Buttons.js";
import { Left, X } from './icons.js';

const agent = navigator.userAgent.toLowerCase();
// would be great to detect all webviews, but don't know how to do that
const iOSHomeAssistant =  /iphone|ipad|macintosh/.test(agent) && /homeassistant/.test(agent);

const VideoBlob = ({ url, videoRef }) => {
  const [blobUrl, setBlobUrl] = useState();

  useEffect(() => {
    let mounted = true;
    let blobUrl;

    fetch(url).then(res => {
      if (!res.ok) {
        throw new Error(`failed to load video: ${res.status} ${res.statusText}`);
      }

      return res.blob();
    }).then(blob => {
      if (mounted) {
        blobUrl = URL.createObjectURL(blob);
        setBlobUrl(blobUrl);
      }
    }).catch(err => {
      console.error('failed to load video blob', err);
    });

    return () => {
      mounted = false;

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  if (!blobUrl) {
    return html`<div style="line-height: 4; text-align: center;">Loading video...</div>`;
  }

  return html`<${VideoEmbed} url=${blobUrl} videoRef=${videoRef} />`;
};

const VideoEmbed = ({ url, videoRef }) => {
  return html`
  <video ref=${videoRef} preload="metadata" autoplay muted controls playsinline style="width: 100%; max-height: 80vmin;">
    <source src="${url}" type="video/mp4" />
  </video>`;
};

export const Video = () => {
  const videoRef = useRefSignal(null);
  const { getRouteData, back } = useRoute();
  const videoMode = usePersistedSignal('video-mode', iOSHomeAssistant ? 'buffer' : 'stream');
  const speed = usePersistedSignal('video-speed', 1, Number);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.playbackRate = Number(speed.value);
  }, [videoRef.current, `${speed.value}`]);

  const { video: url } = getRouteData().data;
  const name = url.split('/').pop();

  return html`
    <style>
      .video-container {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100%;
        z-index: 3;
        overflow: hidden;

        display: flex;
        flex-direction: column;
        background: var(--background);
      }

      .video-container .header {
        display: flex;
        gap: 0.5rem;
        padding: 0.5rem;
        font-weight: bold;
        align-items: center;
      }

      .video-container .controls {
        margin: auto;
        display: flex;
      }

      @media screen and (orientation: landscape) {
        .video-container .controls {
          flex-direction: row;
          gap: 0.5rem;
        }
      }

      @media screen and (orientation: portrait) {
        .video-container .controls {
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }
      }
    </style>
    <div className="video-container">
      <div className="header">
        <${Button} onClick=${() => back()} icon=${html`<${Left} height="0.8rem" thickness="3" />`}>
          back
        <//>
        <span>${name}</span>
      </div>
      ${
        (() => {
          switch (videoMode.value) {
            case 'stream':
              return html`<${VideoEmbed} url=${url} videoRef=${videoRef} />`;
            case 'buffer':
              return html`<${VideoBlob} url=${url} videoRef=${videoRef} />`;
            default:
              return html`<div>unknown video player mode: ${videoMode.value}</div>`;
            }
        })()
      }
      <div style=${{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div className="controls">
          <${Toggle}
            onChange=${value => {
              videoMode.value = value;
            }}
            options=${[{ value: 'stream'}, { value: 'buffer'}]}
            value=${videoMode.value}
            label="Mode"
          />
          <${Toggle}
            onChange=${value => {
              speed.value = value;
            }}
            options=${[
              { value: 1, label: '1x' },
              { value: 2, label: '2x' },
              { value: 3, label: '3x' },
              { value: 4, label: '4x' },
            ]}
            value=${speed.value}
            label="Speed"
          />
          <div>
          <${Button} onClick=${() => back()} icon=${html`<${X} height="0.8rem" thickness="3" />`}>
            close
          <//>
          </div>
        </div>
      </div>
    </div>
  `;
};
