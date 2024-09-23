import { resolve } from "path";
import { readFile, writeFile } from "fs/promises";

type FlagMap = Record<string, { value: boolean; meta: any }>;
type FlagsConfig = {
  mergePath: string;
  flags: FlagMap;
};

const readConfig = async (): Promise<FlagsConfig> => {
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

const parseArgs = (args: string[]) => {
  let command;
  const flagsToDisable = new Set<string>();
  const flagsToEnable = new Set<string>();
  args.slice(2).forEach((arg) => {
    if (arg.startsWith("-")) {
      flagsToDisable.add(arg.replace("-", ""));
      return;
    }

    if (arg.startsWith("+")) {
      flagsToEnable.add(arg.replace("+", ""));
      return;
    }

    command = arg;
  });
  return { command, flagsToDisable, flagsToEnable };
};

class BuildFlags {
  flags: FlagMap;

  constructor(defaultFlags: FlagMap) {
    this.flags = defaultFlags;
  }

  enable(enables: Set<string>) {
    enables.forEach((enable) => {
      if (!this.flags[enable]) {
        throw new Error(`Flag ${enable} does not exist, could not enable`);
      }
      this.flags[enable].value = true;
    });
  }

  disable(disables: Set<string>) {
    disables.forEach((disable) => {
      if (!this.flags[disable]) {
        throw new Error(`Flag ${disable} does not exist, could not disable`);
      }
      this.flags[disable].value = false;
    });
  }

  async save(path: string) {
    const flags = JSON.stringify(this.flags, null, 2);
    await writeFile(resolve(path), flags);
  }
}

const printHelp = () => {
  console.log(`Usage: build-flags [command] [flags]
  Commands:
    override  Override default flags with provided flag arguments: +flag to enable, -flag to disable
  `);
};

const run = async () => {
  const { command, flagsToDisable, flagsToEnable } = parseArgs(process.argv);
  if (command === "override") {
    const { mergePath, flags: defaultFlags } = await readConfig();
    const flags = new BuildFlags(defaultFlags);
    flags.enable(flagsToEnable);
    flags.disable(flagsToDisable);
    await flags.save(mergePath);
    return;
  }

  printHelp();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
