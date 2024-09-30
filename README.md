# expo-build-flags

A module to make feature-flagging easier for expo projects.

_This module is in active development and is not stable or well documented yet._

## Getting Started

`yarn add expo-build-flags`

Add a flags file to the root of your repo in the form of [the test example](test/integration/default-flags.yml), or run `yarn build-flags init`.

Run `yarn build-flags override +secretFeature -newFeature` sometime before your bundle server or build start to generate the runtime typescript module. This path is defined by `mergePath` and you should add it to your project gitignore.

The arguments after the override command are the flags you want to `+` enable or `-` disable. No comparison with the default value is done, so if it's already enabled and you `+enable` it, it's a no-op.

To benefit from tree-shaking, add the babel plugin to your project's babel config:

```diff
{
  presets: ["babel-preset-expo"],
  plugins: [
+    ["expo-build-flags/babel-plugin", { flagsModule: "./constants/buildFlags.ts" }],
  ],
}
```

The `flagsModule` path must match the runtime `mergePath` in your committed flags.yml file.

## Goals

- [x] allow defining a base set of flags that are available at runtime in one place
- [x] allow for overriding a flag's value locally during development (without having to change the default value committed to source control)
- [ ] allow for running OTA updates with the flag on for specific CI branches
- [ ] allow for overriding a flag's value for any native build for one-off testing
- [x] allow for referencing flag values in JS
- [ ] allow for referencing flag values from native code on iOS or Android
- [x] allow for tree-shaking of the JS bundle and dead code path elimination
- [x] allow for typescript to see the specific flags available
