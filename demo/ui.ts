import { enhanceInlineSlider } from "./inline-slider";

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export interface Segmented<T extends string> {
  el: HTMLElement;
  setValue: (value: T) => void;
}

export function createSegmented<T extends string>(
  label: string,
  options: Array<{ value: T; label: string }>,
  value: T,
  onChange: (value: T) => void,
  className = "",
): Segmented<T> {
  const group = h("div", ["segmented", className].filter(Boolean).join(" "));
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", label);

  const buttons = options.map((option) => {
    const button = h("button", undefined, option.label);
    button.type = "button";
    button.dataset.value = option.value;
    button.setAttribute("aria-pressed", String(option.value === value));
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;
      setValue(option.value);
      onChange(option.value);
    });
    group.append(button);
    return button;
  });

  function setValue(next: T): void {
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.value === next));
    }
  }

  return { el: group, setValue };
}

export interface RangeControl {
  el: HTMLElement;
  input: HTMLInputElement;
  setValue: (value: number) => void;
  destroy: () => void;
}

export function createRangeControl(
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
  format: (value: number) => string,
  onInput: (value: number) => void,
): RangeControl {
  const wrapper = h("label", "control");
  const name = h("span", undefined, label);
  const output = h("output", undefined, format(value));

  const input = h("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);

  wrapper.append(name, output, input);
  const slider = enhanceInlineSlider(wrapper, input, name, output);

  input.addEventListener("input", () => {
    const next = Number(input.value);
    output.textContent = format(next);
    slider.render();
    onInput(next);
  });

  return {
    el: wrapper,
    input,
    setValue(next: number) {
      input.value = String(next);
      output.textContent = format(next);
      slider.render();
    },
    destroy() {
      slider.destroy();
    },
  };
}

export interface SelectControl {
  el: HTMLElement;
  select: HTMLSelectElement;
  setValue: (value: string) => void;
}

export function createSelectControl(
  label: string,
  options: Array<{ value: string; label: string }>,
  value: string,
  onChange: (value: string) => void,
): SelectControl {
  const wrapper = h("div", "control control--select");
  const select = h("select");
  select.setAttribute("aria-label", label);
  for (const option of options) {
    const node = h("option", undefined, option.label);
    node.value = option.value;
    if (option.value === value) node.selected = true;
    select.append(node);
  }

  const labelEl = h("span", "select-label", label);
  labelEl.setAttribute("aria-hidden", "true");
  const valueEl = h(
    "span",
    "select-value",
    options.find((option) => option.value === value)?.label ?? value,
  );
  valueEl.setAttribute("aria-hidden", "true");

  const shell = h("span", "select-shell");
  shell.append(labelEl, valueEl, select);
  wrapper.append(shell);

  const selectedLabel = (): string => {
    const option = select.selectedOptions[0];
    return option?.textContent ?? select.value;
  };

  select.addEventListener("change", () => {
    valueEl.textContent = selectedLabel();
    onChange(select.value);
  });

  return {
    el: wrapper,
    select,
    setValue(next: string) {
      select.value = next;
      valueEl.textContent = selectedLabel();
    },
  };
}

export interface SwitchControl {
  el: HTMLButtonElement;
  setValue: (checked: boolean) => void;
}

export function createSwitchControl(
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
): SwitchControl {
  const el = h("button", "switch-control");
  el.type = "button";
  el.setAttribute("role", "switch");
  el.setAttribute("aria-checked", String(checked));
  el.append(h("span", "switch-control__label", label));

  const track = h("span", "switch-control__track");
  track.append(h("span", "switch-control__thumb"));
  el.append(track);

  function setValue(next: boolean): void {
    el.setAttribute("aria-checked", String(next));
  }

  el.addEventListener("click", () => {
    const next = el.getAttribute("aria-checked") !== "true";
    setValue(next);
    onChange(next);
  });

  return { el, setValue };
}

export function announce(message: string): void {
  const region = document.getElementById("live-region");
  if (!region) return;
  region.textContent = "";
  window.setTimeout(() => {
    region.textContent = message;
  }, 30);
}
