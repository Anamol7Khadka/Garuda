import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, DollarSign, Star, Plus } from 'lucide-react'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import ChatWithProvider from '../../components/ChatWithProvider'
import PhotoUpload from '../../components/PhotoUpload'

export default function CustomerDashboard() {
  const { t } = useLanguage()
  const { user, updateUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('active')

  const handlePhotoUpload = async (photoUrl) => {
    try {
      // Refetch user from backend to get updated profile_photo
      const response = await api.get('/api/auth/me')
      const updatedUser = response.data?.data || response.data
      if (updatedUser) {
        updateUser(updatedUser)
      }
    } catch (error) {
      console.error('Failed to refresh user after photo upload:', error)
      // Still try to show the new photo even if refresh fails
      if (user) {
        updateUser({ ...user, profile_photo: photoUrl })
      }
    }
  }

  useEffect(() => {
    loadBookings()
  }, [activeTab])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/bookings/my', {
        params: {
          status: activeTab === 'active' ? undefined : 'completed',
          page: 1,
          per_page: 10
        }
      })
      const bookings = 
        response.data?.data?.bookings ||
        response.data?.bookings ||
        response.data?.data ||
        response.data ||
        []
      setBookings(Array.isArray(bookings) ? bookings : [])
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-purple-300 text-purple-600'
      case 'completed': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-6">
          
          {/* Profile photo with upload */}
          <PhotoUpload
            currentPhoto={user?.profile_photo}
            size="xl"
            name={user?.name}
            onUpload={(url) => updateUser({ ...user, profile_photo: url })}
          />

          {/* User info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name}
              </h1>
              {user?.is_female && (
                <span className="bg-purple-300 text-purple-600 text-xs 
                                 font-semibold px-2.5 py-1 rounded-full">
                  Women First
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <p className="text-gray-500 text-sm">{user?.city || 'Kathmandu'}</p>
            <p className="text-xs text-gray-400 mt-2">
              Click the photo to upload a new one
            </p>
          </div>

          {/* Stats */}
          <div className="hidden md:flex gap-6 text-center">
            <div className="bg-purple-300/30 rounded-xl px-6 py-3">
              <div className="text-2xl font-bold text-purple-600">
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Completed</div>
            </div>
            <div className="bg-blue-50 rounded-xl px-6 py-3">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => ['pending','confirmed','in_progress'].includes(b.status)).length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Active</div>
            </div>
          </div>
        </div>
      </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'active' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            {t('activeBookings')}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'completed' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            {t('pastBookings')}
          </button>
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{booking.service?.title}</h3>
                    <p className="text-gray-600">{t('bookingNumber')}: #{booking.id}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">{t('date')}</p>
                      <p className="font-semibold">
                        {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString('ne-NP') : t('notSet')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">{t('location')}</p>
                      <p className="font-semibold">{booking.address?.substring(0, 20)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">{t('price')}</p>
                      <p className="font-semibold">₨{booking.final_price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">{t('status')}</p>
                      <p className="font-semibold">{booking.payment_status}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ChatWithProvider booking={booking} provider={booking.provider_details} />
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600/90 transition-colors">
                    {t('viewDetails')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">{t('noBookings')}</p>
            <a href="/services" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600/90">
              {t('bookService')}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
