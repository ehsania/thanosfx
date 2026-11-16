import { describe, expect, it } from "vitest";
import {
  assembleOptions,
  burnOptions,
  createRecycleSettings,
  defaultRecycleSettings,
} from "../demo/settings";

describe("recycle settings", () => {
  it("returns independent defaults", () => {
    const settings = createRecycleSettings();
    expect(settings).toEqual(defaultRecycleSettings);
    expect(settings).not.toBe(defaultRecycleSettings);
  });

  it("builds collision options", () => {
    const settings = createRecycleSettings();
    const other = document.createElement("div");
    const options = burnOptions("collision", settings, [other], null);

    expect(options.collision).toBe(true);
    expect(options.collideWith).toEqual([other]);
    expect(options.attractTo).toBeUndefined();
  });

  it("builds attract options", () => {
    const settings = createRecycleSettings();
    const bin = document.createElement("div");
    const options = burnOptions("attract", settings, [], bin);

    expect(options.collision).toBe(false);
    expect(options.attractTo).toBe(bin);
    expect(options.attractStrength).toBe(settings.attractStrength);
    expect(options.attractSwirl).toBe(settings.attractSwirl);
    expect(options.density).toBeCloseTo(settings.density * 0.55);
  });

  it("builds dissolve options without a target", () => {
    const settings = createRecycleSettings();
    const options = burnOptions("dissolve", settings, [], null);

    expect(options.collision).toBe(false);
    expect(options.attractTo).toBeUndefined();
    expect(options.gravity).toBeCloseTo(settings.gravity * 0.14);
  });

  it("builds assemble options", () => {
    const settings = createRecycleSettings();
    const addButton = document.createElement("div");
    const options = assembleOptions(settings, addButton);

    expect(options.collision).toBe(false);
    expect(options.attractTo).toBe(addButton);
    expect(options.removeTarget).toBe(false);
    expect(options.attractStrength).toBeGreaterThanOrEqual(0.8);
  });

  it("passes reduced-motion preference through", () => {
    const settings = createRecycleSettings();
    settings.respectReducedMotion = false;
    expect(burnOptions("dissolve", settings, [], null).reducedMotion).toBe("allow");
  });
});
