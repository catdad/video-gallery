import {
  html, effect,
  createContext, useContext, useSignal
} from "../lib/preact.js";

const RouterContext = createContext({});

const getHashData = (hash = window.location.hash) => {
  if (/#video/.test(hash)) {
    const video = hash.replace(/^#video\//, '');
    return { route: 'video', hash, data: { video }};
  }

  return { route: 'list', hash, data: {} };
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
    routeData.value = getHashData(`#video/${video}`);
  };

  const api = {
    getRouteData: () => routeData.value,
    goToVideo,
    goToList,
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
