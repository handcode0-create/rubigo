import { useState } from "react";
import { geocodeAddress } from "../services/geocodingService";
import type { Location } from "../types";
export function useGeocoding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geocode = async (address: string): Promise<Location | null> => {
    setIsLoading(true);
    setError(null);
    const result = await geocodeAddress(address);
    if (!result) setError("Adresse introuvable.");
    setIsLoading(false);
    return result;
  };
  return { geocode, isLoading, error };
}
