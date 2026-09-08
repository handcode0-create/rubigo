import { useEffect, useState } from "react";
import { loadGoogleMaps } from "../services/mapsService";

export function useGoogleMaps() {
  const [state, setState] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  useEffect(() => {
    let mounted = true;
    loadGoogleMaps().then((ready) => {
      if (mounted) setState(ready ? "ready" : "fallback");
    });
    return () => {
      mounted = false;
    };
  }, []);
  return {
    isReady: state === "ready",
    isLoading: state === "loading",
    hasError: state === "fallback",
  };
}
