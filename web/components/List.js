import { html } from "../lib/preact.js";
import { useList } from "./hook-list.js";

export const List = () => {
  const { list, refreshed } = useList();

  return html`
    <div>
      <div>last refreshed: ${refreshed.toString()}<//>

      ${list.value.map(item => html`
        <div>
          <img src="${item.thumbnail}" loading="lazy" style=${{
            width: '200px'
          }} />
          <pre>${JSON.stringify(item, null, 2)}<//>
        </div>
      `)}
    <//>
  `;
};
