import { h } from "./ui";

const SETUP_PROMPT = `Set up ThanosFx in this project.

1. Install thanosfx with the project's package manager. Do not change the lockfile policy or add another animation library.
2. Read node_modules/thanosfx/llms.txt before using the API. If you are inside the ThanosFx repository, read ./llms.txt instead. Fall back to node_modules/thanosfx/README.md if needed.
3. Detect the project's UI framework. If React is present, use useThanosFx from "thanosfx/react"; otherwise use burn and assemble from "thanosfx".
4. Build a small task card and a recycle bin. Deleting a task should burn with attractTo the bin and collision: false. Adding should assemble a new task from the Add button.
5. For deletion, use removeTarget: false and remove the element only after the effect handle's promise resolves. For additions, keep the assembled element visible. Keep the layout stable, respect prefers-reduced-motion, and preserve the existing styles.`;

const BUILD_PROMPT = `Build a task list with a recycle bin and an Add button. Deleting a task should burn it into the bin with attraction; adding should assemble a new task from the Add button. Keep the row's space reserved until the effect finishes, preserve the existing visual style, and respect prefers-reduced-motion. Read node_modules/thanosfx/llms.txt (or ./llms.txt in the ThanosFx repo) if you need API details.`;

function promptBlock(label: string, prompt: string): HTMLElement {
  const block = h("div", "code-block prompt-block");
  const head = h("div", "code-head prompt-head");
  head.append(h("span", "prompt-label", label));

  const copy = h("button", "copy-button prompt-copy", "Copy Prompt");
  copy.type = "button";
  copy.dataset.copy = "";
  head.append(copy);

  const pre = h("pre", "code-body prompt-body");
  const code = h("code");
  code.textContent = prompt;
  pre.append(code);

  block.append(head, pre);
  return block;
}

export function mountQuickStart(): HTMLElement {
  const root = h("div", "quickstart-prompts");
  root.append(
    promptBlock("Setup Prompt", SETUP_PROMPT),
    h("p", "quickstart-note", "Then ask your agent to build a component:"),
    promptBlock("Build Prompt", BUILD_PROMPT),
  );
  return root;
}
