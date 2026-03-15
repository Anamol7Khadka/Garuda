import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, Clock, TrendingUp } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import ProviderCard from '../components/ProviderCard'
import Loading from '../components/Loading'

export default function CategoryPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  
  const [category, setCategory] = useState(null)
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    women_first: false,
    min_rating: 0,
    city: '',
    sort_by: 'rating'
  })
  const [cities, setCities] = useState([])

  useEffect(() => {
    loadCategoryData()
  }, [categoryId, filters])

  const loadCategoryData = async () => {
    try {
      setLoading(true)
      
      // Load providers for this category
      const response = await api.get('/api/providers', {
        params: {
          category: categoryId,
          women_first: filters.women_first,
          min_rating: filters.min_rating,
          city: filters.city,
          per_page: 50
        }
      })
      
      const providerData = response.data?.data?.providers || response.data?.providers || []
      setProviders(Array.isArray(providerData) ? providerData : [])
      
      // Extract unique cities
      const uniqueCities = [...new Set(providerData.map(p => p.user?.city || p.city).filter(Boolean))]
      setCities(uniqueCities)
      
      // Load category info
      const categoryResponse = await api.get('/api/services/categories')
      const categoryData = categoryResponse.data?.categories?.find(
        c => c.id === parseInt(categoryId) || c.name.toLowerCase() === categoryId.toLowerCase()
      )
      setCategory(categoryData)
    } catch (error) {
      console.error('Failed to load category data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWomenFirst = () => {
    setFilters(prev => ({ ...prev, women_first: !prev.women_first, page: 1 }))
  }

  const handleProviderClick = (providerId) => {
    navigate(`/provider/${providerId}`)
  }

  const handleBooking = (providerId) => {
    navigate('/booking-flow', { state: { providerId } })
  }

  const sortedProviders = [...providers].sort((a, b) => {
    switch (filters.sort_by) {
      case 'rating':
        return (b.provider?.rating || 0) - (a.provider?.rating || 0)
      case 'experience':
        return (b.provider?.years_experience || 0) - (a.provider?.years_experience || 0)
      case 'price_low':
        return (a.provider?.hourly_rate || 0) - (b.provider?.hourly_rate || 0)
      case 'price_high':
        return (b.provider?.hourly_rate || 0) - (a.provider?.hourly_rate || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/services')}
              className="text-white font-semibold hover:underline flex items-center gap-1"
            >
              ← Back to Services
            </button>
          </div>
          
          <h1 className="text-white text-4xl md:text-5xl font-black mb-3">
            {category?.name || categoryId}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl">
            {category?.description || `Find qualified professionals for ${categoryId} services`}
          </p>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            <div>
              <p className="text-3xl font-bold">{providers.length}</p>
              <p className="text-white/80 text-sm">Available Providers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {providers.length > 0 ? (providers.reduce((sum, p) => sum + (p.provider?.rating || 0), 0) / providers.length).toFixed(1) : '0'}
              </p>
              <p className="text-white/80 text-sm">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {providers.filter(p => p.user?.is_female).length}
              </p>
              <p className="text-white/80 text-sm">Women-Led</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {Math.min(...providers.map(p => p.provider?.hourly_rate || 0)) || 'N/A'}
              </p>
              <p className="text-white/80 text-sm">Starting Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-lg font-bold mb-6 text-purple-600">Filters</h3>

              {/* Women First Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.women_first}
                    onChange={toggleWomenFirst}
                    className="w-5 h-5 accent-purple-600 rounded"
                  />
                  <span className="font-semibold text-purple-600">Women-Led Only</span>
                </label>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-3 text-gray-700">{t('city')}</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value, page: 1 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Minimum Rating Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-3 text-gray-700">Minimum Rating</label>
                <select
                  value={filters.min_rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_rating: e.target.value, page: 1 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="0">All Ratings</option>
                  <option value="3">3+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-3 text-gray-700">Sort By</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="experience">Most Experience</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => setFilters({
                  women_first: false,
                  min_rating: 0,
                  city: '',
                  sort_by: 'rating'
                })}
                className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="lg:col-span-3">
            {sortedProviders && sortedProviders.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-6">
                  Showing {sortedProviders.length} provider{sortedProviders.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id || provider.user_id}
                      provider={provider.provider || provider}
                      user={provider}
                      onBook={() => handleBooking(provider.id || provider.user_id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg mb-4">
                  No providers found for your criteria
                </p>
                <button
                  onClick={() => setFilters({
                    women_first: false,
                    min_rating: 0,
                    city: '',
                    sort_by: 'rating'
                  })}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
