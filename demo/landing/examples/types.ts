import type { EffectName } from "thanosfx";

export interface ExampleInstance {
  readonly id: EffectName;
  readonly stage: HTMLElement;
  replay: () => void;
  reset: () => void;
  destroy: () => void;
}

export interface ExampleDefinition {
  id: EffectName;
  label: string;
  title: string;
  description: string;
  wide?: boolean;
  create: () => ExampleInstance;
}
