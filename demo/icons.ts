type IconNode = readonly [string, Readonly<Record<string, string | number>>];

type IconData = readonly IconNode[];

/*
 * Hugeicons (https://hugeicons.com) — MIT licensed.
 * Only the icons used by the demo are inlined here.
 */
const ICONS = {
  sun: [
    [
      "path",
      {
        d: "M16.9991 12C16.9991 14.7614 14.7605 17 11.9991 17C9.23766 17 6.99908 14.7614 6.99908 12C6.99908 9.23858 9.23766 7 11.9991 7C14.7605 7 16.9991 9.23858 16.9991 12Z",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M12.1247 3.25H11.9997M12.1242 20.75H11.9992M20.75 12.125V12M3.25 12.125V12M18.2752 5.90098L18.1868 5.81259M5.90051 18.275L5.81212 18.1866M18.0987 18.2756L18.187 18.1872M5.72429 5.9012L5.81267 5.81282M12.2497 3.25C12.2497 3.38807 12.1378 3.5 11.9997 3.5C11.8616 3.5 11.7497 3.38807 11.7497 3.25C11.7497 3.11193 11.8616 3 11.9997 3C12.1378 3 12.2497 3.11193 12.2497 3.25ZM12.2492 20.75C12.2492 20.8881 12.1373 21 11.9992 21C11.8611 21 11.7492 20.8881 11.7492 20.75C11.7492 20.6119 11.8611 20.5 11.9992 20.5C12.1373 20.5 12.2492 20.6119 12.2492 20.75ZM20.75 12.25C20.6119 12.25 20.5 12.1381 20.5 12C20.5 11.8619 20.6119 11.75 20.75 11.75C20.8881 11.75 21 11.8619 21 12C21 12.1381 20.8881 12.25 20.75 12.25ZM3.25 12.25C3.11193 12.25 3 12.1381 3 12C3 11.8619 3.11193 11.75 3.25 11.75C3.38807 11.75 3.5 11.8619 3.5 12C3.5 12.1381 3.38807 12.25 3.25 12.25ZM18.3636 5.98937C18.266 6.087 18.1077 6.087 18.01 5.98937C17.9124 5.89174 17.9124 5.73345 18.01 5.63582C18.1077 5.53819 18.266 5.53819 18.3636 5.63582C18.4612 5.73345 18.4612 5.89174 18.3636 5.98937ZM5.9889 18.3634C5.89127 18.461 5.73297 18.461 5.63534 18.3634C5.53771 18.2658 5.53771 18.1075 5.63534 18.0099C5.73297 17.9122 5.89127 17.9122 5.9889 18.0099C6.08653 18.1075 6.08653 18.2658 5.9889 18.3634ZM18.0103 18.364C17.9126 18.2663 17.9126 18.108 18.0103 18.0104C18.1079 17.9128 18.2662 17.9128 18.3638 18.0104C18.4614 18.108 18.4614 18.2663 18.3638 18.364C18.2662 18.4616 18.1079 18.4616 18.0103 18.364ZM5.6359 5.98959C5.53827 5.89196 5.53827 5.73367 5.6359 5.63604C5.73353 5.53841 5.89182 5.53841 5.98945 5.63604C6.08708 5.73367 6.08708 5.89196 5.98945 5.98959C5.89182 6.08722 5.73353 6.08722 5.6359 5.98959Z",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
  ],
  moon: [
    [
      "path",
      {
        d: "M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M12 22C15.3137 22 18 17.5228 18 12C18 6.47715 15.3137 2 12 2",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M10 14.5C10 15.3284 9.32843 16 8.5 16C7.67157 16 7 15.3284 7 14.5C7 13.6716 7.67157 13 8.5 13C9.32843 13 10 13.6716 10 14.5Z",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M11.125 7H11M11.25 7C11.25 7.13807 11.1381 7.25 11 7.25C10.8619 7.25 10.75 7.13807 10.75 7C10.75 6.86193 10.8619 6.75 11 6.75C11.1381 6.75 11.25 6.86193 11.25 7Z",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
  ],
  system: [
    [
      "path",
      {
        d: "M14 21H16M14 21C13.1716 21 12.5 20.3284 12.5 19.5V17L12 17M14 21H10M10 21H8M10 21C10.8284 21 11.5 20.3284 11.5 19.5V17L12 17M12 17V21",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M16 3H8C5.17157 3 3.75736 3 2.87868 3.87868C2 4.75736 2 6.17157 2 9V11C2 13.8284 2 15.2426 2.87868 16.1213C3.75736 17 5.17157 17 8 17H16C18.8284 17 20.2426 17 21.1213 16.1213C22 15.2426 22 13.8284 22 11V9C22 6.17157 22 4.75736 21.1213 3.87868C20.2426 3 18.8284 3 16 3Z",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
  ],
  github: [
    [
      "path",
      {
        d: "M10 20.5675C6.57143 21.7248 3.71429 20.5675 2 17",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M10 22V18.7579C10 18.1596 10.1839 17.6396 10.4804 17.1699C10.6838 16.8476 10.5445 16.3904 10.1771 16.2894C7.13394 15.4528 5 14.1077 5 9.64606C5 8.48611 5.38005 7.39556 6.04811 6.4464C6.21437 6.21018 6.29749 6.09208 6.31748 5.9851C6.33746 5.87813 6.30272 5.73852 6.23322 5.45932C5.95038 4.32292 5.96871 3.11619 6.39322 2.02823C6.39322 2.02823 7.27042 1.74242 9.26698 2.98969C9.72282 3.27447 9.95075 3.41686 10.1515 3.44871C10.3522 3.48056 10.6206 3.41384 11.1573 3.28041C11.8913 3.09795 12.6476 3 13.5 3C14.3524 3 15.1087 3.09795 15.8427 3.28041C16.3794 3.41384 16.6478 3.48056 16.8485 3.44871C17.0493 3.41686 17.2772 3.27447 17.733 2.98969C19.7296 1.74242 20.6068 2.02823 20.6068 2.02823C21.0313 3.11619 21.0496 4.32292 20.7668 5.45932C20.6973 5.73852 20.6625 5.87813 20.6825 5.9851C20.7025 6.09207 20.7856 6.21019 20.9519 6.4464C21.6199 7.39556 22 8.48611 22 9.64606C22 14.1077 19.8661 15.4528 16.8229 16.2894C16.4555 16.3904 16.3162 16.8476 16.5196 17.1699C16.8161 17.6396 17 18.1596 17 18.7579V22",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
  ],
  plus: [
    [
      "path",
      {
        d: "M12 5V19",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M5 12H19",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeWidth: "1.5",
      },
    ],
  ],
  trash: [
    [
      "path",
      {
        d: "M4 7H20",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M9 7V5.5C9 4.67157 9.67157 4 10.5 4H13.5C14.3284 4 15 4.67157 15 5.5V7",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M6.5 7L7.4 19.2C7.45 19.9272 8.05444 20.5 8.78233 20.5H15.2177C15.9456 20.5 16.55 19.9272 16.6 19.2L17.5 7",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "1.5",
      },
    ],
    [
      "path",
      {
        d: "M10.5 11V16.5M13.5 11V16.5",
        stroke: "currentColor",
        strokeLinecap: "round",
        strokeWidth: "1.5",
      },
    ],
  ],
} satisfies Record<string, IconData>;

export type IconName = keyof typeof ICONS;

const SVG_NS = "http://www.w3.org/2000/svg";

function svgAttribute(name: string): string {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

export function createIcon(name: IconName, size = 18): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  for (const [tag, attributes] of ICONS[name]) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attributes)) {
      if (key === "key") continue;
      node.setAttribute(svgAttribute(key), String(value));
    }
    svg.append(node);
  }

  return svg;
}

export function hydrateIcons(root: ParentNode = document): void {
  for (const element of root.querySelectorAll<HTMLElement>("[data-icon]")) {
    const name = element.dataset.icon;
    if (!name || !(name in ICONS)) continue;
    if (element.querySelector("svg")) continue;
    element.prepend(createIcon(name as IconName, 18));
  }
}
