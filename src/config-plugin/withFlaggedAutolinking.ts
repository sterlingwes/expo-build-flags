import fs from "fs";
import path from "path";
import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import { readConfigModuleExclusions } from "../api/readConfig";

type Props = { flags: string[] };

const withFlaggedAutolinkingForApple: ConfigPlugin<Props> = (
  config,
  { flags }
) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfile = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = await fs.promises.readFile(podfile, "utf8");
      const exclude = await getExclusions(flags);
      contents = updatePodfileReactNativeAutolinkCall(contents, { exclude });
      contents = updatePodfileExpoModulesAutolinkCall(contents, { exclude });
      await fs.promises.writeFile(podfile, contents, "utf8");
      return config;
    },
  ]);
};

const withFlaggedAutolinkingForAndroid: ConfigPlugin<Props> = (
  config,
  { flags }
) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const gradleSettings = path.join(
        config.modRequest.platformProjectRoot,
        "settings.gradle"
      );
      let contents = await fs.promises.readFile(gradleSettings, "utf8");
      const exclude = await getExclusions(flags);
      contents = updateGradleAutolinkCall(contents, { exclude });
      await fs.promises.writeFile(gradleSettings, contents, "utf8");
      return config;
    },
  ]);
};

export const withFlaggedAutolinking: ConfigPlugin<{ flags: string[] }> = (
  config,
  props
) => {
  return withFlaggedAutolinkingForAndroid(
    withFlaggedAutolinkingForApple(config, props),
    props
  );
};

export function updatePodfileReactNativeAutolinkCall(
  contents: string,
  { exclude }: { exclude: string[] }
): string {
  const matchPoint = "origin_autolinking_method.call(config_command)";
  return contents.replace(
    matchPoint,
    `
    # expo-build-flags autolinking override
    config_command = [
      './node_modules/.bin/build-flags-autolinking',
      ${exclude.map((dep) => [`'-x'`, `'${dep}'`].join(", ")).join(", ")}
    ]
    ${matchPoint}
`
  );
}

export function updatePodfileExpoModulesAutolinkCall(
  contents: string,
  { exclude }: { exclude: string[] }
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
    `use_expo_modules!({ exclude: ["${exclude.join('","')}"] })`
  );
}

export function updateGradleAutolinkCall(
  contents: string,
  { exclude }: { exclude: string[] }
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

  return contents.replace(
    match[0],
    `useExpoModules(exclude: ["${exclude.join('","')}"])`
  );
}

let exclude: string[] | null = null;
async function getExclusions(flagOverrides?: string[]) {
  if (Array.isArray(exclude)) {
    return exclude;
  }
  exclude = await readConfigModuleExclusions(flagOverrides);
  return exclude;
}
