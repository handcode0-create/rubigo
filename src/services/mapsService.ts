let loadingPromise: Promise<boolean> | null = null

export function hasGoogleMapsKey() { return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY) }
export function loadGoogleMaps() {
  if (!hasGoogleMapsKey()) return Promise.resolve(false)
  if (loadingPromise) return loadingPromise
  loadingPromise = new Promise((resolve) => {
    if (window.google?.maps) { resolve(true); return }
    let authFailed = false
    window.gm_authFailure = () => { authFailed = true; resolve(false) }
    const script = document.createElement('script')
    script.id = 'rubigo-google-maps'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => window.setTimeout(() => { if (!authFailed) resolve(true) }, 600)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
  return loadingPromise
}