export const commaSeparator = (value: number | string): string => {
  const array = value.toString().split('.');
  const stringWithComma = array[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return array[1] ? `${stringWithComma}.${array[1]}` : stringWithComma;
};
