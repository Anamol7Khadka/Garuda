import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
    page: 1,
  })

  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])

  // Keep filters aligned with query params
  useEffect(() => {
    const categoryParam = searchParams.get('category') || ''
    const categoryIdParam = searchParams.get('category_id') || ''
    const nextCategory = categoryParam ? categoryParam : ''
    const nextCategoryId = categoryParam ? '' : categoryIdParam

    setFilters((prev) => ({
      ...prev,
      city: searchParams.get('city') || '',
      women_first: searchParams.get('women_first') === 'true',
      category: nextCategory,
      category_id: nextCategoryId,
      page: 1,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    loadProviders()
  }, [filters])

  useEffect(() => {
    loadCities()
    loadCategories()
  }, [])

  const loadCities = async () => {
    try {
      const response = await api.get('/api/providers')
      const data =
        response.data?.data?.providers ||
        response.data?.providers ||
        response.data?.data ||
        response.data ||
        []
      const citiesFromData = Array.isArray(data)
        ? data.map((p) => p.city || p.provider?.city).filter(Boolean)
        : []

      const fallbackCities = [
        'Kathmandu',
        'Lalitpur',
        'Bhaktapur',
        'Pokhara',
        'Butwal',
        'Chitwan',
        'Biratnagar',
        'Janakpur',
      ]

      const uniqueCities = [...new Set([...citiesFromData, ...fallbackCities])]
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
      if (filters.city) {
        params.city = filters.city
      }
      if (filters.category_id) {
        params.category_id = filters.category_id
      }
      if (filters.category) {
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
    setFilters((prev) => ({ ...prev, women_first: !prev.women_first, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-purple-600">{t('allServices')}</h1>
        </div>

        {categories && categories.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((cat) => {
                const slug = encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, '_'))
                return (
                  <Link
                    key={cat.id}
                    to={`/services?category=${slug}`}
                    className="group p-4 rounded-xl border-2 transition-all hover:-translate-y-1 text-center bg-white"
                    style={{ borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-soft)' }}
                  >
                    <h4 className="font-semibold" style={{ color: 'var(--t-primary)' }}>
                      {cat.name}
                    </h4>
                  </Link>
                )
              })}
            </div>
            <div className="border-t border-gray-200 my-8"></div>
          </div>
        )}

        {filters.category && (
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-purple-300 text-purple-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              Showing: {filters.category.replace(/_/g, ' ').toUpperCase()} providers
              <button
                onClick={() => setFilters((prev) => ({ ...prev, category: '', category_id: '', page: 1 }))}
                className="ml-2 hover:text-purple-600/80"
              >
                ✕
              </button>
            </span>
          </div>
        )}

        <div className="flex gap-8">
          <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{t('filters')}</h3>
                <button onClick={() => setShowFilters(false)} className="md:hidden">
                  <X />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-purple-300/20 to-slate-200 rounded-lg border-2 border-purple-300">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.women_first}
                    onChange={toggleWomenFirst}
                    className="w-5 h-5 accent-purple-600"
                  />
                  <span className="font-semibold text-purple-600">{t('showWomenFirst')}</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block font-semibold mb-3">{t('city')}</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value, page: 1 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">{t('allCities')}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-semibold mb-3">{t('minRating')}</label>
                <select
                  value={filters.min_rating}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      min_rating: parseFloat(e.target.value),
                      page: 1,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="0">All</option>
                  <option value="3">3+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                  <option value="4">4+ ⭐</option>
                  <option value="4.5">4.5+ ⭐</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-semibold mb-3">{t('filterByCategory')}</label>
                <select
                  value={filters.category_id}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                      category: '',
                      page: 1,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setFilters({ city: '', women_first: false, min_rating: 0, category: '', category_id: '', page: 1 })}
                className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('resetFilters')}
              </button>
            </div>
          </div>

          <div className="flex-1">
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2"
            >
              <Filter size={20} />
              {t('filters')}
            </button>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
              </div>
            ) : providers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.id || provider.user_id}
                    provider={provider.provider || provider}
                    user={provider}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">{t('noProviders')}</p>
                <p className="text-gray-500 mt-2">{t('tryIncreasing')}</p>
                {filters.category && (
                  <span
                    className="mt-4 inline-flex px-4 py-2 rounded-full text-sm font-semibold items-center gap-2"
                    style={{ backgroundColor: '#FDF0EE', color: 'var(--c-primary)' }}
                  >
                    Showing: {filters.category.replace(/_/g, ' ').toUpperCase()} providers
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, category: '', category_id: '', page: 1 }))}
                      className="ml-2"
                      style={{ color: 'var(--c-primary)' }}
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
