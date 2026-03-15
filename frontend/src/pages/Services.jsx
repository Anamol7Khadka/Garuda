import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X } from 'lucide-react'
import ProviderCard from '../components/ProviderCard'
import api from '../api/client'
import { useLanguage } from '../context/LanguageContext'

export default function Services() {
  const { t } = useLanguage()
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    women_first: searchParams.get('women_first') === 'true',
    min_rating: 0,
    category: searchParams.get('category') || '',
    category_id: searchParams.get('category_id') || '',
    page: 1
  })
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    loadProviders()
    loadCities()
    loadCategories()
  }, [filters])

  const loadCities = async () => {
    try {
      const response = await api.get('/api/providers')
      const data =
        response.data?.data?.providers ||
        response.data?.providers ||
        response.data?.data ||
        response.data ||
        []
      const uniqueCities = [...new Set(
        Array.isArray(data)
          ? data.map(p => p.city || p.provider?.city).filter(Boolean)
          : []
      )]
      setCities(uniqueCities.sort())
    } catch (error) {
      console.error('Failed to load cities:', error)
    }
  }

  const loadProviders = async () => {
    try {
      setLoading(true)
      const params = {
        women_first: filters.women_first,
        min_rating: filters.min_rating,
        page: filters.page,
        per_page: 12,
      }
      if (filters.city && filters.city !== '') {
        params.city = filters.city
      }
      if (filters.category_id && filters.category_id !== '') {
        params.category_id = filters.category_id
      }
      if (filters.category && filters.category !== '') {
        params.category = filters.category
      }
      const response = await api.get('/api/providers', { params })
      const data =
        response.data?.data?.providers ||
        response.data?.providers ||
        response.data?.data ||
        response.data ||
        []
      setProviders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const loadCategories = async () => {
    try {
      const response = await api.get('/api/services/categories')
      const data = response.data?.data || response.data || []
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const toggleWomenFirst = () => {
    setFilters(prev => ({ ...prev, women_first: !prev.women_first, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">{t('allServices')}</h1>
        </div>

        {/* Active category badge */}
        {filters.category && (
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full 
                           text-sm font-semibold flex items-center gap-2">
              Showing: {filters.category.replace(/_/g, ' ').toUpperCase()} providers
              <button onClick={() => setFilters(prev => ({...prev, category: '', page: 1}))}
                      className="ml-2 hover:text-purple-900">
                ✕
              </button>
            </span>
          </div>
        )}

        {/* Main layout */}
        <div className="flex gap-8">

          {/* Filters sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t('filters')}</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden"
                >
                  <X />
                </button>
              </div>

              {/* Women First Toggle */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.women_first}
                    onChange={toggleWomenFirst}
                    className="w-5 h-5 accent-purple-700"
                  />
                  <span className="font-semibold text-purple-700">💜 {t('showWomenFirst')}</span>
                </label>
              </div>

              {/* City Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-3">{t('city')}</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value, page: 1 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t('allCities')}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-3">{t('minRating')}</label>
                <select
                  value={filters.min_rating}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    min_rating: parseFloat(e.target.value),
                    page: 1
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="0">All</option>
                  <option value="3">3+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="4.5">4.5+ ⭐</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-3">{t('filterByCategory')}</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    category_id: e.target.value,
                    page: 1
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              <button
                onClick={() => setFilters({ city: '', women_first: false, min_rating: 0, category_id: '', page: 1 })}
                className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 
                           rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('resetFilters')}
              </button>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="flex-1">
            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden mb-4 px-4 py-2 bg-purple-700 text-white 
                         rounded-lg flex items-center gap-2"
            >
              <Filter size={20} />
              {t('filters')}
            </button>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-purple-300 
                                border-t-purple-700 rounded-full animate-spin" />
              </div>
            ) : providers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider.provider}
                    user={provider}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">{t('noProviders')}</p>
                <p className="text-gray-500 mt-2">{t('tryIncreasing')}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}