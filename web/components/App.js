import { html } from "../lib/preact.js";
import { Settings } from "./Settings.js";
import { useRoute, withRouter } from "./hook-router.js";
import { withSettings } from "./hook-settings.js";
import { withTheme } from "./hook-theme.js";
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
    case 'settings':
      return html`<${Settings} />`;
  }

  // TODO this should probably load /web/
  return html`<div>wat?</div>`;
};

export const App = withSettings(withTheme(withRouter(AppInner)));
