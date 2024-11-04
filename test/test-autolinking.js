const fs = require("fs");
const cp = require("child_process");

installExpoConfigPlugin();
addModulesForExclusion();
runPrebuild();
assertPodfileLockExcludesModules();

/**
 * this install step assumes test-config-plugin runs before this spec suite
 * and the plugin was previously installed
 */
function installExpoConfigPlugin() {
  const expoConfig = JSON.parse(fs.readFileSync("app.json", "utf-8"));
  expoConfig.expo.plugins = expoConfig.expo.plugins.map((plugin) => {
    if (plugin === "expo-build-flags") {
      return ["expo-build-flags", { flaggedAutolinking: true }];
    }
    return plugin;
  });
  fs.writeFileSync("app.json", JSON.stringify(expoConfig, null, 2));
}

function addModulesForExclusion() {
  let defaultFlags = fs.readFileSync("flags.yml", "utf-8");
  const flagWithModules = `  secretFeature:
    modules:
      - expo-splash-screen
      - expo-status-bar`;
  defaultFlags = defaultFlags.replace("  secretFeature:", flagWithModules);
  console.log("patched flags.yml:\n\n", defaultFlags);
  fs.writeFileSync("flags.yml", defaultFlags);
}

function runPrebuild() {
  cp.execSync("./node_modules/.bin/expo prebuild --no-install --clean", {
    env: {
      ...process.env,
      CI: 1,
    },
  });
  try {
    cp.execSync("../node_modules/.bin/pod-lockfile --project ios", {
      stdio: "inherit",
    });
  } catch (e) {
    console.error("pod-lockfile threw");
  }
}

function assertPodfileLockExcludesModules() {
  const podfileLock = fs.readFileSync("ios/Podfile.lock", "utf-8");
  if (podfileLock.includes("Splash")) {
    throw new Error("Expected ios/Podfile.lock to exclude expo-splash-screen");
  }

  console.log("Test passed!");
}
