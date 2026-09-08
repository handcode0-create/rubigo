# Google Maps configuration

RUBIGO loads Google Maps only when `VITE_GOOGLE_MAPS_API_KEY` is present. Copy `.env.example` to `.env.local` and set the key locally.

Enable only these APIs in Google Cloud:

- Maps JavaScript API
- Places API
- Geocoding API
- Routes API

Restrict the browser key by HTTP referrer (local development and production domains) and by the APIs above. A browser key is visible to the client, so restrictions are required before deployment. Never commit `.env.local` or a real key.

Without a key, Explorer uses the RUBIGO fallback map centered on Adzopé. The catalog and coordinates remain owned by RUBIGO; Google is only used as a map, geocoding and route provider.
