import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import * as fs from "fs/promises";
import { readConfigModuleExclusions } from "./readConfig";
import { readFile } from "fs";

jest.mock("fs/promises", () => ({
  readFile: jest.fn(() => Promise.resolve()),
}));

const fsActual: any = jest.requireActual("fs/promises");

describe("readConfigModuleExclusions", () => {
  beforeEach(async () => {
    const yaml = await fsActual.readFile("src/api/fixtures/flags.yml", {
      encoding: "utf-8",
    });
    jest.spyOn(fs, "readFile").mockResolvedValue(yaml);
  });

  it("should return array of strings for modules for false flags", async () => {
    const exclusions = await readConfigModuleExclusions();
    expect(exclusions).toEqual(["react-native-device-info"]);
  });
});
