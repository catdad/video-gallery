import { html } from "../lib/preact.js";
import { routes, useRoute, withRouter } from "./hook-router.js";
import { withList } from "./hook-list.js";
import { List } from "./List.js";

const AppInner = () => {
  const { getRoute, getRouteData } = useRoute();

  switch(getRoute()) {
    case routes.list:
      return html`<${List} />`;
    case routes.video:
      return html`<div>play a video: ${JSON.stringify(getRouteData())}</div>`;
  }

  // TODO this should probably load /web/
  return html`<div>wat?</div>`;
};

export const App = withRouter(withList(AppInner));
