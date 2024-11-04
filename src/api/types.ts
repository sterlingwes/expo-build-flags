type OTAFilter = { branches: string[] };
type NativeModuleConfig = string | { branch: string };
export type FlagMap = Record<
  string,
  {
    value: boolean;
    meta: any;
    ota?: OTAFilter;
    nativeModules?: NativeModuleConfig[];
  }
>;
export type FlagsConfig = {
  mergePath: string;
  flags: FlagMap;
};
