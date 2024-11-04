type OTAFilter = { branches: string[] };
type ModuleConfig = string | { branch: string };
export type FlagMap = Record<
  string,
  {
    value: boolean;
    meta: any;
    ota?: OTAFilter;
    modules?: ModuleConfig[];
  }
>;
export type FlagsConfig = {
  mergePath: string;
  flags: FlagMap;
};
