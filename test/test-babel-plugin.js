const fs = require("fs");
const cp = require("child_process");

installBabelPlugin();
generateBuildFlagsModule();
addBuildFlag();
bundleApp();
assertBuildFlagInBundle();
disableFeatureFlag();
bundleApp();
assertBuildFlagShakenFromBundle();

function installBabelPlugin() {
  const babelConfig = fs.readFileSync("babel.config.js", "utf8");
  const searchStr = "return {";
  const replaceStr =
    'return {\n  plugins: [\n    ["expo-build-flags/babel-plugin", {\n      "flagsModule": "./constants/buildFlags.ts"\n    }]\n  ],\n';
  const newBabelConfig = babelConfig.replace(searchStr, replaceStr);
  fs.writeFileSync("babel.config.js", newBabelConfig);
}

function generateBuildFlagsModule() {
  cp.execSync("./node_modules/.bin/build-flags override");
}

function addBuildFlag() {
  const homeTab = fs.readFileSync("app/(tabs)/index.tsx", "utf8");
  const searchStr = "export default function HomeScreen() {";
  let replaceStr = "import { BuildFlags } from '../../constants/buildFlags'";
  replaceStr += "\n\n";
  replaceStr +=
    "if (BuildFlags.newFeature) { console.log('New feature enabled!') }";
  replaceStr += "\n\n";
  replaceStr += "export default function HomeScreen() {";
  const newHomeTab = homeTab.replace(searchStr, replaceStr);
  fs.writeFileSync("app/(tabs)/index.tsx", newHomeTab);
}

function bundleApp() {
  cp.execSync("CI=1 npx expo export --no-bytecode --no-minify --clear", {
    stdio: "inherit",
  });
}

function assertBuildFlagInBundle() {
  const outputPath = "dist/_expo/static/js/ios";
  const bundleFile = fs
    .readdirSync(outputPath)
    .find((file) => file.startsWith("entry-"));
  const bundle = fs.readFileSync(`${outputPath}/${bundleFile}`, "utf8");
  if (!bundle.includes("New feature enabled!")) {
    throw new Error("Assertion failed: Build flag not found in bundle");
  }

  console.log("Assertion passed: Build flag found in bundle");
}

function disableFeatureFlag() {
  cp.execSync("./node_modules/.bin/build-flags override -newFeature");
}

function assertBuildFlagShakenFromBundle() {
  const outputPath = "dist/_expo/static/js/ios";
  const bundleFile = fs
    .readdirSync(outputPath)
    .find((file) => file.startsWith("entry-"));
  const bundle = fs.readFileSync(`${outputPath}/${bundleFile}`, "utf8");
  if (bundle.includes("New feature enabled!")) {
    throw new Error("Assertion failed: Build flag found in bundle");
  }

  console.log("Assertion passed: Build flag not found in bundle");
}
