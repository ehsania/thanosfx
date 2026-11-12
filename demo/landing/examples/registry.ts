import type { EffectName } from "thanosfx";
import { createExample } from "./factory";
import type { ExampleDefinition } from "./types";

const META: Array<Omit<ExampleDefinition, "create">> = [
  {
    id: "burn",
    label: "Burn",
    title: "Delete me",
    description: "The classic ash treatment. Carbon first, dust second.",
    wide: true,
  },
  {
    id: "assemble",
    label: "Assemble",
    title: "Put me back",
    description: "Burn played backwards. Dust gathers and the card returns.",
  },
  {
    id: "ripple",
    label: "Ripple",
    title: "Touch me",
    description: "A radial wave bends the card and settles back into place.",
  },
  {
    id: "shred",
    label: "Shred",
    title: "Shred me",
    description: "The card is cut into strips and pulled apart.",
  },
  {
    id: "shatter",
    label: "Shatter",
    title: "Break me",
    description: "A grid of fragments spins outward and falls away.",
  },
  {
    id: "pixelate",
    label: "Pixelate",
    title: "Pixelate me",
    description: "The card quantizes into blocks and dissolves.",
  },
];

export const EFFECTS: ExampleDefinition[] = META.map((meta) => {
  const definition: ExampleDefinition = {
    ...meta,
    create: () => createExample(definition),
  };
  return definition;
});

export const EXAMPLE_BY_ID: ReadonlyMap<EffectName, ExampleDefinition> = new Map(
  EFFECTS.map((definition) => [definition.id, definition]),
);

export function isEffectName(value: string | null | undefined): value is EffectName {
  return value !== null && value !== undefined && EXAMPLE_BY_ID.has(value as EffectName);
}
