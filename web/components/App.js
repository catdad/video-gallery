import { html } from "../lib/preact.js";
import { routes, useRoute, withRouter } from "./hook-router.js";
import { withList } from "./hook-list.js";
import { List } from "./List.js";

const AppInner = () => {
  const { getRoute, getRouteData, back } = useRoute();

  switch(getRoute()) {
    case routes.list:
      return html`<${List} />`;
    case routes.video:
      // TODO make an actual video player component
      return html`<div>
        <div>play a video: ${JSON.stringify(getRouteData())}</div>
        <video autoplay controls style="width: 100%">
          <source src="${getRouteData().video}" type="video/mp4" />
        </video>
        <button onClick=${() => back()}>Close</button>
      </div>`;
  }

  // TODO this should probably load /web/
  return html`<div>wat?</div>`;
};

export const App = withRouter(withList(AppInner));
