/**
 * Dappier Integration Hook
 * React hook for using Dappier real-time data in components
 */

import { useState, useCallback } from "react";
import {
  dappierService,
  DappierRealTimeData,
} from "../services/dappierService";

export function useDappier() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DappierRealTimeData | null>(null);

  const searchRealTime = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dappierService.getRealTimeData(query);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch real-time data";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMarketData = useCallback(async (location: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dappierService.getMarketData(location);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch market data");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch market data";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getForeclosureData = useCallback(async (location: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dappierService.getForeclosureData(location);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch foreclosure data");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch foreclosure data";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMortgageRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dappierService.getMortgageRates();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch mortgage rates");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch mortgage rates";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    data,
    searchRealTime,
    getMarketData,
    getForeclosureData,
    getMortgageRates,
    isConfigured: dappierService.isConfigured(),
  };
}
