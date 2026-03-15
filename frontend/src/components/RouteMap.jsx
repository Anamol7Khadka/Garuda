import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../context/LanguageContext'

export default function RouteMap({ providers = [], onProviderSelect, onLocationChange }) {
  const { t } = useLanguage()
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const customerMarkerRef = useRef(null)
  const [customerLocation, setCustomerLocation] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [loading, setLoading] = useState(true)

  // STEP 1 — Get location only, store in state
  useEffect(() => {
    if (!navigator.geolocation) {
      setCustomerLocation({ lat: 27.7172, lng: 85.3240 })
      setLocationError('Geolocation not supported — showing Kathmandu')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      () => {
        setCustomerLocation({ lat: 27.7172, lng: 85.3240 })
        setLocationError('Location denied — showing Kathmandu. Click map to change.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // STEP 2 — Init map only after BOTH location AND container are ready
  useEffect(() => {
    if (!customerLocation || !mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [customerLocation.lng, customerLocation.lat],
      zoom: 13,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      // Customer marker
      const customerEl = document.createElement('div')
      customerEl.innerHTML = `
        <div style="background:#3B82F6;width:40px;height:40px;border-radius:50%;
          border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;font-size:18px">
          📍
        </div>`
      const customerMarker = new maplibregl.Marker({ element: customerEl })
        .setLngLat([customerLocation.lng, customerLocation.lat])
        .setPopup(new maplibregl.Popup().setHTML(
          `<div style="font-family:Inter,sans-serif;padding:4px"><strong>📍 ${t('yourLocation')}</strong></div>`
        ))
        .addTo(map)
      customerMarkerRef.current = customerMarker

      // Provider markers
      providers.forEach((p) => {
        const provLat = p.latitude
        const provLng = p.longitude
        if (!provLat || !provLng) return

        const el = document.createElement('div')
        el.innerHTML = `
          <div style="background:${p.is_female ? '#7C3AED' : '#6366F1'};
            width:36px;height:36px;border-radius:50%;border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;
            justify-content:center;font-size:16px;cursor:pointer;transition:transform 0.2s"
            onmouseover="this.style.transform='scale(1.2)'"
            onmouseout="this.style.transform='scale(1)'">
            ${p.is_female ? '💜' : '👤'}
          </div>`

        new maplibregl.Marker({ element: el })
          .setLngLat([provLng, provLat])
          .setPopup(new maplibregl.Popup({ offset: 25, maxWidth: '200px' }).setHTML(`
            <div style="font-family:Inter,sans-serif;padding:8px">
              <strong>${p.name}</strong>
              ${p.is_female
                ? '<span style="color:#7C3AED;font-size:11px"> 💜 Women First</span>'
                : ''}
              <div style="font-size:12px;color:#6B7280;margin-top:2px">
                ⭐ ${p.provider?.rating?.toFixed(1) || 'New'} · ${p.city || 'Kathmandu'}
              </div>
              <div style="font-size:12px;color:#7C3AED;margin-top:2px">
                Rs. ${p.provider?.hourly_rate || '---'}/hr
              </div>
              <button
                onclick="window.dispatchEvent(new CustomEvent('routeToProvider',
                  {detail: '${p.id}'}))"
                style="margin-top:8px;width:100%;padding:6px;background:#7C3AED;
                  color:white;border:none;border-radius:6px;cursor:pointer;
                  font-size:12px;font-weight:600">
                🗺️ ${t('showRoute')}
              </button>
            </div>
          `))
          .addTo(map)
      })

      // Route layer
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
      })
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#7C3AED',
          'line-width': 6,
          'line-opacity': 1,
          'line-blur': 0
        }
      })

      // Click map to relocate customer pin
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat
        customerMarker.setLngLat([lng, lat])
        setCustomerLocation({ lat, lng })
        setLocationError(null)
        if (onLocationChange) onLocationChange({ lat, lng })
      })
    })

    mapRef.current = map

    // Route event listener
    const handleRoute = async (e) => {
      const providerId = parseInt(e.detail)
      const provider = providers.find(p => p.id === providerId)
      if (!provider) return
      if (onProviderSelect) onProviderSelect(provider)
      await drawRoute(map, customerLocation, provider)
    }
    window.addEventListener('routeToProvider', handleRoute)

    return () => {
      window.removeEventListener('routeToProvider', handleRoute)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [customerLocation, providers])

  const drawRoute = async (map, from, to) => {
    const toLat = to.latitude
    const toLng = to.longitude
    if (!toLat || !toLng) {
      alert('Provider location not available')
      return
    }

    // Show loading on route button
    setRouteInfo({ loading: true })

    try {
      // Try OSRM first
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${toLng},${toLat}?overview=full&geometries=geojson`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)
      const data = await res.json()

      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0]
        map.getSource('route').setData({
          type: 'Feature',
          geometry: route.geometry
        })
        const coords = route.geometry.coordinates
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new maplibregl.LngLatBounds(coords[0], coords[0])
        )
        map.fitBounds(bounds, { padding: 100 })
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
          provider: to.name,
          isStraightLine: false
        })
        return
      }
    } catch (err) {
      console.log('OSRM failed, using straight line:', err.message)
    }

    // ALWAYS fallback to straight line if OSRM fails
    const coords = [[from.lng, from.lat], [toLng, toLat]]
    map.getSource('route').setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: coords }
    })

    // Fit map to show both points
    const bounds = new maplibregl.LngLatBounds(
      [from.lng, from.lat],
      [toLng, toLat]
    )
    map.fitBounds(bounds, { padding: 100 })

    // Calculate straight-line distance
    const R = 6371
    const dLat = (toLat - from.lat) * Math.PI / 180
    const dLng = (toLng - from.lng) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 +
      Math.cos(from.lat*Math.PI/180) *
      Math.cos(toLat*Math.PI/180) *
      Math.sin(dLng/2)**2
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    setRouteInfo({
      distance: dist.toFixed(1),
      duration: Math.round(dist * 3),
      provider: to.name,
      isStraightLine: true
    })
  }

  if (loading) return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">🗺️</div>
        <p className="text-gray-500 text-sm">Getting your location...</p>
      </div>
    </div>
  )

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
      <div ref={mapContainer} className="w-full h-full" />

      {locationError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                        bg-yellow-50 border border-yellow-200 rounded-xl
                        px-4 py-2 text-xs text-yellow-700 shadow-md whitespace-nowrap">
          ⚠️ {locationError}
        </div>
      )}

      {routeInfo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10
                        bg-white rounded-2xl shadow-xl p-4 min-w-[260px]
                        border border-purple-100">
          <p className="font-bold text-sm text-purple-700 mb-3">
            🗺️ Route to {routeInfo.provider}
          </p>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-700">{routeInfo.distance}</div>
              <div className="text-xs text-gray-500">{t('kmAway')}</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{routeInfo.duration}</div>
              <div className="text-xs text-gray-500">{t('minDrive')}</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                ~{Math.round(routeInfo.distance * 12)}
              </div>
              <div className="text-xs text-gray-500">{t('minWalk')}</div>
            </div>
          </div>
          {routeInfo.isStraightLine && (
            <p className="text-xs text-gray-400 mt-2 text-center">* Straight-line estimate</p>
          )}
        </div>
      )}

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm
                      rounded-xl p-3 shadow-md text-xs space-y-1.5 z-10">
        <div className="flex items-center gap-2">
          <span>📍</span><span className="text-gray-600">{t('yourLocation')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💜</span><span className="text-gray-600">{t('womenFirst')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👤</span><span className="text-gray-600">Provider</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <div className="w-5 h-1 bg-purple-600 rounded" />
          <span className="text-gray-600">Route</span>
        </div>
        <p className="text-gray-400 pt-1 border-t border-gray-100">
          💡 Click map to move pin
        </p>
      </div>
    </div>
  )
}