import {Address} from '../services/interfaces/address';

export const formatAddress = (address?: Address | null): string => {
  if (!address) {
    return '';
  }

  const {city, province, region, country, postalCode} = address;

  // Filter out any undefined or empty values and join with a comma
  return [city, province, region, country, postalCode]
    .filter(Boolean) // This removes falsy values (undefined, null, or empty strings)
    .join(', ');
};
