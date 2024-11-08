const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const {
  disablePodfilePrepareHook,
  mockXcodebuild,
} = require("expo-native-lockfiles/cli/build/patcher");

installExpoConfigPlugin();
addModulesForExclusion();
runAsync();

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

async function runAsync() {
  await runPrebuild();
  await assertPodfileLockExcludesModules();
  process.exit(0);
}

async function runPrebuild() {
  cp.execSync("./node_modules/.bin/expo prebuild --no-install --clean", {
    env: {
      ...process.env,
      CI: 1,
    },
  });

  // before we can run pod-lockfile on a podfile for an RN app
  // we need to mock out mac-specific calls for our linux CI environment
  const podfilePath = path.resolve("./ios", "Podfile");
  await mockXcodebuild({ debug: true, xcVersion: "15.4" });
  await disablePodfilePrepareHook({ debug: true, podfilePath });

  cp.execSync("../node_modules/.bin/pod-lockfile --debug --project ios", {
    stdio: "inherit",
  });
}

function assertPodfileLockExcludesModules() {
  const podfileLock = fs.readFileSync("ios/Podfile.lock", "utf-8");
  if (podfileLock.includes("Splash")) {
    throw new Error("Expected ios/Podfile.lock to exclude expo-splash-screen");
  }

  console.log("Test passed!");
}
