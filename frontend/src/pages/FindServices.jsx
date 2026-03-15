import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import ProviderCard from '../components/ProviderCard'
import Loading from '../components/Loading'

export default function FindServices() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  
  const [step, setStep] = useState(1)  // Step 1: Category selection, Step 2: Provider selection
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [providers, setProviders] = useState([])
  const [filteredProviders, setFilteredProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    women_first: false,
    min_rating: 0,
    city: '',
  })
  const [cities, setCities] = useState([])

  // Step 1: Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  // Step 2: Load and filter providers when category changes or filters change
  useEffect(() => {
    if (selectedCategory && step === 2) {
      loadProviders()
    }
  }, [selectedCategory, filters, searchQuery, step])

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/services/categories')
      const data = response.data?.data || response.data?.categories || []
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadProviders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/providers', {
        params: {
          category_id: selectedCategory.id,
          women_first: filters.women_first,
          min_rating: filters.min_rating,
          city: filters.city || '',
          per_page: 50
        }
      })
      
      const data = response.data?.data?.providers || response.data?.providers || []
      const providerList = Array.isArray(data) ? data : []
      setProviders(providerList)
      
      // Extract unique cities
      const uniqueCities = [...new Set(providerList.map(p => p.user?.city || p.city).filter(Boolean))]
      setCities(uniqueCities)
      
      // Apply search query filter
      if (searchQuery.trim()) {
        const filtered = providerList.filter(p => {
          const name = (p.user?.name || p.name || '').toLowerCase()
          const skills = (p.provider?.skills || []).join(' ').toLowerCase()
          return name.includes(searchQuery.toLowerCase()) || skills.includes(searchQuery.toLowerCase())
        })
        setFilteredProviders(filtered)
      } else {
        setFilteredProviders(providerList)
      }
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSearchQuery('')
    setFilters({ women_first: false, min_rating: 0, city: '' })
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setSelectedCategory(null)
    setSearchQuery('')
  }

  const handleBooking = (providerId) => {
    navigate('/booking-flow', { state: { providerId } })
  }

  // STEP 1: Category Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 via-purple-300 to-purple-600 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-white text-5xl md:text-6xl font-black leading-tight mb-4">
              What Service Do You Need?
            </h1>
            <p className="text-white/90 text-xl md:text-2xl max-w-2xl mx-auto">
              Choose a service category and we'll connect you with the best professionals
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="group p-8 rounded-2xl border-2 border-purple-300 hover:border-purple-600 
                             hover:shadow-2xl transition-all hover:-translate-y-2 text-left 
                             hover:bg-purple-50 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-purple-600 group-hover:text-purple-700 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 group-hover:text-gray-700 text-sm">
                        {category.description || `Find qualified ${category.name.toLowerCase()} professionals`}
                      </p>
                    </div>
                    <ChevronRight className="text-purple-600 group-hover:text-purple-700 group-hover:translate-x-1 transition-transform" size={24} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Alternative Route */}
        <section className="py-12 px-4 bg-slate-200/20">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600 mb-4">Or search for providers differently</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/find-nearby"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold 
                           hover:bg-purple-700 transition-colors"
              >
                Find Nearby Providers
              </Link>
              <Link
                to="/services"
                className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg 
                           font-semibold hover:bg-purple-50 transition-colors"
              >
                Browse All Providers
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // STEP 2: Provider Selection
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-300 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="text-white font-semibold hover:underline flex items-center gap-1 mb-4"
          >
            ← Back to Categories
          </button>
          <h1 className="text-white text-4xl md:text-5xl font-black">
            {selectedCategory?.name} Professionals
          </h1>
          <p className="text-white/90 mt-2">
            Choose the best professional for your needs
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-lg font-bold mb-6 text-purple-600">Refine Search</h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block font-semibold mb-2 text-gray-700">Search Name</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search professionals..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Women First */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.women_first}
                    onChange={(e) => setFilters(prev => ({ ...prev, women_first: e.target.checked }))}
                    className="w-5 h-5 accent-purple-600 rounded"
                  />
                  <span className="font-semibold text-purple-600">Women-Led Only</span>
                </label>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-2 text-gray-700">City</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-2 text-gray-700">Min Rating</label>
                <select
                  value={filters.min_rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_rating: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="0">All Ratings</option>
                  <option value="3">3+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Reset */}
              <button
                onClick={() => setFilters({ women_first: false, min_rating: 0, city: '' })}
                className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <Loading />
            ) : filteredProviders.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-6 font-semibold">
                  Found {filteredProviders.length} professional{filteredProviders.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProviders.map((provider) => (
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
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg mb-4">
                  No professionals match your criteria
                </p>
                <button
                  onClick={() => {
                    setFilters({ women_first: false, min_rating: 0, city: '' })
                    setSearchQuery('')
                  }}
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
