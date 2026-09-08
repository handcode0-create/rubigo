import { useCallback, useEffect, useState } from "react";
import type { Location } from "../types";

type LocationState = {
  status: "loading" | "success" | "denied" | "error" | "unsupported";
  location: Location | null;
};
export function useUserLocation() {
  const [state, setState] = useState<LocationState>({
    status: "loading",
    location: null,
  });
  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "unsupported", location: null });
      return;
    }
    setState((current) => ({ ...current, status: "loading" }));
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setState({
          status: "success",
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }),
      (error) =>
        setState({
          status: error.code === error.PERMISSION_DENIED ? "denied" : "error",
          location: null,
        }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, []);
  useEffect(() => locate(), [locate]);
  return { ...state, locate };
}
