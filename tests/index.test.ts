import { describe, expect, it } from "vitest";
import { effectNames } from "../src";

describe("public effects", () => {
  it("exports only burn and assemble", () => {
    expect([...effectNames]).toEqual(["burn", "assemble"]);
  });
});
