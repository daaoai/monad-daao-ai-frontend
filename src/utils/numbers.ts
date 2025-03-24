const lookup = [
  { value: 1, symbol: '' },
  { value: 1e3, symbol: 'K' },
  { value: 1e6, symbol: 'M' },
  { value: 1e9, symbol: 'B' },
  { value: 1e12, symbol: 'T' },
  { value: 1e15, symbol: 'P' },
  { value: 1e18, symbol: 'E' },
];
const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

export const abbreviateNumber = (num: number, digits = 2) => {
  const reversedLookup = [...lookup].reverse();
  const item = reversedLookup.find((data) => num >= data.value);
  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : Number(num).toFixed(digits);
};

export const formatNumber = (num: number, decimals = 1) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';

  const absNum = Math.abs(num);
  if (absNum === 0) return '0';

  const suffixes = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
  const tier = Math.floor(Math.log10(absNum) / 3);

  // Handle numbers smaller than 1000
  if (tier < 0) return num.toFixed(decimals);

  const suffix = suffixes[tier] || '';
  const scaled = num / Math.pow(10, tier * 3);

  return scaled.toFixed(decimals).replace(/\.0+$/, '') + suffix;
};
