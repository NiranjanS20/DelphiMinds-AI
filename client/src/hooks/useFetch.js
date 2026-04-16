import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

/**
 * Reusable hook for API data fetching with loading/error states.
 *
 * @param {string} url - API endpoint URL
 * @param {object} options - { immediate, method, body }
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetch(url, options = {}) {
  const { immediate = true, method = 'GET', body = null } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (overrideBody) => {
    setLoading(true);
    setError(null);
    try {
      const config = { method, url };
      if (overrideBody || body) {
        config.data = overrideBody || body;
      }
      const response = await apiClient(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method, body]);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [immediate, url, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
