import { html } from "../lib/preact.js";
import { withTheme } from "../lib/theme.js";
import { Debug } from "./Debug.js";
import { useRoute, withRouter } from "./hook-router.js";
import { withSettings } from "./hook-settings.js";
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
    case 'debug':
      return html`<${Debug} />`;
  }

  // TODO this should probably load /web/
  return html`<div>wat?</div>`;
};

export const App = withSettings(withTheme(withRouter(AppInner)));
