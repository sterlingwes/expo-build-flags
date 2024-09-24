import { generateOverrides } from "expo-build-flags";

await generateOverrides({
  flagsToDisable: new Set(["secretFeature"]),
});
