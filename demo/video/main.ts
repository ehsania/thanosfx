import { burn } from "thanosfx";
import type { EffectOptions } from "thanosfx";
import { createIcon } from "../icons";
import { h } from "../ui";
import landscapeUrl from "./landscape.png?url";

type Mode = "collision" | "attract" | "dissolve";

interface Panel {
  mode: Mode;
  photo: HTMLElement;
  trash: HTMLButtonElement;
}

declare global {
  interface Window {
    __videoReady?: boolean;
    __videoDone?: boolean;
    startThreeModes?: () => void;
  }
}

const MODES: Array<{ mode: Mode; label: string }> = [
  { mode: "collision", label: "Collision" },
  { mode: "attract", label: "Attract" },
  { mode: "dissolve", label: "Dissolve" },
];

const root = document.getElementById("video-root");
if (!root) throw new Error("Missing video root");
const videoRoot: HTMLElement = root;

if (new URLSearchParams(window.location.search).get("theme") === "light") {
  document.documentElement.classList.add("theme-light");
  document.body.classList.add("theme-light");
  videoRoot.classList.add("theme-light");
}

const baseOptions: EffectOptions = {
  duration: 1800,
  burnMs: 220,
  density: 0.34,
  gravity: 3000,
  spread: 150,
  life: 1.35,
  lift: 110,
  bounce: 0.55,
  friction: 0.7,
  particleScale: 1,
  embers: true,
  mode: "sweep",
  dpr: 1,
};

function loadPhoto(): Promise<string> {
  return fetch(landscapeUrl)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error ?? new Error("Could not read photo"));
          reader.readAsDataURL(blob);
        }),
    );
}

async function createPanels(): Promise<Panel[]> {
  const photoSrc = await loadPhoto();
  const grid = h("div", "modes");
  const panels: Panel[] = [];

  for (const definition of MODES) {
    const panel = h("section", "mode-panel");
    const label = h("div", "mode-label", definition.label);

    const photoSlot = h("div", "photo-slot");
    const photo = h("div", "photo-frame");
    const image = h("img");
    image.src = photoSrc;
    image.alt = "";
    photo.append(image);
    photoSlot.append(photo);

    const trash = h("button", "trash-target");
    trash.type = "button";
    trash.setAttribute("aria-label", "Delete photo");
    trash.append(createIcon("trash", 32));
    trash.addEventListener("click", () => startThreeModes());

    panel.append(label, photoSlot, trash);
    grid.append(panel);
    panels.push({ mode: definition.mode, photo, trash });
  }

  videoRoot.append(grid);
  await Promise.all(
    panels.map(async (panel) => {
      const image = panel.photo.querySelector("img");
      if (image) {
        try {
          await image.decode();
        } catch {
          // The image is already loaded from its data URL.
        }
      }
    }),
  );
  return panels;
}

function optionsFor(panel: Panel): EffectOptions {
  if (panel.mode === "collision") {
    return {
      ...baseOptions,
      collision: true,
      collideWith: [panel.trash],
    };
  }

  if (panel.mode === "attract") {
    return {
      ...baseOptions,
      density: 0.3,
      gravity: 540,
      spread: 100,
      lift: 50,
      life: 1.42,
      collision: false,
      attractTo: panel.trash,
      attractStrength: 0.9,
      attractSwirl: 0.3,
    };
  }

  return {
    ...baseOptions,
    gravity: 450,
    spread: 240,
    lift: 210,
    life: 1.5,
    collision: false,
  };
}

let panels: Panel[] = [];
let started = false;

function startThreeModes(): void {
  if (started || panels.length === 0) return;
  started = true;
  window.__videoDone = false;
  const effects = panels.map((panel) => burn(panel.photo, optionsFor(panel)));
  void Promise.allSettled(effects.map((effect) => effect.promise)).then(() => {
    window.__videoDone = true;
  });
}

window.startThreeModes = startThreeModes;

async function init(): Promise<void> {
  panels = await createPanels();
  if (document.fonts) await document.fonts.ready;
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  window.__videoReady = true;
}

void init();
