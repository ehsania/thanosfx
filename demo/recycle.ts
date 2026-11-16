import { assemble, burn } from "thanosfx";
import type { EffectHandle } from "thanosfx";
import { createIcon } from "./icons";
import { MODE_CAPTION, assembleOptions, burnOptions, defaultRecycleSettings } from "./settings";
import type { ParticleMode, RecycleSettings } from "./settings";
import { announce, createSegmented, h } from "./ui";
import type { Segmented } from "./ui";

export interface RecycleDemoOptions {
  initialMode?: ParticleMode;
  showModeSwitch?: boolean;
  getSettings?: () => RecycleSettings;
  onModeChange?: (mode: ParticleMode) => void;
}

export interface RecycleDemo {
  element: HTMLElement;
  deleteFirst(): void;
  addFirst(): void;
  setMode(mode: ParticleMode): void;
  getMode(): ParticleMode;
  reset(): void;
  destroy(): void;
}

interface Task {
  title: string;
  meta: string;
  tag: string;
}

interface CardEntry {
  element: HTMLElement;
  task: Task;
}

const INITIAL_TASKS: Task[] = [
  { title: "Ship the landing page", meta: "P0 · due today", tag: "P0" },
  { title: "Review the shader pass", meta: "P1 · in review", tag: "P1" },
  { title: "Answer the open issue", meta: "P2 · tomorrow", tag: "P2" },
];

const NEW_TASKS: Task[] = [
  { title: "Write the changelog", meta: "new · just recycled", tag: "NEW" },
  { title: "Polish the README", meta: "new · just recycled", tag: "NEW" },
  { title: "Tune the easings", meta: "new · just recycled", tag: "NEW" },
  { title: "Record the demo", meta: "new · just recycled", tag: "NEW" },
  { title: "Test reduced motion", meta: "new · just recycled", tag: "NEW" },
  { title: "Check the dark theme", meta: "new · just recycled", tag: "NEW" },
];

