export type FundCardProps = {
  // main app page card props
  title: string;
  uId: string;
  token: string;
  status: 'live' | 'funding' | 'trading' | 'soon';
  imgSrc: string;
};

export type FundDetailsProps = {
  // fund dashboard info card props
  icon: string;
  shortname: string;
  longname: string;
  description: string;
  holdings: number;
  modeAddress: string;
};

export type UpcomingFundDetailsProps = {
  longname: string;
  shortname: string;
  twitterUsername: string;
  twitterLink: string;
  telegramUsername: string;
  telegramLink: string;
  website: string;
  description: string;
  aboutToken: string;
  fundingProgress: number;
  logo: string;
};

export interface InfoRowProps {
  label: string;
  value: string;
  mode?: boolean;
}

export interface OrderbookProps {
  name: string;
  created: string;
  owner: string;
  token: string;
  tradingEnds: string;
  ethRaised: string;
}

export interface leaderboardData {
  id: number;
  icon: string;
  name: string;
  creator: string;
  price: number;
  dayVol: number;
  marketCap: number;
}

export type dashboardData = {
  address: string;
};

export type Asset = {
  token: string;
  // tokenIcon?: string
  balance: number;
  price: number;
  totalValue: number;
};
