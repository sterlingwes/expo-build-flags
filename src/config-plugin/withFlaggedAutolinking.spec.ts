import fs from "fs";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { updatePodfileAutolinkCall } from "./withFlaggedAutolinking";

const podfileContents = fs.readFileSync(
  "src/config-plugin/fixtures/Podfile",
  "utf8"
);

describe("withFlaggedAutolinking", () => {
  describe("updatePodfileAutolinkCall", () => {
    it("should replace use_expo_modules! with exclude options in call", () => {
      const updatedContents = updatePodfileAutolinkCall(podfileContents, {
        exclude: "react-native-device-info",
      });
      const updatedLine = updatedContents
        .split("\n")
        .find((line) =>
          line
            .trim()
            .startsWith(
              'use_expo_modules!({ exclude: ["react-native-device-info"] })'
            )
        );

      expect(updatedLine).toBeTruthy();
    });
  });
});
