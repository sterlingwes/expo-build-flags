import { readFile } from "fs/promises";
import { FlagsConfig } from "./types";

export const readConfig = async (): Promise<FlagsConfig> => {
  try {
    const flags = await readFile("flags.json", { encoding: "utf-8" });
    const config = JSON.parse(flags);
    if (config.mergePath === undefined || config.flags === undefined) {
      throw new Error(
        "Invalid flags.json format, expected mergePath and flags as root keys"
      );
    }

    Object.keys(config.flags).forEach((flag) => {
      if (typeof config.flags[flag]?.value !== "boolean") {
        throw new Error(`Flag ${flag} does not have default value set`);
      }
    });

    return config;
  } catch (e) {
    console.error("Error reading flags.json");
    console.error(e);
    process.exit(1);
  }
};
