import { effectDefaults, playEffect, presetNames } from "thanosfx";
import type { EffectHandle, EffectName, PlayEffectOptions, PresetName } from "thanosfx";
import { PLAYGROUND_PATH } from "../landing/config";
import { EFFECTS, EXAMPLE_BY_ID, isEffectName } from "../landing/examples/registry";
import { initCopyButtons } from "../landing/runtime";
import { initShell } from "../landing/shell";
import {
  createRangeControl,
  createSelectControl,
  createSwitchControl,
  createStage,
  h,
} from "../landing/ui";
import "./playground.css";

const tabsHost = document.querySelector<HTMLElement>("[data-effect-tabs]")!;
const description = document.querySelector<HTMLElement>("[data-effect-description]")!;
const stageHost = document.querySelector<HTMLElement>("[data-stage-host]")!;
const specificHost = document.querySelector<HTMLElement>("[data-specific-host]")!;
const sharedHost = document.querySelector<HTMLElement>("[data-shared-host]")!;
const toolbar = document.querySelector<HTMLElement>("[data-toolbar]")!;
const codeHost = document.querySelector<HTMLElement>("[data-code-host]")!;

if (
  !tabsHost ||
  !description ||
  !stageHost ||
  !specificHost ||
  !sharedHost ||
  !toolbar ||
  !codeHost
) {
  throw new Error("Playground markup is missing");
}

const defaults = effectDefaults.burn;

const state = {
  effect: "burn" as EffectName,
  preset: "default" as PresetName,
  duration: defaults.duration,
  respectReducedMotion: true,
  burnMs: defaults.burnMs,
  density: defaults.density,
  gravity: defaults.gravity,
  bounce: defaults.bounce,
  spread: defaults.spread,
  life: defaults.life,
  friction: defaults.friction,
  lift: defaults.lift,
  particleScale: defaults.particleScale,
  embers: defaults.embers,
  collision: defaults.collision,
  mode: defaults.mode as "sweep" | "instant",
  amplitude: 22,
  frequency: 34,
  speed: 18,
  decay: 4.5,
  strips: 18,
  twist: 0.5,
  grid: 10,
  spin: 1.4,
  pixels: 34,
  dissolve: 1,
};

const tabButtons = new Map<EffectName, HTMLButtonElement>();
const cleanups: Array<() => void> = [];
let handle: EffectHandle | null = null;
let stage: HTMLElement | null = null;
let card: HTMLElement | null = null;

function makeCard(effect: EffectName): HTMLElement {
  const definition = EXAMPLE_BY_ID.get(effect);
  const node = h("button", "fx-card");
  node.type = "button";
  node.setAttribute("aria-label", `Play the ${definition?.label ?? effect} effect`);
  node.innerHTML = `
    <div class="fx-card-top">
      <span class="fx-chip">${effect.toUpperCase()}</span>
      <span class="fx-status">Live DOM</span>
    </div>
    <h3>${definition?.title ?? "Delete me"}</h3>
    <p>${definition?.description ?? "A real element, captured and animated."}</p>
    <div class="fx-card-foot">
      <span class="fx-avatar">AE</span>
      <span class="fx-play-hint">Click to play</span>
    </div>
  `;
  node.addEventListener("click", play);
  return node;
}

function ensureStage(): void {
  if (!stage) {
    stage = createStage("stage--fx", "stage--playground");
    stageHost.append(stage);
  }
  if (!card || !card.isConnected) {
    card = makeCard(state.effect);
    stage.append(card);
  }
  card.style.visibility = "";
  card.style.opacity = "";
}

function options(): PlayEffectOptions {
  const keep = state.effect === "ripple" || state.effect === "assemble";
  return {
    preset: state.preset,
    duration: state.duration,
    reducedMotion: state.respectReducedMotion ? "auto" : "allow",
    removeTarget: !keep,
    pointer: { x: 0.5, y: 0.5 },
    burnMs: state.burnMs,
    density: state.density,
    gravity: state.gravity,
    bounce: state.bounce,
    spread: state.spread,
    life: state.life,
    friction: state.friction,
    lift: state.lift,
    particleScale: state.particleScale,
    embers: state.embers,
    collision: state.collision,
    mode: state.mode,
    amplitude: state.amplitude,
    frequency: state.frequency,
    speed: state.speed,
    decay: state.decay,
    strips: state.strips,
    twist: state.twist,
    grid: state.grid,
    spin: state.spin,
    pixels: state.pixels,
    dissolve: state.dissolve,
  };
}

