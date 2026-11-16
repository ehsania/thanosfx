import type { EffectName, EffectOptions } from "thanosfx";
import { createRecycleDemo } from "./recycle";
import type { RecycleDemo } from "./recycle";
import { assembleOptions, burnOptions, createRecycleSettings } from "./settings";
import type { ParticleMode, RecycleSettings } from "./settings";
import {
  announce,
  createRangeControl,
  createSegmented,
  createSelectControl,
  createSwitchControl,
  h,
} from "./ui";
import type { RangeControl, Segmented, SwitchControl } from "./ui";

export interface TunerApp {
  stage: HTMLElement;
  panel: HTMLElement;
}

function number(value: number, digits = 0): string {
  return digits > 0 ? value.toFixed(digits) : String(Math.round(value));
}

function optionsCode(options: EffectOptions, extras: string[]): string {
  const lines = [
    `  duration: ${number(options.duration ?? 0)},`,
    `  burnMs: ${number(options.burnMs ?? 0)},`,
    `  density: ${number(options.density ?? 0, 2)},`,
    `  gravity: ${number(options.gravity ?? 0)},`,
    `  spread: ${number(options.spread ?? 0)},`,
    `  life: ${number(options.life ?? 0, 2)},`,
    `  lift: ${number(options.lift ?? 0)},`,
    `  bounce: ${number(options.bounce ?? 0, 2)},`,
    `  friction: ${number(options.friction ?? 0, 2)},`,
    `  particleScale: ${number(options.particleScale ?? 1, 2)},`,
    `  embers: ${Boolean(options.embers)},`,
    `  collision: ${Boolean(options.collision)},`,
    `  mode: ${JSON.stringify(options.mode ?? "sweep")},`,
  ];

  if (options.reducedMotion === "allow") lines.push(`  reducedMotion: "allow",`);
  if (options.attractStrength !== undefined) {
    lines.push(`  attractStrength: ${number(options.attractStrength, 2)},`);
  }
  if (options.attractSwirl !== undefined) {
    lines.push(`  attractSwirl: ${number(options.attractSwirl, 2)},`);
  }

  lines.push("  removeTarget: false,");
  lines.push(...extras);
  return lines.join("\n");
}

