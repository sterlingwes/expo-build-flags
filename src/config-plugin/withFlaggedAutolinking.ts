import fs from "fs";
import path from "path";
import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import { readConfigModuleExclusions } from "../api/readConfig";

const withFlaggedAutolinkingForApple: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfile = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = await fs.promises.readFile(podfile, "utf8");
      const exclude = await getExclusions();
      contents = updatePodfileAutolinkCall(contents, { exclude });
      await fs.promises.writeFile(podfile, contents, "utf8");
      return config;
    },
  ]);
};

const withFlaggedAutolinkingForAndroid: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const gradleSettings = path.join(
        config.modRequest.platformProjectRoot,
        "settings.gradle"
      );
      let contents = await fs.promises.readFile(gradleSettings, "utf8");
      const exclude = await getExclusions();
      contents = updateGradleAutolinkCall(contents, { exclude });
      await fs.promises.writeFile(gradleSettings, contents, "utf8");
      return config;
    },
  ]);
};

export const withFlaggedAutolinking: ConfigPlugin = (config) => {
  return withFlaggedAutolinkingForAndroid(
    withFlaggedAutolinkingForApple(config)
  );
};

export function updatePodfileAutolinkCall(
  contents: string,
  { exclude }: { exclude: string }
): string {
  const match = contents.match(/use_expo_modules!(\s*\(([^)]+)\))?/);
  if (!match?.[0]) {
    throw new Error(`Could not find use_expo_modules! call in Podfile`);
  }

  if (!match[0].trim().endsWith("!")) {
    throw new Error(
      `expo-build-flags: Podfile already passes args to use_expo_modules! and transforming this state is not yet supported.`
    );
  }

  return contents.replace(
    match[0],
    `use_expo_modules!({ exclude: ["${exclude}"] })`
  );
}

export function updateGradleAutolinkCall(
  contents: string,
  { exclude }: { exclude: string }
): string {
  const match = contents.match(/useExpoModules\(\)/);
  if (!match?.[0]) {
    throw new Error(`Could not find useExpoModules() call in settings.gradle`);
  }

  if (!match[0].trim().endsWith("()")) {
    throw new Error(
      `expo-build-flags: settings.gradle has an unexpected useExpoModules() call format.`
    );
  }

  const useExpoWithExclusions = `
useExpoModules {
  exclude = '${exclude}'
}  
`;

  return contents.replace(match[0], useExpoWithExclusions);
}

let exclusionsString: string | null = null;
async function getExclusions() {
  if (typeof exclusionsString === "string") {
    return exclusionsString;
  }
  const exclusions = await readConfigModuleExclusions();
  exclusionsString = exclusions.join(",");
  return exclusionsString;
}
