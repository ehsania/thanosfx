import { playEffect } from "thanosfx";
import type { EffectHandle, PlayEffectOptions } from "thanosfx";
import { h } from "../ui";
import type { ExampleDefinition, ExampleInstance } from "./types";

function cardMarkup(title: string, description: string): string {
  return `
    <div class="fx-card-top">
      <span class="fx-chip">P0</span>
      <span class="fx-status">In progress</span>
    </div>
    <h3>${title}</h3>
    <p>${description}</p>
    <div class="fx-card-foot">
      <span class="fx-avatar">AE</span>
      <span class="fx-play-hint">Click to play</span>
    </div>
  `;
}

function makeCard(definition: ExampleDefinition): HTMLElement {
  const card = h("button", "fx-card");
  card.type = "button";
  card.setAttribute("aria-label", `Play the ${definition.label} effect`);
  card.innerHTML = cardMarkup(definition.title, definition.description);
  return card;
}

export function createExample(definition: ExampleDefinition): ExampleInstance {
  const stage = h("div", "stage stage--fx");
  stage.setAttribute("aria-label", `${definition.label} effect`);

  let card = makeCard(definition);
  let handle: EffectHandle | null = null;
  let destroyed = false;

  const options: PlayEffectOptions = {
    removeTarget: definition.id === "ripple" || definition.id === "assemble" ? false : true,
    pointer: { x: 0.5, y: 0.5 },
  };

  function play(): void {
    if (destroyed || handle) return;
    if (!card.isConnected) {
      card = makeCard(definition);
      bind();
      stage.append(card);
    }
    card.style.visibility = "";
    card.style.opacity = "";
    handle = playEffect(card, definition.id, options);
    void handle.promise.then(() => {
      handle = null;
      if (definition.id === "ripple" || definition.id === "assemble") {
        card.style.visibility = "";
      }
    });
  }

  function bind(): void {
    card.addEventListener("click", play);
  }

  function reset(): void {
    handle?.cancel();
    handle = null;
    if (!card.isConnected) {
      card = makeCard(definition);
      bind();
      stage.append(card);
    }
    card.style.visibility = "";
    card.style.opacity = "";
  }

  bind();
  stage.append(card);

  return {
    id: definition.id,
    stage,
    replay() {
      reset();
      window.setTimeout(play, 80);
    },
    reset,
    destroy() {
      destroyed = true;
      handle?.cancel();
      handle = null;
      card.remove();
    },
  };
}