export function mountTuner(): TunerApp {
  const state: RecycleSettings = createRecycleSettings();
  let effect: EffectName = "burn";
  let effectControl: Segmented<EffectName> | null = null;
  let playButton: HTMLButtonElement | null = null;
  let durationControl: RangeControl | null = null;
  let reducedControl: SwitchControl | null = null;
  let codeEl: HTMLElement | null = null;
  let codeFileEl: HTMLElement | null = null;

  const specificCleanups: Array<() => void> = [];
  const sharedCleanups: Array<() => void> = [];

  const stage = h("div", "stage stage--hero stage--recycle");
  const panel = h("div", "tuner");
  const toolbar = h("div", "tuner-toolbar");
  const actions = h("div", "tuner-actions");
  const groups = h("div", "tuner-groups");
  const specificHost = h("div", "tuner-specific");
  const sharedHost = h("div", "tuner-shared");
  const codeHost = h("div", "tuner-code");

  groups.append(specificHost, sharedHost);
  panel.append(toolbar, groups, codeHost);

  const demo: RecycleDemo = createRecycleDemo({
    initialMode: "attract",
    showModeSwitch: true,
    getSettings: () => state,
    onModeChange: () => updateCode(),
  });
  stage.append(demo.element);

  function buildCode(): string {
    const mode: ParticleMode = demo.getMode();

    if (effect === "assemble") {
      return [
        `import { assemble } from "thanosfx";`,
        "",
        `const addButton = document.querySelector<HTMLElement>(".todo-add")!;`,
        `const card = document.createElement("div");`,
        `card.className = "task";`,
        "",
        "assemble(card, {",
        optionsCode(assembleOptions(state, null), ["  attractTo: addButton,"]),
        "});",
      ].join("\n");
    }

    const prelude = [`const card = document.querySelector<HTMLElement>(".task")!;`];
    const extras: string[] = [];

    if (mode === "attract") {
      prelude.push(`const bin = document.querySelector<HTMLElement>(".recycle-bin")!;`);
      extras.push("  attractTo: bin,");
    }

    if (mode === "collision") {
      prelude.push(
        `const others = [...document.querySelectorAll<HTMLElement>(".task")].filter((el) => el !== card);`,
      );
      extras.push("  collideWith: others,");
    }

    return [
      `import { burn } from "thanosfx";`,
      "",
      ...prelude,
      "",
      "burn(card, {",
      optionsCode(burnOptions(mode, state, [], null), extras),
      "});",
    ].join("\n");
  }

  function updateCode(): void {
    if (!codeEl) return;
    codeEl.textContent = buildCode();
    if (codeFileEl) codeFileEl.textContent = `${effect}.ts`;
  }

  function updatePlayLabel(): void {
    if (!playButton) return;
    const label = effect === "assemble" ? "Add a task and assemble it" : "Burn the first task";
    playButton.title = label;
    playButton.setAttribute("aria-label", label);
  }

  function addControl(control: HTMLElement, cleanup?: () => void): void {
    specificHost.append(control);
    if (cleanup) specificCleanups.push(cleanup);
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
    const control = createRangeControl(label, min, max, step, value, format, (next) => {
      onInput(next);
      updateCode();
    });
    addControl(control.el, control.destroy);
  }

  function buildSpecificControls(): void {
    for (const cleanup of specificCleanups.splice(0)) cleanup();
    specificHost.replaceChildren();

    range(
      "Burn time",
      80,
      700,
      10,
      state.burnMs,
      (value) => `${Math.round(value)}ms`,
      (value) => {
        state.burnMs = value;
      },
    );
    range(
      "Density",
      0.3,
      1.4,
      0.05,
      state.density,
      (value) => value.toFixed(2),
      (value) => {
        state.density = value;
      },
    );
    range(
      "Gravity",
      0,
      6000,
      50,
      state.gravity,
      (value) => String(Math.round(value)),
      (value) => {
        state.gravity = value;
      },
    );
    range(
      "Spread",
      0,
      420,
      5,
      state.spread,
      (value) => String(Math.round(value)),
      (value) => {
        state.spread = value;
      },
    );
    range(
      "Life",
      0.3,
      2.5,
      0.05,
      state.life,
      (value) => `${value.toFixed(2)}s`,
      (value) => {
        state.life = value;
      },
    );
    range(
      "Lift",
      0,
      380,
      5,
      state.lift,
      (value) => String(Math.round(value)),
      (value) => {
        state.lift = value;
      },
    );
    range(
      "Bounce",
      0,
      1,
      0.01,
      state.bounce,
      (value) => value.toFixed(2),
      (value) => {
        state.bounce = value;
      },
    );
    range(
      "Friction",
      0,
      1,
      0.01,
      state.friction,
      (value) => value.toFixed(2),
      (value) => {
        state.friction = value;
      },
    );
    range(
      "Particle size",
      0.4,
      2,
      0.05,
      state.particleScale,
      (value) => value.toFixed(2),
      (value) => {
        state.particleScale = value;
      },
    );

    const burnMode = createSelectControl(
      "Burn mode",
      [
        { value: "sweep", label: "Sweep" },
        { value: "instant", label: "Instant" },
      ],
      state.burnMode,
      (value) => {
        state.burnMode = value as "sweep" | "instant";
        updateCode();
      },
    );
    addControl(burnMode.el);

    const embers = createSwitchControl("Embers", state.embers, (value) => {
      state.embers = value;
      updateCode();
    });
    addControl(embers.el);

    range(
      "Pull",
      0,
      1,
      0.05,
      state.attractStrength,
      (value) => value.toFixed(2),
      (value) => {
        state.attractStrength = value;
      },
    );
    range(
      "Swirl",
      -1,
      1,
      0.05,
      state.attractSwirl,
      (value) => value.toFixed(2),
      (value) => {
        state.attractSwirl = value;
      },
    );
  }

  function buildSharedControls(): void {
    for (const cleanup of sharedCleanups.splice(0)) cleanup();
    sharedHost.replaceChildren();

    durationControl = createRangeControl(
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
    sharedHost.append(durationControl.el);
    sharedCleanups.push(durationControl.destroy);

    reducedControl = createSwitchControl(
      "Respect reduced motion",
      state.respectReducedMotion,
      (value) => {
        state.respectReducedMotion = value;
        updateCode();
      },
    );
    sharedHost.append(reducedControl.el);
  }

  function buildCodePanel(): void {
    const block = h("div", "code-block");
    const head = h("div", "code-head");
    codeFileEl = h("span", "code-filename", `${effect}.ts`);
    const copy = h("button", "copy-button", "Copy");
    copy.type = "button";
    copy.dataset.copy = "";
    head.append(codeFileEl, copy);

    const pre = h("pre", "code-body");
    codeEl = h("code");
    pre.append(codeEl);
    block.append(head, pre);
    codeHost.replaceChildren(block);
    updateCode();
  }

  function restoreDefaults(): void {
    Object.assign(state, createRecycleSettings());
    effect = "burn";
    effectControl?.setValue("burn");
    demo.setMode("attract");
    demo.reset();
    durationControl?.setValue(state.duration);
    reducedControl?.setValue(state.respectReducedMotion);
    buildSpecificControls();
    updatePlayLabel();
    updateCode();
    announce("Defaults restored.");
  }

  const effectSegment = createSegmented<EffectName>(
    "Effect",
    [
      { value: "burn", label: "Burn" },
      { value: "assemble", label: "Assemble" },
    ],
    effect,
    (value) => {
      effect = value;
      updateCode();
      updatePlayLabel();
    },
    "tuner-effect",
  );
  effectControl = effectSegment;

  playButton = h("button", "tuner-play", "Play");
  playButton.type = "button";
  playButton.addEventListener("click", () => {
    if (effect === "assemble") demo.addFirst();
    else demo.deleteFirst();
  });
  updatePlayLabel();

  const resetButton = h("button", "tuner-reset", "Reset");
  resetButton.type = "button";
  resetButton.title = "Reset demo";
  resetButton.setAttribute("aria-label", "Reset demo");
  resetButton.addEventListener("click", () => demo.reset());

  const defaultsButton = h("button", "tuner-reset", "Restore");
  defaultsButton.type = "button";
  defaultsButton.title = "Restore defaults";
  defaultsButton.setAttribute("aria-label", "Restore defaults");
  defaultsButton.addEventListener("click", restoreDefaults);

  actions.append(effectSegment.el, playButton, resetButton, defaultsButton);
  toolbar.append(actions);

  buildSpecificControls();
  buildSharedControls();
  buildCodePanel();

  return { stage, panel };
}
