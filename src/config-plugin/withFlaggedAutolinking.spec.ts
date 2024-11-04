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

  describe("updateGradleAutolinkCall", () => {
    const gradleSettingsContents = fs.readFileSync(
      "src/config-plugin/fixtures/settings.gradle",
      "utf8"
    );

    it("should replace useExpoModules() with exclude options in call", () => {
      const updatedContents = updateGradleAutolinkCall(gradleSettingsContents, {
        exclude: "react-native-device-info",
      });
      const lines = updatedContents.split("\n");
      const updatedLine = lines.findIndex((line) =>
        line.trim().startsWith("useExpoModules")
      );

      const matchLines = [lines[updatedLine]];
      matchLines.push(lines[updatedLine + 1]);
      matchLines.push(lines[updatedLine + 2]);

      expect(matchLines.join("\n").trim()).toBe(
        "useExpoModules {\n  exclude = 'react-native-device-info'\n}"
      );
    });
  });
});
