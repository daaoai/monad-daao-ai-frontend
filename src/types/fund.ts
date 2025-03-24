export type Fund = {
  id: string;
  title: string;
  token?: string;
  status: 'live' | 'funding' | 'trading' | 'soon';
  imgSrc: string;
};
