import { html } from "../lib/preact.js";
import { routes, useRoute, withRouter } from "./hook-router.js";
import { withList } from "./hook-list.js";
import { List } from "./List.js";
import { Video } from "./Video.js";

const AppInner = () => {
  const { getRoute, getRouteData, back } = useRoute();

  switch(getRoute()) {
    case routes.list:
      return html`<${List} />`;
    case routes.video:
      return html`<${Video} />`;
  }

  // TODO this should probably load /web/
  return html`<div>wat?</div>`;
};

export const App = withRouter(withList(AppInner));
