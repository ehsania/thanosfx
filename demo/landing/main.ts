import { PACKAGE_VERSION } from "./config";
import { mountBento } from "./bento";
import { EFFECTS } from "./examples/registry";
import { initCopyButtons } from "./runtime";
import { initShell } from "./shell";
import { h } from "./ui";

function initVersion(): void {
  for (const element of document.querySelectorAll<HTMLElement>("[data-version]")) {
    element.textContent = element.textContent?.replace("v0.1.0", `v${PACKAGE_VERSION}`) ?? "";
  }
}

function initHero(): void {
  const root = document.getElementById("hero-root");
  if (!root) return;
  const definition = EFFECTS.find((effect) => effect.id === "burn");
  if (!definition) return;

  const instance = definition.create();
  instance.stage.classList.add("stage--hero");
  const caption = h(
    "p",
    "stage-caption",
    "Click the card to burn it. It rebuilds itself after a moment.",
  );
  root.append(instance.stage, caption);

  const rebuild = window.setInterval(() => {
    if (!root.isConnected) {
      window.clearInterval(rebuild);
      return;
    }
    const card = instance.stage.querySelector(".fx-card");
    if (!card) instance.replay();
  }, 2600);
}

initShell();
initVersion();
initHero();

const bentoRoot = document.getElementById("bento-root");
if (bentoRoot) bentoRoot.append(mountBento());

initCopyButtons();
