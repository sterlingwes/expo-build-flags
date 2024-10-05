const knownBranchNameVars = [
  "CI_COMMIT_REF_NAME", // gitlab (can include tags)
  "GITHUB_HEAD_REF", // github
];

export const getCIBranch = () => {
  const branchName = knownBranchNameVars.find((envVar) => process.env[envVar]);
  return branchName ? process.env[branchName] : undefined;
};
