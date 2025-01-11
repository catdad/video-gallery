import { html } from "../lib/preact.js";
import { withList } from "./hook-list.js";
import { List } from "./List.js";

const AppInner = () => {
  return html`<${List} />`;
};

export const App = withList(AppInner);
