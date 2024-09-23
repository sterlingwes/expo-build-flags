export type FlagMap = Record<string, { value: boolean; meta: any }>;
export type FlagsConfig = {
  mergePath: string;
  flags: FlagMap;
};
