import { html, useEffect, useState } from "../lib/preact.js";
import { useRoute } from "./hook-router.js";

const agent = navigator.userAgent.toLowerCase();
const iOSHomeAssistant =  /iphone|ipad|macintosh/.test(agent) && /homeassistant/.test(agent);

const VideoBlob = ({ url }) => {
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
    return html`<div>Loading video...</div>`;
  }

  return html`<${VideoEmbed} url=${blobUrl} />`;
};

const VideoEmbed = ({ url }) => {
  return html`
  <video preload="metadata" autoplay muted controls playsinline style="width: 100%; max-height: 80vmin;">
    <source src="${url}" type="video/mp4" />
  </video>`;
};

export const Video = () => {
  const { getRouteData, back } = useRoute();
  const [altMode, setAltMode] = useState(iOSHomeAssistant);

  return html`<div style=${{
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100%',
    zIndex: 3,
    overflow: 'hidden',
    background: 'var(--background)',
    display: 'flex',
    flexDirection: 'column',
  }}>
    <div style=${{
      fontFamily: 'monospace',
      fontSize: '0.6rem',
    }}>
      <div>play a video: ${JSON.stringify(getRouteData())}</div>
      <div>${navigator.userAgent}</div>
    </div>
    ${altMode
      ? html`<${VideoBlob} url=${getRouteData().data.video} />`
      : html`<${VideoEmbed} url=${getRouteData().data.video} />`
    }
    <div style=${{
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style="margin: auto; display: flex; gap: 0.5rem;">
        <button onClick=${() => setAltMode(!altMode)}>Mode: ${`${altMode ? 'buffer' : 'stream'}`}</button>
        <button onClick=${() => back()}>Close</button>
      </div>
    </div>
  </div>`
};
