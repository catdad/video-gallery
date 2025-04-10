import { html } from "../lib/preact.js";
import { useRoute } from "./hook-router.js";

export const Video = () => {
  const { getRouteData, back } = useRoute();

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
    <video preload="metadata" autoplay muted controls playsinline style="width: 100%; max-height: 80vmin;">
      <source src="${getRouteData().data.video}" type="video/mp4" />
    </video>
    <div style=${{
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style="margin: auto;">
        <button onClick=${() => back()}>Close</button>
      </div>
    </div>
  </div>`
};
