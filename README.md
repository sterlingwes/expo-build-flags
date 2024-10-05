# expo-build-flags

A module to make feature-flagging easier for expo projects.

_This module is in active development and is not stable or well documented yet._

## Getting Started

`yarn add expo-build-flags`

Add a flags file to the root of your repo in the form of [the test example](test/integration/default-flags.yml), or run `yarn build-flags init`.

Run `yarn build-flags override +secretFeature -newFeature` sometime before your bundle server or build start to generate the runtime typescript module. This path is defined by `mergePath` and you should add it to your project gitignore.

The arguments after the override command are the flags you want to `+` enable or `-` disable. No comparison with the default value is done, so if it's already enabled and you `+enable` it, it's a no-op.

You can run `yarn build-flags ota-override` instead of "override" to do the same but also consider the branch name in two supported CI environments: Github and Gitlab. Use the `ota.branches` array in the flags.yml to setup that matching and branch-based enablement.

### Set Flags in CI & for Static Builds

To set flags for EAS builds, set the `EXPO_BUILD_FLAGS` environment variable in `eas.json` for your profile. This value will be available to the config plugin at build time in EAS when you add it to your `app.json` plugins array:

```diff
{
  "expo": {
+    "plugins": ["expo-build-flags"]
  }
}
```

Using the `EXPO_BUILD_FLAGS` environment variable, the config plugin will:

- add a `<meta-data android:name="EXBuildFlags" />` tag to your AndroidManifest.xml
- add a `EXBuildFlags` array to your Info.plist
- generate the runtime build flags module for your javascript bundle

The variable value is a comma-separated list of flag names you want to enable, ie: `EXPO_BUILD_FLAGS=newFeature,secretFeature`.

### Enable Tree Shaking

To benefit from tree shaking, add the babel plugin to your project's babel config:

```diff
{
  presets: ["babel-preset-expo"],
  plugins: [
+    ["expo-build-flags/babel-plugin", { flagsModule: "./constants/buildFlags.ts" }],
  ],
}
```

The `flagsModule` path must match the runtime `mergePath` in your committed flags.yml file. This plugin replaces the `BuildFlags` imports with the literal boolean values which allows the build pipeline to strip unreachable paths.

## Goals

- [x] allow defining a base set of flags that are available at runtime in one place
- [x] allow for overriding a flag's value locally during development (without having to change the default value committed to source control)
- [x] allow for running OTA updates with the flag on for specific CI branches
- [x] allow for overriding a flag's value for any native build for one-off testing
- [x] allow for referencing flag values in JS
- [ ] allow for referencing flag values from native code on iOS or Android
- [x] allow for tree-shaking of the JS bundle and dead code path elimination
- [x] allow for typescript to see the specific flags available
