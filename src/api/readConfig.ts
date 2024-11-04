import YAML from "yaml";
import { readFile } from "fs/promises";
import { FlagsConfig } from "./types";

export const readConfig = async (): Promise<FlagsConfig> => {
  try {
    const flags = await readFile("flags.yml", { encoding: "utf-8" });
    const config = YAML.parse(flags);
    if (config.mergePath === undefined || config.flags === undefined) {
      throw new Error(
        "Invalid flags.yml format, expected mergePath and flags as root keys"
      );
    }

    Object.keys(config.flags).forEach((flag) => {
      if (typeof config.flags[flag]?.value !== "boolean") {
        throw new Error(`Flag ${flag} does not have default value set`);
      }

      if (
        config.flags[flag].ota &&
        !Array.isArray(config.flags[flag].ota.branches)
      ) {
        throw new Error(
          `Flag ${flag} has an OTA filter applied with invalid branches type`
        );
      }
    });

    return config;
  } catch (e) {
    console.error("Error reading flags.yml");
    console.error(e);
    process.exit(1);
  }
};

const getGitBranchName = async () => {
  try {
    const head = await readFile(".git/HEAD", { encoding: "utf-8" });
    const [, , branch] = head.trim().split("/");
    return branch;
  } catch (_) {
    // no-op
  }
};

export const readConfigModuleExclusions = async (
  flagOverrides?: string[]
): Promise<string[]> => {
  const { flags } = await readConfig();
  const branch = await getGitBranchName();
  return Object.keys(flags)
    .filter((flag) => !flags[flag].value)
    .reduce((acc, flag) => {
      if (flags[flag].modules && !flagOverrides?.includes(flag)) {
        return [
          ...acc,
          ...flags[flag].modules
            .map((mod) => {
              if (typeof mod === "string") {
                return mod;
              }
              const [[modName, modConfig]] = Object.entries(mod);
              if (
                typeof modConfig === "object" &&
                "branch" in modConfig &&
                // @ts-expect-error ts inference issue
                modConfig.branch !== branch
              ) {
                return modName;
              }
            })
            .filter((mod): mod is string => typeof mod === "string"),
        ];
      }
      return acc;
    }, [] as string[]);
};
