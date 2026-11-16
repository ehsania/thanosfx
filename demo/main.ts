import { mountQuickStart } from "./quickstart";
import { initCopyButtons } from "./runtime";
import { initShell } from "./shell";
import { mountTuner } from "./tuner";

function initVersion(): void {
  for (const element of document.querySelectorAll<HTMLElement>("[data-version]")) {
    element.textContent = element.textContent?.replace("v0.1.0", `v${__APP_VERSION__}`) ?? "";
  }
}

function initPage(): void {
  initShell();
  initVersion();
  initCopyButtons();

  const quickstartRoot = document.getElementById("quickstart-root");
  if (quickstartRoot) quickstartRoot.append(mountQuickStart());

  const heroRoot = document.getElementById("hero-root");
  const tunerRoot = document.getElementById("tuner-root");
  if (!heroRoot || !tunerRoot) return;

  const tuner = mountTuner();
  heroRoot.append(tuner.stage);
  tunerRoot.append(tuner.panel);
}

initPage();
