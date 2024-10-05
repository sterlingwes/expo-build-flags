import { BuildFlags } from "./BuildFlags";
import { readConfig } from "./readConfig";

export const generateOverrides = async ({
  flagsToEnable,
  flagsToDisable,
  enableBranchFlags,
}: {
  flagsToEnable?: Set<string>;
  flagsToDisable?: Set<string>;
  enableBranchFlags?: boolean;
}) => {
  const { mergePath, flags: defaultFlags } = await readConfig();
  const flags = new BuildFlags(defaultFlags);
  if (enableBranchFlags) {
    flags.enableBranchFlags();
  }
  if (flagsToEnable) {
    flags.enable(flagsToEnable);
  }
  if (flagsToDisable) {
    flags.disable(flagsToDisable);
  }
  await flags.save(mergePath);
};
