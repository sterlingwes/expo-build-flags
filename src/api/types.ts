type OTAFilter = { branches: string[] };
export type FlagMap = Record<
  string,
  { value: boolean; meta: any; ota?: OTAFilter }
>;
export type FlagsConfig = {
  mergePath: string;
  flags: FlagMap;
};
