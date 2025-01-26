import { useCallback, useEffect, useRef } from "react";

/**
 * useDebounce Hook
 *
 * Debounces a function call to ensure it executes only after the specified delay.
 * Ensures the function is called even if the component unmounts.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 */
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedCallback = useRef(callback);

  // Keep the latest version of the callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        savedCallback.current(...args);
      }, delay);
    },
    [delay]
  );

  // Ensure the callback runs on unmount if debounced
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        savedCallback.current(); // Call the function immediately on unmount
      }
    };
  }, []);

  return debouncedCallback;
};

export default useDebounce;
