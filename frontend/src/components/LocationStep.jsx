import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const LocationStep = ({ onLocationSelect }) => {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState(null)
  const [detecting, setDetecting] = useState(true)

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      )
      const data = await res.json()
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(loc)
        const addr = await reverseGeocode(loc.lat, loc.lng)
        setAddress(addr)
        setDetecting(false)
        onLocationSelect({ ...loc, address: addr })
        initMap(loc)
      },
      () => {
        const fallback = { lat: 27.7172, lng: 85.3240 }
        setCoords(fallback)
        setAddress('Kathmandu, Nepal')
        setDetecting(false)
        initMap(fallback)
      }
    )
  }, [])

  const initMap = (loc) => {
    if (!mapContainer.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [loc.lng, loc.lat],
      zoom: 14
    })
    map.on('load', () => {
      const marker = new maplibregl.Marker({ draggable: true, color: '#7C3AED' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map)
      markerRef.current = marker

      marker.on('dragend', async () => {
        const { lng, lat } = marker.getLngLat()
        const addr = await reverseGeocode(lat, lng)
        setAddress(addr)
        setCoords({ lat, lng })
        onLocationSelect({ lat, lng, address: addr })
      })

      map.on('click', async (e) => {
        const { lng, lat } = e.lngLat
        marker.setLngLat([lng, lat])
        const addr = await reverseGeocode(lat, lng)
        setAddress(addr)
        setCoords({ lat, lng })
        onLocationSelect({ lat, lng, address: addr })
      })
    })
    mapRef.current = map
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-300/20 
                      px-4 py-2 rounded-lg">
        <span>📍</span>
        <span>{detecting ? 'Detecting your location...' : 'Click map or drag pin to change location'}</span>
      </div>
      
      {/* Map */}
      <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Address display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📍 Selected Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            onLocationSelect({ ...coords, address: e.target.value })
          }}
          placeholder="Your address..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <p className="text-xs text-gray-400 mt-1">
          You can also type your address manually
        </p>
      </div>
    </div>
  )
}

export default LocationStep
