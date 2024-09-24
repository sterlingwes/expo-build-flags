import { BuildFlags } from "./BuildFlags";
import { readConfig } from "./readConfig";

export const generateOverrides = async ({
  flagsToEnable,
  flagsToDisable,
}: {
  flagsToEnable?: Set<string>;
  flagsToDisable?: Set<string>;
}) => {
  const { mergePath, flags: defaultFlags } = await readConfig();
  const flags = new BuildFlags(defaultFlags);
  if (flagsToEnable) {
    flags.enable(flagsToEnable);
  }
  if (flagsToDisable) {
    flags.disable(flagsToDisable);
  }
  await flags.save(mergePath);
};
