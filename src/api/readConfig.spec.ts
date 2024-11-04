import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import * as fs from "fs/promises";
import { readConfigModuleExclusions } from "./readConfig";

jest.mock("fs/promises", () => ({
  readFile: jest.fn(() => Promise.resolve()),
}));

const fsActual: any = jest.requireActual("fs/promises");

describe("readConfigModuleExclusions", () => {
  beforeEach(async () => {
    const yaml = await fsActual.readFile("src/api/fixtures/flags.yml", {
      encoding: "utf-8",
    });
    jest.spyOn(fs, "readFile").mockImplementation((path: any) => {
      if (path.endsWith("flags.yml")) {
        return yaml;
      }
      if (path.endsWith(".git/HEAD")) {
        return "ref: refs/heads/feature-in-dev-build-branch";
      }
      throw new Error(`readFile: path not mocked: ${path}`);
    });
  });

  it("should return array of strings for modules for false flags", async () => {
    const exclusions = await readConfigModuleExclusions();
    expect(exclusions).toEqual(["react-native-device-info", "exclude-me"]);
  });

  it("should include modules for flags enabled by override", async () => {
    const exclusions = await readConfigModuleExclusions([
      "featureInDevelopment",
    ]);
    expect(exclusions).toEqual([]);
  });
});
