export type UserContributionInfo = {
  whitelistInfo: {
    isWhitelisted: boolean;
    tier: number;
    limit: number;
  };
  contributions: number;
};
