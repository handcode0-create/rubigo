import { useEffect, useMemo, useRef, useState } from 'react'
import { useGoogleMaps } from '../../hooks/useGoogleMaps'
import { useUserLocation } from '../../hooks/useUserLocation'
import type { Location, Merchant } from '../../types'
import './MerchantMap.css'
import './MapInteraction.css'

const ADZOPE_CENTER: Location = { latitude: 6.106, longitude: -3.861, address: 'Adzopé, Côte d’Ivoire' }
type MerchantMapProps = { merchants: Merchant[]; selectedId?: string; onSelect: (merchant: Merchant) => void }

export function MerchantMap({ merchants, selectedId, onSelect }: MerchantMapProps) {
  const mapElement = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<{ setCenter: (center: { lat: number; lng: number }) => void } | null>(null)
  const { isReady, isLoading, hasError } = useGoogleMaps()
  const userLocation = useUserLocation()
  const [mapCenter, setMapCenter] = useState<Location>(ADZOPE_CENTER)
  const [mapFailed, setMapFailed] = useState(false)
  const locatedCenter = userLocation.location ?? ADZOPE_CENTER
  const positionedMerchants = useMemo(() => merchants.filter((merchant) => merchant.location), [merchants])

  useEffect(() => { if (userLocation.location) { setMapCenter(userLocation.location); mapInstance.current?.setCenter({ lat: userLocation.location.latitude, lng: userLocation.location.longitude }) } }, [userLocation.location])
  useEffect(() => { if (!isReady || !mapElement.current || !window.google?.maps) return; const map = new window.google.maps.Map(mapElement.current, { center: { lat: mapCenter.latitude, lng: mapCenter.longitude }, zoom: 14 }); mapInstance.current = map; positionedMerchants.forEach((merchant) => { if (!merchant.location) return; const marker = new window.google.maps.Marker({ map, position: { lat: merchant.location.latitude, lng: merchant.location.longitude }, title: merchant.name, label: merchant.initials }); marker.addListener('click', () => onSelect(merchant)) }); const watchdog = window.setTimeout(() => { if (mapElement.current?.innerText.includes('Oops! Something went wrong')) setMapFailed(true) }, 1800); return () => { window.clearTimeout(watchdog); mapInstance.current = null } }, [isReady, mapCenter.latitude, mapCenter.longitude, onSelect, positionedMerchants])
  const markerPosition = (merchant: Merchant, index: number) => { const lat = merchant.location?.latitude ?? ADZOPE_CENTER.latitude; const lng = merchant.location?.longitude ?? ADZOPE_CENTER.longitude; const left = Math.max(8, Math.min(92, 50 + (lng - ADZOPE_CENTER.longitude) * 2500 + index * 5)); const top = Math.max(12, Math.min(88, 50 - (lat - ADZOPE_CENTER.latitude) * 2500 + (index % 2) * 7)); return { left: `${left}%`, top: `${top}%` } }
  const recenter = () => { userLocation.locate(); setMapCenter(locatedCenter) }
  const useGoogleCanvas = isReady && !mapFailed
  return <section className="merchant-map" aria-label="Carte des commerces RUBIGO"><div className="map-toolbar"><span>{useGoogleCanvas ? 'Google Maps' : 'Carte RUBIGO · Adzopé'}</span><button onClick={recenter} disabled={userLocation.status === 'loading'}>⌖ {userLocation.status === 'loading' ? 'Localisation...' : 'Ma position'}</button></div>{isLoading ? <div className="map-placeholder"><span className="map-loader" />Chargement de la carte...</div> : useGoogleCanvas ? <div className="google-map-canvas" ref={mapElement} /> : <div className="fallback-map"><div className="fallback-grid" />{positionedMerchants.map((merchant, index) => <button key={merchant.id} className={selectedId === merchant.id ? 'map-marker selected' : 'map-marker'} style={markerPosition(merchant, index)} onClick={() => onSelect(merchant)} aria-label={`Voir ${merchant.name}`}>{merchant.initials}</button>)}<div className="user-marker" style={{ left: '50%', top: '50%' }}>⌖</div><div className="map-fallback-note">{hasError || mapFailed ? 'Carte Google indisponible' : 'Configurez Google Maps pour une carte interactive'}<small>Les commerces restent visibles autour d’Adzopé.</small></div></div>}{userLocation.status === 'denied' || userLocation.status === 'error' ? <p className="map-message">Nous ne pouvons pas accéder à votre position. Saisissez votre adresse depuis le profil.</p> : null}</section>
}