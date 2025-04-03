export type UserContributionInfo = {
  whitelistInfo: {
    isWhitelisted: boolean;
    tier: number;
    limit: bigint;
  };
  contributions: bigint;
};
