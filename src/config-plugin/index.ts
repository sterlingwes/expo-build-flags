import {
  ConfigPlugin,
  createRunOncePlugin,
  withAndroidManifest,
  withDangerousMod,
  withInfoPlist,
} from "@expo/config-plugins";
import { generateOverrides } from "../api";
import pkg from "../../package.json";
import { withFlaggedAutolinking } from "./withFlaggedAutolinking";

const withAndroidBuildFlags: ConfigPlugin<{ flags: string[] }> = (
  config,
  props
) => {
  return withAndroidManifest(config, (config) => {
    if (!config.modResults) {
      throw new Error("AndroidManifest.xml not found in the project");
    }

    const mainApplication = config.modResults.manifest?.application?.[0];
    if (!mainApplication) {
      throw new Error("Application node not found in AndroidManifest.xml");
    }

    const meta = mainApplication["meta-data"];
    mainApplication["meta-data"] = [
      ...(meta ?? []),
      {
        $: {
          "android:name": "EXBuildFlags",
          "android:value": props.flags.join(","),
        },
      },
    ];

    return config;
  });
};

const withAppleBuildFlags: ConfigPlugin<{ flags: string[] }> = (
  config,
  props
) => {
  return withInfoPlist(config, (config) => {
    config.modResults.EXBuildFlags = props.flags;
    return config;
  });
};

const withBundleFlags: ConfigPlugin<{ flags: string[] }> = (config, props) => {
  return withDangerousMod(config, [
    "ios", // not platform-specific, but need to specify
    async (config) => {
      const { flags } = props;
      await generateOverrides({ flagsToEnable: new Set(flags) });
      return config;
    },
  ]);
};

const parseEnvFlags = () => {
  const envFlags = process.env.EXPO_BUILD_FLAGS;
  if (!envFlags) {
    return [];
  }

  const flags = new Set<string>();

  envFlags.split(",").forEach((flag) => {
    flags.add(flag.trim());
  });

  return Array.from(flags);
};

type ConfigPluginProps =
  | { skipBundleOverride?: boolean; flaggedAutolinking?: boolean }
  | undefined;

type WithBuildFlagsProps = { skipBundleOverride?: boolean; flags: string[] };

const withBuildFlags: ConfigPlugin<WithBuildFlagsProps> = (config, props) => {
  const flags = props.flags;
  if (!flags.length) {
    return props?.skipBundleOverride
      ? config
      : withBundleFlags(config, { flags });
  }

  const nativeConfig = withAndroidBuildFlags(config, { flags });
  const mergedNativeConfig = withAppleBuildFlags(nativeConfig, { flags });
  if (props?.skipBundleOverride) {
    return mergedNativeConfig;
  }

  return withBundleFlags(mergedNativeConfig, { flags });
};

const withBuildFlagsAndLinking: ConfigPlugin<ConfigPluginProps> = (
  config,
  props
) => {
  let mergedConfig = config;
  const flags = parseEnvFlags();

  if (props?.flaggedAutolinking) {
    mergedConfig = withFlaggedAutolinking(mergedConfig, { flags });
  }

  return withBuildFlags(config, { ...props, flags });
};

export default createRunOncePlugin(
  withBuildFlagsAndLinking,
  pkg.name,
  pkg.version
);
