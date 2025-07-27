import {
  html, effect,
  createContext, useContext, useSignal
} from "../lib/preact.js";

const RouterContext = createContext({});

const encode = (data) => encodeURIComponent(btoa(JSON.stringify(data)));
const decode = (str) => JSON.parse(atob(decodeURIComponent(str)));

const getHashData = (hash = window.location.hash) => {
  const [route, data] = hash.split('/');
  return {
    route: route.slice(1) || 'list',
    data: data ? decode(data) : {},
    hash
  };
};

export const withRouter = Component => ({ children, ...props }) => {
  const routeData = useSignal(getHashData());

  effect(() => {
    const { hash } = routeData.value;

    // only push to history if we are at a new url
    if (window.location.hash !== hash) {
      history.pushState({}, '', hash);
    }

    const handler = () => {
      routeData.value = getHashData();
    };

    window.addEventListener('popstate', handler);

    return () => {
      window.removeEventListener('popstate', handler);
    };
  });

  const goToList = () => {
    routeData.value = getHashData('');
  };

  const goToVideo = (video) => {
    routeData.value = getHashData(`#video/${encode({ video })}`);
  };

  const goToDebug = () => {
    routeData.value = getHashData('#debug');
  };

  const api = {
    getRouteData: () => routeData.value,
    goToVideo,
    goToList,
    goToDebug,
    back: () => {
      if (history.length > 1) {
        history.back()
      } else {
        goToList();
      }
    }
  };

  return html`
    <${RouterContext.Provider} value=${api}>
      <${Component} ...${props}>${children}<//>
    <//>
  `;
};

export const useRoute = () => useContext(RouterContext);