export function createRecycleDemo(options: RecycleDemoOptions = {}): RecycleDemo {
  const initialMode = options.initialMode ?? "attract";
  const root = h("div", "recycle-demo");
  root.classList.add(`mode-${initialMode}`);

  const panel = h("div", "todo-panel");
  const head = h("div", "todo-panel-head");
  const addButton = h("button", "todo-add");
  addButton.type = "button";
  addButton.setAttribute("aria-label", "Add task");
  addButton.append(createIcon("plus", 18));
  addButton.addEventListener("click", () => void addCard());
  head.append(h("span", "todo-kicker", "TODAY"), addButton);

  const list = h("div", "todo-stack");
  list.setAttribute("role", "list");
  list.setAttribute("aria-label", "Tasks");

  const listShell = h("div", "todo-list-shell");
  const empty = h("p", "todo-empty", "No tasks left. Add one to rebuild the list.");
  empty.hidden = true;
  listShell.append(list, empty);

  const bin = h("div", "recycle-bin");
  bin.setAttribute("role", "img");
  bin.setAttribute("aria-label", "Recycle bin");
  const mouth = h("div", "recycle-bin-mouth");
  mouth.append(createIcon("trash", 22));
  bin.append(mouth);

  const targets = h("div", "recycle-targets");
  targets.append(bin);

  const caption = h("p", "stage-caption", MODE_CAPTION[initialMode]);

  let mode: ParticleMode = initialMode;
  let locked = false;
  let destroyed = false;
  let replacementIndex = 0;
  let runToken = 0;
  let pulseToken = 0;
  let activeHandle: EffectHandle | null = null;
  let cards: CardEntry[] = [];
  let modeSwitch: Segmented<ParticleMode> | null = null;

  const timers = new Map<number, () => void>();
  const shiftAnimations = new Map<HTMLElement, Animation>();

  function schedule(callback: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      timers.delete(id);
      callback();
    }, ms);
    timers.set(id, () => {
      // The timer is cancelled on teardown.
    });
  }

  function settings(): RecycleSettings {
    return options.getSettings?.() ?? defaultRecycleSettings;
  }

  function nextTask(): Task {
    const task = NEW_TASKS[replacementIndex % NEW_TASKS.length] ?? NEW_TASKS[0]!;
    replacementIndex += 1;
    return task;
  }

  function pulseBin(): void {
    const token = ++pulseToken;
    bin.classList.remove("is-receiving");
    void bin.offsetWidth;
    bin.classList.add("is-receiving");
    schedule(() => {
      if (token === pulseToken) bin.classList.remove("is-receiving");
    }, 900);
  }

  function capturePositions(): Map<HTMLElement, DOMRect> {
    const positions = new Map<HTMLElement, DOMRect>();
    for (const card of cards) {
      positions.set(card.element, card.element.getBoundingClientRect());
    }
    return positions;
  }

  function animateShift(previous: Map<HTMLElement, DOMRect>): void {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const card of cards) {
      const before = previous.get(card.element);
      if (!before) continue;
      const after = card.element.getBoundingClientRect();
      const delta = before.top - after.top;
      if (Math.abs(delta) < 1) continue;
      const running = shiftAnimations.get(card.element);
      running?.cancel();
      const animation = card.element.animate(
        [{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }],
        {
          duration: 360,
          easing: "cubic-bezier(0.22, 0.82, 0.24, 1)",
        },
      );
      shiftAnimations.set(card.element, animation);
      animation.finished.then(
        () => {
          if (shiftAnimations.get(card.element) === animation) {
            shiftAnimations.delete(card.element);
          }
        },
        () => {},
      );
    }
  }

  function syncActions(): void {
    root.classList.toggle("is-busy", locked);
    for (const card of cards) {
      for (const button of card.element.querySelectorAll<HTMLButtonElement>(".todo-delete")) {
        button.disabled = locked;
      }
    }
    addButton.disabled = locked;
    addButton.title = "Add a task";
    empty.hidden = cards.length > 0;
  }

  function applyMode(): void {
    root.classList.toggle("mode-collision", mode === "collision");
    root.classList.toggle("mode-attract", mode === "attract");
    root.classList.toggle("mode-dissolve", mode === "dissolve");
    bin.hidden = mode !== "attract";
    caption.textContent = MODE_CAPTION[mode];
    modeSwitch?.setValue(mode);
  }

  function setMode(next: ParticleMode): void {
    mode = next;
    modeSwitch?.setValue(next);
    if (!locked) applyMode();
    options.onModeChange?.(next);
  }

  function makeCard(task: Task): CardEntry {
    const element = h("div", "todo-card");
    element.setAttribute("role", "listitem");

    const body = h("span", "todo-body");
    const title = h("span", "todo-title", task.title);
    const meta = h("span", "todo-meta", task.meta);
    body.append(title, meta);

    const tag = h("span", "todo-tag", task.tag);
    const remove = h("button", "todo-delete");
    remove.type = "button";
    remove.setAttribute("aria-label", `Delete task: ${task.title}`);
    remove.append(createIcon("trash", 15));

    const entry: CardEntry = { element, task };
    remove.addEventListener("click", () => void deleteCard(entry));
    element.append(body, tag, remove);
    return entry;
  }

  function resetCards(): void {
    for (const card of cards) card.element.remove();
    cards = [];
    list.replaceChildren();
    for (const task of INITIAL_TASKS) {
      const entry = makeCard(task);
      cards.push(entry);
      list.append(entry.element);
    }
    replacementIndex = 0;
    syncActions();
  }

  async function deleteCard(entry: CardEntry): Promise<void> {
    if (destroyed || locked || !cards.includes(entry)) return;
    const actionMode = mode;
    const token = ++runToken;
    locked = true;
    syncActions();
    announce(`Deleting task: ${entry.task.title}`);

    const shouldFocusAdd = entry.element.contains(document.activeElement);
    const others = cards.filter((card) => card !== entry).map((card) => card.element);
    const effectOptions = burnOptions(actionMode, settings(), others, mouth);

    let failed = false;
    try {
      const handle = burn(entry.element, effectOptions);
      activeHandle = handle;
      await handle.promise;
    } catch (error) {
      failed = true;
      console.error("Recycle burn failed:", error);
    } finally {
      if (activeHandle) activeHandle = null;
    }
    if (destroyed || token !== runToken) return;

    if (failed) {
      entry.element.style.visibility = "";
      locked = false;
      applyMode();
      syncActions();
      return;
    }

    entry.element.style.visibility = "hidden";
    const previous = capturePositions();
    const index = cards.indexOf(entry);
    if (index >= 0) cards.splice(index, 1);
    entry.element.remove();
    animateShift(previous);

    if (actionMode === "attract") pulseBin();

    locked = false;
    applyMode();
    syncActions();
    announce(`Task deleted: ${entry.task.title}`);
    if (shouldFocusAdd) addButton.focus({ preventScroll: true });
  }

  async function addCard(): Promise<void> {
    if (destroyed || locked) return;
    const token = ++runToken;
    locked = true;
    const previous = capturePositions();
    const task = nextTask();
    const entry = makeCard(task);
    list.prepend(entry.element);
    list.scrollTop = 0;
    cards.unshift(entry);
    animateShift(previous);
    syncActions();
    announce(`Adding task: ${task.title}`);

    let failed = false;
    try {
      const handle = assemble(entry.element, assembleOptions(settings(), addButton));
      // playEffect clones the element synchronously before its first await, so
      // hiding the target now prevents a flash of the fully formed card while
      // the snapshot is loading.
      entry.element.style.visibility = "hidden";
      activeHandle = handle;
      await handle.promise;
    } catch (error) {
      failed = true;
      console.error("Recycle assemble failed:", error);
    } finally {
      if (activeHandle) activeHandle = null;
    }
    if (destroyed || token !== runToken) return;

    entry.element.style.visibility = "";
    locked = false;
    if (failed) {
      syncActions();
      applyMode();
      announce(`Could not add task: ${task.title}`);
      return;
    }

    entry.element.classList.add("is-new");
    schedule(() => entry.element.classList.remove("is-new"), 1000);
    syncActions();
    applyMode();
    announce(`New task ready: ${task.title}`);

    const focusTarget = addButton.disabled
      ? entry.element.querySelector<HTMLButtonElement>(".todo-delete")
      : addButton;
    focusTarget?.focus({ preventScroll: true });
  }

  if (options.showModeSwitch) {
    const switchControl = createSegmented<ParticleMode>(
      "Particle mode",
      [
        { value: "collision", label: "Collision" },
        { value: "attract", label: "Attract" },
        { value: "dissolve", label: "Dissolve" },
      ],
      initialMode,
      (value) => setMode(value),
      "recycle-mode",
    );
    modeSwitch = switchControl;
    const toolbar = h("div", "recycle-toolbar");
    toolbar.append(switchControl.el);
    root.append(toolbar);
  }

  panel.append(head, listShell);
  root.append(panel, targets, caption);
  resetCards();
  applyMode();

  return {
    element: root,
    deleteFirst() {
      const first = cards[0];
      if (first) void deleteCard(first);
    },
    addFirst() {
      void addCard();
    },
    setMode(next) {
      setMode(next);
    },
    getMode() {
      return mode;
    },
    reset() {
      if (destroyed) return;
      runToken += 1;
      activeHandle?.cancel();
      activeHandle = null;
      for (const [id, resolve] of timers) {
        window.clearTimeout(id);
        resolve();
      }
      timers.clear();
      shiftAnimations.clear();
      locked = false;
      bin.classList.remove("is-receiving");
      resetCards();
      applyMode();
      announce("Recycle demo reset.");
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      runToken += 1;
      activeHandle?.cancel();
      activeHandle = null;
      for (const [id, resolve] of timers) {
        window.clearTimeout(id);
        resolve();
      }
      timers.clear();
      root.remove();
    },
  };
}
