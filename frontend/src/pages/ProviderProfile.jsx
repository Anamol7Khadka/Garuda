import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, MapPin, Award, TrendingUp } from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import Loading from '../components/Loading'
import PhotoUpload from '../components/PhotoUpload'

export default function ProviderProfile() {
  const { t } = useLanguage()
  const { id } = useParams()
  const [provider, setProvider] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProvider()
  }, [id])

  const loadProvider = async () => {
    try {
      const response = await api.get(`/api/providers/${id}`)
      const provider = 
        response.data?.data?.provider ||
        response.data?.data ||
        response.data ||
        null
      setProvider(provider)
      setReviews(provider?.reviews || [])
    } catch (error) {
      console.error('Failed to load provider:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (!provider) return <div className="text-center py-12">{t('providerNotFound')}</div>

  const user = { name: provider.name, city: provider.city, profile_photo: provider.profile_photo, is_female: provider.is_female }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-48 flex items-center justify-center" style={{ background: 'linear-gradient(145deg, var(--c-bg), #ffffff)' }}>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg" style={{ boxShadow: 'var(--shadow-soft)' }}>
              {provider.profile_photo ? (
                <img
                  src={provider.profile_photo}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className="w-full h-full provider-avatar-fallback items-center justify-center font-bold text-3xl"
                style={{ display: provider.profile_photo ? 'none' : 'flex' }}
              >
                {getInitials(provider.name)}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{user.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={20} className="text-[var(--t-secondary)]" />
                    <span className="text-gray-600">{user.city}</span>
                  </div>
                  {user.is_female && <span className="women-first-badge">{t('womenFirst')}</span>}
                </div>
              </div>
                <button className="px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}>
                {t('bookNow')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 border-t pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--c-primary)' }}>{provider.provider?.rating}</div>
                <div className="flex justify-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(provider.provider?.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--c-primary)' }}>{provider.provider?.total_jobs}</div>
                <p className="text-gray-600 text-sm">{t('totalJobs')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--c-primary)' }}>{provider.provider?.trust_score}</div>
                <p className="text-gray-600 text-sm">{t('trustScore')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl">
                  {provider.provider?.trust_badge === 'Expert' ? '👑' : 
                   provider.provider?.trust_badge === 'Trusted' ? '✅' :
                   provider.provider?.trust_badge === 'Rising' ? '📈' : '⭐'}
                </div>
                <p className="text-gray-600 text-sm">{provider.provider?.trust_badge}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {provider.provider?.bio && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">बायो</h2>
            <p className="text-gray-700">{provider.provider.bio}</p>
          </div>
        )}

        {/* Review Summary */}
        {provider.provider?.review_summary && (
          <div className="rounded-lg shadow-md p-6 mb-8 border-l-4" style={{ backgroundColor: 'var(--c-muted)', borderColor: 'var(--c-primary)' }}>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">समीक्षा सारांश</h2>
            <p className="text-gray-700 italic">{provider.provider.review_summary}</p>
          </div>
        )}

        {/* Services */}
        {provider.services && provider.services.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">सेवाहरू</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {provider.services.map((service) => (
                <div key={service.id} className="border border-purple-300 rounded-lg p-4 hover:border-purple-600 transition-colors">
                  <h3 className="font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  <p className="text-purple-600 font-semibold">₨{service.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">समीक्षाहरू ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('ne-NP')}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