function play(): void {
  if (handle) return;
  ensureStage();
  if (!card) return;
  handle = playEffect(card, state.effect, options());
  void handle.promise.then(() => {
    handle = null;
    if (state.effect === "ripple" || state.effect === "assemble") {
      if (card) card.style.visibility = "";
    }
  });
}

function reset(): void {
  handle?.cancel();
  handle = null;
  card?.remove();
  card = null;
  ensureStage();
}

function addControl(control: HTMLElement, cleanup?: () => void): void {
  specificHost.append(control);
  if (cleanup) cleanups.push(cleanup);
}

function range(
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
  format: (value: number) => string,
  onInput: (value: number) => void,
): void {
  const control = createRangeControl(label, min, max, step, value, format, onInput);
  addControl(control.el, control.destroy);
}

function buildSpecificControls(): void {
  for (const cleanup of cleanups.splice(0)) cleanup();
  specificHost.replaceChildren();

  if (state.effect === "burn" || state.effect === "assemble") {
    range(
      "Burn time",
      80,
      700,
      10,
      state.burnMs,
      (v) => `${Math.round(v)}ms`,
      (v) => {
        state.burnMs = v;
      },
    );
    range(
      "Density",
      0.3,
      1.4,
      0.05,
      state.density,
      (v) => v.toFixed(2),
      (v) => {
        state.density = v;
      },
    );
    range(
      "Gravity",
      0,
      6000,
      50,
      state.gravity,
      (v) => String(Math.round(v)),
      (v) => {
        state.gravity = v;
      },
    );
    range(
      "Spread",
      0,
      420,
      5,
      state.spread,
      (v) => String(Math.round(v)),
      (v) => {
        state.spread = v;
      },
    );
    range(
      "Life",
      0.3,
      2.5,
      0.05,
      state.life,
      (v) => `${v.toFixed(2)}s`,
      (v) => {
        state.life = v;
      },
    );
    range(
      "Lift",
      0,
      380,
      5,
      state.lift,
      (v) => String(Math.round(v)),
      (v) => {
        state.lift = v;
      },
    );
    range(
      "Bounce",
      0,
      1,
      0.01,
      state.bounce,
      (v) => v.toFixed(2),
      (v) => {
        state.bounce = v;
      },
    );
    range(
      "Friction",
      0,
      1,
      0.01,
      state.friction,
      (v) => v.toFixed(2),
      (v) => {
        state.friction = v;
      },
    );
    const mode = createSelectControl(
      "Burn mode",
      [
        { value: "sweep", label: "Sweep" },
        { value: "instant", label: "Instant" },
      ],
      state.mode,
      (value) => {
        state.mode = value as "sweep" | "instant";
        updateCode();
      },
    );
    addControl(mode.el);
    const embers = createSwitchControl("Embers", state.embers, (value) => {
      state.embers = value;
      updateCode();
    });
    addControl(embers.el);
    const collision = createSwitchControl("Collision", state.collision, (value) => {
      state.collision = value;
      updateCode();
    });
    addControl(collision.el);
  }

  if (state.effect === "ripple") {
    range(
      "Amplitude",
      0,
      60,
      1,
      state.amplitude,
      (v) => String(Math.round(v)),
      (v) => {
        state.amplitude = v;
      },
    );
    range(
      "Frequency",
      4,
      80,
      1,
      state.frequency,
      (v) => String(Math.round(v)),
      (v) => {
        state.frequency = v;
      },
    );
    range(
      "Speed",
      0,
      40,
      1,
      state.speed,
      (v) => String(Math.round(v)),
      (v) => {
        state.speed = v;
      },
    );
    range(
      "Decay",
      0.5,
      12,
      0.1,
      state.decay,
      (v) => v.toFixed(1),
      (v) => {
        state.decay = v;
      },
    );
  }

  if (state.effect === "shred") {
    range(
      "Strips",
      4,
      40,
      1,
      state.strips,
      (v) => String(Math.round(v)),
      (v) => {
        state.strips = v;
      },
    );
    range(
      "Spread",
      0,
      500,
      10,
      state.spread,
      (v) => String(Math.round(v)),
      (v) => {
        state.spread = v;
      },
    );
    range(
      "Gravity",
      0,
      4000,
      50,
      state.gravity,
      (v) => String(Math.round(v)),
      (v) => {
        state.gravity = v;
      },
    );
    range(
      "Twist",
      0,
      1.5,
      0.05,
      state.twist,
      (v) => v.toFixed(2),
      (v) => {
        state.twist = v;
      },
    );
  }

  if (state.effect === "shatter") {
    range(
      "Grid",
      3,
      24,
      1,
      state.grid,
      (v) => String(Math.round(v)),
      (v) => {
        state.grid = v;
      },
    );
    range(
      "Spread",
      0,
      600,
      10,
      state.spread,
      (v) => String(Math.round(v)),
      (v) => {
        state.spread = v;
      },
    );
    range(
      "Gravity",
      0,
      4000,
      50,
      state.gravity,
      (v) => String(Math.round(v)),
      (v) => {
        state.gravity = v;
      },
    );
    range(
      "Spin",
      0,
      4,
      0.1,
      state.spin,
      (v) => v.toFixed(1),
      (v) => {
        state.spin = v;
      },
    );
  }

  if (state.effect === "pixelate") {
    range(
      "Pixels",
      4,
      80,
      1,
      state.pixels,
      (v) => String(Math.round(v)),
      (v) => {
        state.pixels = v;
      },
    );
    range(
      "Dissolve",
      0,
      1,
      0.05,
      state.dissolve,
      (v) => v.toFixed(2),
      (v) => {
        state.dissolve = v;
      },
    );
  }
}

