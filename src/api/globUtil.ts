class SimpleGlob {
  private matchMethod: "includes" | "startsWith" | "endsWith" | undefined;
  private pattern;

  constructor(pattern: string) {
    const trimmed = pattern.trim();
    if (trimmed.startsWith("*")) {
      this.matchMethod = "endsWith";
    }
    if (this.matchMethod === "endsWith" && trimmed.endsWith("*")) {
      this.matchMethod = "includes";
    } else if (trimmed.endsWith("*")) {
      this.matchMethod = "startsWith";
    }

    this.pattern = trimmed.replace(/\*/g, "");
  }

  match(value: string) {
    if (this.matchMethod === "includes") {
      return value.includes(this.pattern);
    }
    if (this.matchMethod === "startsWith") {
      return value.startsWith(this.pattern);
    }
    if (this.matchMethod === "endsWith") {
      return value.endsWith(this.pattern);
    }
    return value === this.pattern;
  }
}

export const hasMatch = (value: string, patterns: string[]) => {
  return patterns.some((pattern) => new SimpleGlob(pattern).match(value));
};
