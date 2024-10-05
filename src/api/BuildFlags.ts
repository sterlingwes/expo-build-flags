import { writeFile } from "fs/promises";
import { FlagMap } from "./types";
import { resolve } from "path";
import { printAsTs } from "./tsPrinter";
import { getCIBranch } from "./ciHelpers";
import { hasMatch } from "./globUtil";

export class BuildFlags {
  flags: FlagMap;

  constructor(defaultFlags: FlagMap) {
    this.flags = defaultFlags;
  }

  enableBranchFlags() {
    const branch = getCIBranch();
    if (!branch) {
      return;
    }

    const branchFlags = Object.keys(this.flags).filter((flag) => {
      const ota = this.flags[flag].ota;
      if (
        ota &&
        Array.isArray(ota.branches) &&
        hasMatch(branch, ota.branches)
      ) {
        return true;
      }
    });

    if (branchFlags.length === 0) {
      return;
    }

    this.enable(new Set(branchFlags));
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
    if (path.endsWith(".json")) {
      const flags = JSON.stringify(this.flags, null, 2);
      await writeFile(resolve(path), flags);
      return;
    }

    if (path.endsWith(".ts")) {
      const ts = printAsTs(this.flags);
      await writeFile(resolve(path), ts);
      return;
    }

    throw new Error(
      "Invalid file extension in flags file for mergePath: expected .json or .ts"
    );
  }
}
