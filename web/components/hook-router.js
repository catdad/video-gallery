import { html, effect, createContext, useContext, useSignal } from "../lib/preact.js";

export const routes = {
  list: '',
  video: '#video'
}

const RouterContext = createContext({
  route: routes.list
});

export const withRouter = Component => ({ children, ...props }) => {
  const route = useSignal(routes.list);

  effect(() => {
    const routeName = Object.entries(routes).find(([key, value]) => value === route.value) || 'list';

    history.pushState(routeName, '', route.value);

    const handler = (ev) => {
      route.value = routes[ev.state] || routes['list'];
    };

    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
    };
  });

  const api = {
    route,
    back: () => history.back()
  };

  return html`
    <${RouterContext.Provider} value=${api}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

export const useRoute = () => useContext(RouterContext);
