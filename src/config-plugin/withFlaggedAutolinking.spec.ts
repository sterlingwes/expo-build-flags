import fs from "fs";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  updatePodfileAutolinkCall,
  updateGradleAutolinkCall,
} from "./withFlaggedAutolinking";

describe("withFlaggedAutolinking", () => {
  describe("updatePodfileAutolinkCall", () => {
    const podfileContents = fs.readFileSync(
      "src/config-plugin/fixtures/Podfile",
      "utf8"
    );

    it("should replace use_expo_modules! with exclude options in call", () => {
      const updatedContents = updatePodfileAutolinkCall(podfileContents, {
        exclude: ["react-native-device-info"],
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

  describe("updateGradleAutolinkCall", () => {
    const gradleSettingsContents = fs.readFileSync(
      "src/config-plugin/fixtures/settings.gradle",
      "utf8"
    );

    it("should replace useExpoModules() with exclude options in call", () => {
      const updatedContents = updateGradleAutolinkCall(gradleSettingsContents, {
        exclude: ["react-native-device-info", "some-other-module"],
      });
      const lines = updatedContents.split("\n");
      const updatedLine = lines.find((line) =>
        line.trim().startsWith("useExpoModules")
      );

      expect(updatedLine).toBe(
        `useExpoModules(exclude: ["react-native-device-info","some-other-module"])`
      );
    });
  });
});
