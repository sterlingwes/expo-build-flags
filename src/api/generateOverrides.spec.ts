import fs from "fs";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { SpyInstance } from "jest-mock";
import { generateOverrides } from "./generateOverrides";
import { afterEach } from "node:test";

jest.mock("./readConfig", () => ({
  readConfig: () =>
    Promise.resolve({
      mergePath: "src/buildFlags.ts",
      flags: {
        exactMatch: {
          value: false,
          ota: { branches: ["skip-me", "feature-branch"] },
        },
        suffixMatch: { value: false, ota: { branches: ["*-suffix-feature"] } },
        prefixMatch: { value: false, ota: { branches: ["prefix-feature-*"] } },
        includesMatch: {
          value: false,
          ota: { branches: ["*-middle-feature-*"] },
        },
        noMatch: { value: false },
      },
    }),
}));

const setCIBranchName = (value?: string) => {
  process.env.CI_COMMIT_REF_NAME = value;
};

describe("generateOverrides", () => {
  let writeFileSpy: SpyInstance;

  beforeEach(() => {
    // @ts-ignore not trying to conform to method type signature
    writeFileSpy = jest
      .spyOn(fs.promises, "writeFile")
      .mockImplementationOnce(() => Promise.resolve());
  });

  afterEach(() => {
    setCIBranchName();
  });

  describe("branch filtering", () => {
    describe("when branch config is not enabled", () => {
      it("should not enable any flags", async () => {
        await generateOverrides({});

        const expectedRuntimeFlags = `export const BuildFlags = {
    exactMatch: false,
    includesMatch: false,
    noMatch: false,
    prefixMatch: false,
    suffixMatch: false
};`;

        expect(writeFileSpy).toHaveBeenCalledWith(
          expect.stringMatching(/src\/buildFlags\.ts$/),
          expect.stringContaining(expectedRuntimeFlags)
        );
      });
    });

    describe("when branch config is enabled", () => {
      describe('for a branch that matches "exactMatch"', () => {
        beforeEach(() => setCIBranchName("feature-branch"));

        it("should enable flags that match the branch", async () => {
          await generateOverrides({ enableBranchFlags: true });

          const expectedRuntimeFlags = `export const BuildFlags = {
    exactMatch: true,
    includesMatch: false,
    noMatch: false,
    prefixMatch: false,
    suffixMatch: false
};`;

          expect(writeFileSpy).toHaveBeenCalledWith(
            expect.stringMatching(/src\/buildFlags\.ts$/),
            expect.stringContaining(expectedRuntimeFlags)
          );
        });

        it("should also allow specific enable", async () => {
          await generateOverrides({
            enableBranchFlags: true,
            flagsToEnable: new Set(["noMatch"]),
          });

          const expectedRuntimeFlags = `export const BuildFlags = {
    exactMatch: true,
    includesMatch: false,
    noMatch: true,
    prefixMatch: false,
    suffixMatch: false
};`;

          expect(writeFileSpy).toHaveBeenCalledWith(
            expect.stringMatching(/src\/buildFlags\.ts$/),
            expect.stringContaining(expectedRuntimeFlags)
          );
        });
      });

      describe('for a branch that matches "includesMatch"', () => {
        beforeEach(() => setCIBranchName("feature-middle-feature-branch"));

        it("should enable flags that match the branch", async () => {
          await generateOverrides({ enableBranchFlags: true });

          const expectedRuntimeFlags = `export const BuildFlags = {
    exactMatch: false,
    includesMatch: true,
    noMatch: false,
    prefixMatch: false,
    suffixMatch: false
};`;

          expect(writeFileSpy).toHaveBeenCalledWith(
            expect.stringMatching(/src\/buildFlags\.ts$/),
            expect.stringContaining(expectedRuntimeFlags)
          );
        });
      });

      describe('for a branch that matches "prefixMatch"', () => {
        beforeEach(() => setCIBranchName("prefix-feature-branch"));

        it("should enable flags that match the branch", async () => {
          await generateOverrides({ enableBranchFlags: true });

          const expectedRuntimeFlags = `export const BuildFlags = {
    exactMatch: false,
    includesMatch: false,
    noMatch: false,
    prefixMatch: true,
    suffixMatch: false
};`;

          expect(writeFileSpy).toHaveBeenCalledWith(
            expect.stringMatching(/src\/buildFlags\.ts$/),
            expect.stringContaining(expectedRuntimeFlags)
          );
        });
      });

      describe('for a branch that matches "suffixMatch"', () => {
        beforeEach(() => setCIBranchName("this-is-a-suffix-feature"));

        it("should enable flags that match the branch", async () => {
          await generateOverrides({ enableBranchFlags: true });

          const expectedRuntimeFlags = `export const BuildFlags = {
    exactMatch: false,
    includesMatch: false,
    noMatch: false,
    prefixMatch: false,
    suffixMatch: true
};`;

          expect(writeFileSpy).toHaveBeenCalledWith(
            expect.stringMatching(/src\/buildFlags\.ts$/),
            expect.stringContaining(expectedRuntimeFlags)
          );
        });
      });
    });
  });
});
