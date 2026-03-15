import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RouteMap from '../components/RouteMap'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function FindNearby() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [radius, setRadius] = useState(5)
  const [femaleOnly, setFemaleOnly] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirectTo=/find-nearby')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        fetchNearby(loc)
      },
      () => {
        const fallback = { lat: 27.7172, lng: 85.3240 }
        setUserLocation(fallback)
        fetchNearby(fallback)
      }
    )
  }, [femaleOnly, radius])

  const fetchNearby = async (loc) => {
    try {
      setLoading(true)
      const res = await client.get('/api/providers/nearby', {
        params: {
          lat: loc.lat,
          lng: loc.lng,
          radius: radius,
          female_only: femaleOnly,
          limit: 20
        }
      })
      const data = res.data?.data?.providers || res.data?.data || res.data || []
      setProviders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load nearby providers:', err)
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center 
                        justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              🗺️ Providers Near You
            </h1>
            <p className="text-sm text-gray-500">
              Click any provider to see the route
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Radius selector */}
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value={2}>Within 2 km</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={20}>Within 20 km</option>
            </select>

            {/* Women First toggle */}
            <button
              onClick={() => setFemaleOnly(!femaleOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                         text-sm font-semibold transition-all ${
                femaleOnly
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white border border-purple-200 text-purple-700'
              }`}
            >
              💜 Women First {femaleOnly ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">

          {/* Map - takes most space */}
          <div className="flex-1 min-h-96">
            <RouteMap
              providers={providers}
              onProviderSelect={setSelectedProvider}
              onLocationChange={(loc) => {
                setUserLocation(loc)
                fetchNearby(loc)
              }}
            />
          </div>

          {/* Provider list sidebar */}
          <div className="lg:w-80 overflow-y-auto space-y-3">
            <p className="text-sm text-gray-500 font-medium">
              {loading ? '🔄 Loading...' : `${providers.length} providers found`}
            </p>
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => setSelectedProvider(provider)}
                className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer 
                           border-2 transition-all hover:shadow-md ${
                  selectedProvider?.id === provider.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 
                                  flex items-center justify-center text-lg flex-shrink-0">
                    {provider.is_female ? '💜' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm truncate">
                        {provider.name}
                      </span>
                      {provider.is_female && (
                        <span className="text-xs bg-purple-100 text-purple-700 
                                        px-1.5 py-0.5 rounded-full font-medium">
                          Women First
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      ⭐ {provider.provider?.rating?.toFixed(1) || 'New'} 
                      · {provider.city}
                    </div>
                    <div className="text-xs text-purple-600 font-medium mt-1">
                      Rs. {provider.provider?.hourly_rate || '---'}/hr
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/booking?provider_id=${provider.id}`)
                    }}
                    className="flex-1 bg-purple-600 text-white text-xs 
                               font-semibold py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/providers/${provider.id}`)
                    }}
                    className="flex-1 border border-gray-200 text-gray-600 
                               text-xs font-semibold py-2 rounded-lg 
                               hover:bg-gray-50 transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}

            {!loading && providers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm">No providers found nearby</p>
                <p className="text-xs mt-1">Try increasing the search radius</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
