# expo-build-flags

A module to make feature-flagging easier for expo projects.

_This module is in active development and is not stable or well documented yet._

## Getting Started

`yarn add expo-build-flags`

Add a flags file to the root of your repo in the form of [the test example](test/integration/default-flags.yml).

Run `yarn build-flags override +secretFeature -newFeature` sometime before your bundle server or build start to generate the runtime typescript module. This path is defined by `mergePath` and you should add it to your project gitignore.

The arguments after the override command are the flags you want to `+` enable or `-` disable. No comparison with the default value is done, so if it's already enabled and you `+enable` it, it's a no-op.

## Goals

- allow defining a base set of flags that are available at runtime in one place
- allow for overriding a flag's value locally during development (without having to change the default value committed to source control)
- allow for overriding a flag's value for any native build for one-off testing
- allow for referencing flag values in JS
- allow for referencing flag values from native code on iOS or Android
- allow for tree-shaking of the JS bundle and dead code path elimination
- allow for typescript to see the specific flags available
- allow for custom import paths in the JS bundle

## Rough Implementation Idea

_The following is a rough outline and does not represent the current state of the library_

A repo root-level `flags.ts` file defines the available set of flags with metadata for larger project teams to document what flags mean, who owns them, and other useful information.

```ts
// flags.ts

export default {
  SomeTeamSomeProjectFlag: {
    value: false,
    meta: {
      team: "Some Team",
      description: "It turns on the feature we are working on",
    },
  },
};
```

This file is committed to source control and holds the default values for the flags used for any build that does not override them. They represent the "public release" state of the flags.

At build time (either for the dev server or for a static app build), this file is read and merged with any overrides provided on the command-line using the `yarn build-flags` CLI. The merged values are available at runtime from a path defined in the babel plugin config which is not to be committed to source control. Natively, a module is generated from the same merged file for each platform and available as a runtime constant at build time.

When building statically for release, an expo config plugin ensures the default values are generated before the build begins, and the plugin can read from a special `EXPO_BUILD_FLAGS` env var defined in eas.json to merge in overrides if needed.
