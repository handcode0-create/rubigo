declare global {
  interface Window {
    gm_authFailure?: () => void;
    google: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: { center: { lat: number; lng: number }; zoom: number },
        ) => { setCenter: (center: { lat: number; lng: number }) => void };
        Marker: new (options: {
          map: unknown;
          position: { lat: number; lng: number };
          title?: string;
          label?: string;
        }) => {
          addListener: (event: string, handler: () => void) => void;
          setMap: (map: unknown) => void;
        };
        Geocoder: new () => {
          geocode: (
            request: {
              address?: string;
              location?: { lat: number; lng: number };
            },
            callback: (
              results: Array<{
                formatted_address: string;
                place_id: string;
                geometry: {
                  location: { lat: () => number; lng: () => number };
                };
              }> | null,
              status: string,
            ) => void,
          ) => void;
        };
        DirectionsService: new () => {
          route: (
            request: {
              origin: { lat: number; lng: number };
              destination: { lat: number; lng: number };
              travelMode: string;
            },
            callback: (
              result: {
                routes?: Array<{
                  legs?: Array<{
                    distance?: { value: number };
                    duration?: { value: number };
                  }>;
                  overview_polyline?: string;
                }>;
              } | null,
              status: string,
            ) => void,
          ) => void;
        };
        TravelMode: { DRIVING: string };
      };
    };
  }
}
export {};
