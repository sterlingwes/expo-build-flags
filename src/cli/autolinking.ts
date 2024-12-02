const commandArgs = process.argv.slice(2);

const expoAutolinking = require("expo-modules-autolinking");

const logMethod = console.log;
const logCallArgs: any[] = [];
console.log = (...args) => {
  logCallArgs.push(args);
};

const findConfigFromArgs = (args: string[][]) => {
  const match = args.find(
    (arg) =>
      Array.isArray(arg) &&
      typeof arg[0] === "string" &&
      arg[0][0] === "{" &&
      arg[0][arg[0].length - 1] === "}"
  );
  if (!match) {
    throw new Error(
      "expo-build-flags autolinking CLI: No match for expected react-native-config object in stdout"
    );
  }

  try {
    return JSON.parse(match[0]);
  } catch (e: any) {
    throw new Error(
      `expo-build-flags autolinking CLI: Failed to parse react-native-config JSON from stdout: ${e.message}`
    );
  }
};

type ConfigOutput = {
  root: string;
  reactNativePath: string;
  project: {
    ios?: { sourceDir: string };
    android?: { sourceDir: string };
  };
  dependencies: Record<string, { name: string; root: string; platforms: any }>;
};

const getPlatform = () => {
  const platformIndex = commandArgs.indexOf("-p");
  if (platformIndex === -1) {
    throw new Error(
      "expo-build-flags autolinking CLI: No platform (-p) argument provided"
    );
  }

  const platform = commandArgs[platformIndex + 1];
  if (platform !== "ios" && platform !== "android") {
    throw new Error(
      `expo-build-flags autolinking CLI: Invalid platform provided "${platform}"`
    );
  }

  return platform;
};

const getExclusions = () => {
  return commandArgs.reduce((acc, arg, idx) => {
    const next = commandArgs[idx + 1];
    if (arg === "-x" && typeof next === "string") {
      return acc.concat(next);
    }
    return acc;
  }, [] as string[]);
};

const processConfig = (config: ConfigOutput) => {
  const excludedDependencies = getExclusions();
  const updatedConfig = {
    ...config,
    dependencies: Object.fromEntries(
      Object.entries(config.dependencies).filter(([key]) => {
        return !excludedDependencies.includes(key);
      })
    ),
  };

  return JSON.stringify(updatedConfig);
};

expoAutolinking([
  "react-native-config",
  "--json",
  "--platform",
  getPlatform(),
]).then(() => {
  console.log = logMethod;
  console.log(processConfig(findConfigFromArgs(logCallArgs)));
});
