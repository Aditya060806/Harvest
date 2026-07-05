import { useState, useEffect } from 'react';
import { scan } from '@harvest/core';

export function useHarvest(target, options) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!target) {
      return;
    }

    const performScan = async () => {
      setLoading(true);
      try {
        const scanResult = await scan(target, options);
        setResult(scanResult);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    performScan();
  }, [target, options]);

  return { result, error, loading };
}