let codeEl: HTMLElement | null = null;

function optionsCode(): string {
  const lines: string[] = [`  duration: ${Math.round(state.duration)},`];
  if (state.preset !== "default") lines.push(`  preset: ${JSON.stringify(state.preset)},`);
  if (!state.respectReducedMotion) lines.push(`  reducedMotion: "allow",`);

  if (state.effect === "burn" || state.effect === "assemble") {
    lines.push(`  burnMs: ${Math.round(state.burnMs)},`);
    lines.push(`  density: ${state.density.toFixed(2)},`);
    lines.push(`  gravity: ${Math.round(state.gravity)},`);
    lines.push(`  spread: ${Math.round(state.spread)},`);
    lines.push(`  lift: ${Math.round(state.lift)},`);
    lines.push(`  life: ${state.life.toFixed(2)},`);
    lines.push(`  bounce: ${state.bounce.toFixed(2)},`);
    lines.push(`  friction: ${state.friction.toFixed(2)},`);
    lines.push(`  embers: ${state.embers},`);
    lines.push(`  collision: ${state.collision},`);
  }
  if (state.effect === "ripple") {
    lines.push(`  amplitude: ${Math.round(state.amplitude)},`);
    lines.push(`  frequency: ${Math.round(state.frequency)},`);
    lines.push(`  speed: ${Math.round(state.speed)},`);
    lines.push(`  decay: ${state.decay.toFixed(1)},`);
  }
  if (state.effect === "shred") {
    lines.push(`  strips: ${Math.round(state.strips)},`);
    lines.push(`  spread: ${Math.round(state.spread)},`);
    lines.push(`  gravity: ${Math.round(state.gravity)},`);
    lines.push(`  twist: ${state.twist.toFixed(2)},`);
  }
  if (state.effect === "shatter") {
    lines.push(`  grid: ${Math.round(state.grid)},`);
    lines.push(`  spread: ${Math.round(state.spread)},`);
    lines.push(`  gravity: ${Math.round(state.gravity)},`);
    lines.push(`  spin: ${state.spin.toFixed(2)},`);
  }
  if (state.effect === "pixelate") {
    lines.push(`  pixels: ${Math.round(state.pixels)},`);
    lines.push(`  dissolve: ${state.dissolve.toFixed(2)},`);
  }
  return lines.join("\n");
}

