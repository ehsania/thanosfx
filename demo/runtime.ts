import { announce } from "./ui";

function fallbackCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  document.body.append(area);
  area.select();
  const ok = (() => {
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  })();
  area.remove();
  return ok;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return fallbackCopy(text);
  }
}

export function initCopyButtons(): void {
  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("[data-copy]");
    if (!button) return;

    const block = button.closest<HTMLElement>(".code-block");
    const code = block?.querySelector<HTMLElement>("code");
    const text = code?.textContent ?? "";
    if (!text) return;
    const label = button.textContent?.trim() || "Copy";

    const ok = await copyText(text);
    announce(ok ? "Copied" : "Copy failed");
    if (!ok) return;

    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = label;
    }, 1200);
  });
}

export function initReducedMotionNote(): void {
  const note = document.querySelector<HTMLElement>("[data-reduced-note]");
  if (!note) return;
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => {
    note.hidden = !query.matches;
  };
  sync();
  query.addEventListener("change", sync);
}
