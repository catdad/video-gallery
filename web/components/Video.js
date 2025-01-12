import { html } from "../lib/preact.js";
import { useRoute } from "./hook-router.js";

export const Video = () => {
  const { getRouteData, back } = useRoute();

  return html`<div style=${{
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  }}>
    <div>play a video: ${JSON.stringify(getRouteData())}</div>
    <video autoplay controls style="width: 100%; max-height: 80vh;">
      <source src="${getRouteData().video}" type="video/mp4" />
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
