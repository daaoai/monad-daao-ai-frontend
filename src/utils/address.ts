export function shortenAddress(address: string) {
  console.log('Address is ', address);
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
