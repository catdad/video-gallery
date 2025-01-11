import { html } from "../lib/preact.js";
import { routes, useRoute, withRouter } from "./hook-router.js";
import { withList } from "./hook-list.js";
import { List } from "./List.js";

const AppInner = () => {
  const { route } = useRoute();

  switch(route.value) {
    case routes.list:
      return html`<${List} />`;
    case routes.video:
      return html`<div>play a video</div>`;
  }

  // TODO this should probably load /web/
  return html`<div>wat?</div>`;
};

export const App = withRouter(withList(AppInner));
