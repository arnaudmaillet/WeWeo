import { useCallback } from 'react';

const useNumberFormatter = () => {
  const formatNumber = useCallback((num: number) => {
    if (num < 1000) return num.toString();

    const suffixes = ['k', 'M', 'B', 'T'];
    const exponent = Math.floor(Math.log10(num) / 3);
    const shortNumber = num / Math.pow(1000, exponent);

    // Truncate to 3 characters max
    const formattedNumber =
      shortNumber >= 10 ? Math.floor(shortNumber) : shortNumber.toFixed(1);

    return `${formattedNumber}${suffixes[exponent - 1]}`;
  }, []);

  return { formatNumber };
};

export default useNumberFormatter;
