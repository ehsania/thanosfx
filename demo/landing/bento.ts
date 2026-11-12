import { PLAYGROUND_PATH } from "./config";
import { EFFECTS } from "./examples/registry";
import type { ExampleDefinition } from "./examples/types";
import { h } from "./ui";

function buildCard(example: ExampleDefinition): HTMLElement {
  const instance = example.create();

  const card = h("section", `bento-card${example.wide ? " bento-card--wide" : ""}`);
  card.id = `bento-${example.id}`;
  card.setAttribute("aria-label", example.label);

  const head = h("div", "bento-card-head");
  head.append(h("span", "bento-card-kicker", example.label.toUpperCase()));

  instance.stage.classList.add("bento-stage");

  const footer = h("div", "bento-card-foot");
  const replay = h("button", "card-playground", "Replay");
  replay.type = "button";
  replay.addEventListener("click", () => instance.replay());
  const link = h("a", "card-playground", "Playground");
  link.href = `${PLAYGROUND_PATH}?effect=${example.id}`;
  link.setAttribute("aria-label", `Open the ${example.label} effect in the playground`);
  footer.append(replay, link);

  card.append(head, instance.stage, footer);
  return card;
}

export function mountBento(): HTMLElement {
  const grid = h("div", "bento");
  grid.setAttribute("aria-label", "Live effects");
  grid.append(...EFFECTS.map(buildCard));
  return grid;
}
