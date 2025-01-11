import {
  html, batch, effect,
  createContext, useContext, useSignal
} from "../lib/preact.js";

export const routes = {
  list: '',
  video: '#video'
}

const RouterContext = createContext({
  route: routes.list
});

export const withRouter = Component => ({ children, ...props }) => {
  const route = useSignal(routes.list);
  const routeData = useSignal(null);

  effect(() => {
    const routeName = (Object.entries(routes).find(([key, value]) => value === route.value) || ['list'])[0];

    history.pushState({
      name: routeName,
      route: route.value,
      data: routeData.value
    }, '', route.value);

    const handler = (ev) => {
      batch(() => {
        route.value = routes[ev.state.name] || routes['list'];
        routeData.value = ev.state.data || {};
      });
    };

    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
    };
  });

  const api = {
    getRoute: () => route.value,
    getRouteData: () => routeData.value,
    navigate: (r, data) => void batch(() => {
      route.value = r;
      routeData.value = data;
    }),
    back: () => history.back()
  };

  return html`
    <${RouterContext.Provider} value=${api}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

export const useRoute = () => useContext(RouterContext);