function updateCode(): void {
  if (!codeEl) return;
  codeEl.textContent = `import { ${state.effect} } from "thanosfx";

const el = document.querySelector<HTMLElement>(".card")!;

${state.effect}(el, {
${optionsCode()}
});`;
}

function buildCodePanel(): void {
  const block = h("div", "code-block");
  const head = h("div", "code-head");
  head.append(h("span", "code-filename", `${state.effect}.ts`));
  const copy = h("button", "copy-button", "Copy");
  copy.type = "button";
  copy.dataset.copy = "";
  head.append(copy);

  const pre = h("pre", "code-body");
  codeEl = h("code");
  pre.append(codeEl);
  block.append(head, pre);
  codeHost.replaceChildren(block);
  updateCode();
}

function buildSharedControls(): void {
  sharedHost.replaceChildren();

  const duration = createRangeControl(
    "Duration",
    150,
    3500,
    50,
    state.duration,
    (value) => `${Math.round(value)}ms`,
    (value) => {
      state.duration = value;
      updateCode();
    },
  );
  sharedHost.append(duration.el);

  const preset = createSelectControl(
    "Preset",
    presetNames.map((name) => ({ value: name, label: name })),
    state.preset,
    (value) => {
      state.preset = value as PresetName;
      updateCode();
    },
  );
  sharedHost.append(preset.el);

  const reduced = createSwitchControl(
    "Respect reduced motion",
    state.respectReducedMotion,
    (value) => {
      state.respectReducedMotion = value;
    },
  );
  sharedHost.append(reduced.el);
}

function selectEffect(effect: EffectName, push = true, force = false): void {
  if (!force && state.effect === effect && stage) return;
  handle?.cancel();
  handle = null;
  state.effect = effect;
  for (const [id, button] of tabButtons) {
    const active = id === effect;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  }
  const definition = EXAMPLE_BY_ID.get(effect);
  description.textContent = definition?.description ?? "";
  card?.remove();
  card = null;
  stage?.remove();
  stage = null;
  ensureStage();
  buildSpecificControls();
  buildCodePanel();
  if (push) history.pushState({ effect }, "", `${PLAYGROUND_PATH}?effect=${effect}`);
}

function initTabs(): void {
  for (const definition of EFFECTS) {
    const button = h("button", "playground-tab", definition.label);
    button.type = "button";
    button.id = `effect-tab-${definition.id}`;
    button.dataset.effect = definition.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "playground-panel");
    button.setAttribute("aria-selected", "false");
    button.tabIndex = -1;
    button.addEventListener("click", () => selectEffect(definition.id));
    tabsHost.append(button);
    tabButtons.set(definition.id, button);
  }

  tabsHost.addEventListener("keydown", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const current = target.dataset.effect;
    if (!isEffectName(current)) return;
    const index = EFFECTS.findIndex((effect) => effect.id === current);
    if (index < 0) return;
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % EFFECTS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + EFFECTS.length) % EFFECTS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = EFFECTS.length - 1;
    else return;
    event.preventDefault();
    const definition = EFFECTS[next];
    if (definition) {
      selectEffect(definition.id);
      tabButtons.get(definition.id)?.focus();
    }
  });
}

function initToolbar(): void {
  const playButton = h("button", "playground-play", "Play");
  playButton.type = "button";
  playButton.addEventListener("click", play);
  const resetButton = h("button", "playground-reset", "Reset");
  resetButton.type = "button";
  resetButton.addEventListener("click", reset);

  const group = h("div", "playground-toolbar-controls");
  const actions = h("div", "playground-toolbar-group");
  actions.append(playButton, resetButton);
  group.append(actions);
  toolbar.append(group);
}

const initial = new URL(location.href).searchParams.get("effect");
initShell();
initTabs();
initToolbar();
buildSharedControls();
selectEffect(isEffectName(initial) ? initial : "burn", false, true);
initCopyButtons();

window.addEventListener("popstate", () => {
  const value = new URL(location.href).searchParams.get("effect");
  if (isEffectName(value)) selectEffect(value, false, true);
});
