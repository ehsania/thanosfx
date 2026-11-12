import type { Rect } from "./types";

declare global {
  interface Window {
    html2canvas?: (
      element: HTMLElement,
      options?: Record<string, unknown>,
    ) => Promise<HTMLCanvasElement>;
  }
}

export interface CaptureResult {
  canvas: HTMLCanvasElement;
  rect: Rect;
}

function inlineStyles(source: Element, target: Element): void {
  const computed = getComputedStyle(source);
  const targetStyle = (target as HTMLElement).style;
  for (let index = 0; index < computed.length; index += 1) {
    const property = computed[index];
    if (!property) continue;
    targetStyle.setProperty(
      property,
      computed.getPropertyValue(property),
      computed.getPropertyPriority(property),
    );
  }
}

function inlineStylesRecursive(source: Element, target: Element): void {
  inlineStyles(source, target);
  const sourceChildren = source.children;
  const targetChildren = target.children;
  const count = Math.min(sourceChildren.length, targetChildren.length);
  for (let index = 0; index < count; index += 1) {
    const sourceChild = sourceChildren[index];
    const targetChild = targetChildren[index];
    if (sourceChild && targetChild) inlineStylesRecursive(sourceChild, targetChild);
  }
}

function fallbackSnapshot(element: HTMLElement, rect: Rect, dpr: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const computed = getComputedStyle(element);
  const radius = Number.parseFloat(computed.borderRadius) || 0;
  const drawRounded = () => {
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.arcTo(rect.width, 0, rect.width, rect.height, radius);
    ctx.arcTo(rect.width, rect.height, 0, rect.height, radius);
    ctx.arcTo(0, rect.height, 0, 0, radius);
    ctx.arcTo(0, 0, rect.width, 0, radius);
    ctx.closePath();
  };

  drawRounded();
  ctx.fillStyle =
    computed.backgroundColor === "rgba(0, 0, 0, 0)" ? "#1b1a1f" : computed.backgroundColor;
  ctx.fill();
  ctx.fillStyle = computed.color || "#f4f4f1";
  ctx.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
  const text = element.textContent?.trim().slice(0, 160) ?? "";
  ctx.fillText(text, 18, 30, Math.max(1, rect.width - 36));
  return canvas;
}

export async function captureElement(element: HTMLElement, dpr: number): Promise<CaptureResult> {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));

  if (typeof window !== "undefined" && typeof window.html2canvas === "function") {
    const canvas = await window.html2canvas(element, {
      backgroundColor: null,
      scale: dpr,
      logging: false,
    });
    return { canvas, rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height } };
  }

  const clone = element.cloneNode(true) as HTMLElement;
  inlineStylesRecursive(element, clone);
  clone.style.transform = "none";
  clone.style.transformOrigin = "0 0";
  clone.style.direction = "ltr";
  clone.style.writingMode = "horizontal-tb";
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = "0";
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
  <foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(clone)}</foreignObject>
</svg>`;

  await (document.fonts ? document.fonts.ready : Promise.resolve());

  const image = new Image();
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const loaded = await new Promise<boolean>((resolve) => {
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });

  if (!loaded) {
    return {
      canvas: fallbackSnapshot(element, { x: rect.left, y: rect.top, width, height }, dpr),
      rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(image, 0, 0, width, height);
  }
  return { canvas, rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height } };
}
