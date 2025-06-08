import { html } from "../lib/preact.js";
import { withTheme } from "../lib/theme.js";
import { useRoute, withRouter } from "./hook-router.js";
import { List } from "./List.js";
import { Video } from "./Video.js";

const AppInner = () => {
  const { getRouteData } = useRoute();

  switch(getRouteData().route) {
    case 'list':
      return html`<${List} />`;
    case 'video':
      // keep the list rendered, so that scroll position is maintained
      return html`
        <${Video} />
        <${List} />
      `;
  }

  // TODO this should probably load /web/
  return html`<div>wat?</div>`;
};

export const App = withTheme(withRouter(AppInner));
