import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, DollarSign, Award } from 'lucide-react'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import PhotoUpload from '../../components/PhotoUpload'

export default function ProviderDashboard() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { t } = useLanguage()
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)

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
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/bookings/assigned', { params: { page: 1, per_page: 5 } })
      const bookings = 
        response.data?.data?.bookings ||
        response.data?.bookings ||
        response.data?.data ||
        response.data ||
        []
      setBookings(Array.isArray(bookings) ? bookings : [])
      
      // Calculate stats
      const totalEarnings = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.final_price || 0), 0)
      
      setStats({
        totalJobs: bookings.length,
        completedJobs: bookings.filter(b => b.status === 'completed').length,
        totalEarnings: totalEarnings,
        rating: user?.provider?.rating || 0
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.put(`/api/bookings/${bookingId}/status`, { status: newStatus })
      loadDashboardData()
    } catch (error) {
      console.error('Failed to update booking status:', error)
    }
  }

  const handleNavigateToCustomer = (booking) => {
    if (booking.customer_latitude && booking.customer_longitude) {
      navigate(`/find-nearby?mode=provider&customer_lat=${booking.customer_latitude}&customer_lng=${booking.customer_longitude}`)
    } else {
      alert('Customer location not available')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-6">
            <PhotoUpload
              currentPhoto={user?.profile_photo}
              size="xl"
              name={user?.name}
              onUpload={(url) => updateUser({ ...user, profile_photo: url })}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                {user?.is_female && (
                  <span className="bg-purple-300 text-purple-600 text-xs 
                                   font-semibold px-2.5 py-1 rounded-full">
                    Women First Provider
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <p className="text-gray-500 text-sm">{user?.city || 'Kathmandu'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  user?.provider?.is_available
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user?.provider?.is_available ? 'Available' : 'Unavailable'}
                </span>
                <span className="text-xs bg-yellow-100 text-yellow-700 
                                 font-semibold px-2.5 py-1 rounded-full">
                  {user?.provider?.rating?.toFixed(1) || 'New'} · {user?.provider?.trust_badge || 'New'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Click the photo to upload a new one
              </p>
            </div>
            <div className="hidden md:flex gap-4 text-center">
              <div className="bg-green-50 rounded-xl px-5 py-3">
                <div className="text-2xl font-bold text-green-600">
                  Rs.{user?.provider?.total_earnings?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Total Earned</div>
              </div>
              <div className="bg-purple-300/30 rounded-xl px-5 py-3">
                <div className="text-2xl font-bold text-purple-600">
                  {user?.provider?.total_jobs || 0}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Jobs Done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <BarChart3 className="text-blue-700" size={32} />
              </div>
              <div>
                <p className="text-gray-600">{t('totalJobs')}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalJobs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <Users className="text-green-700" size={32} />
              </div>
              <div>
                <p className="text-gray-600">{t('completedJobs')}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.completedJobs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-4 rounded-lg">
                <DollarSign className="text-yellow-700" size={32} />
              </div>
              <div>
                <p className="text-gray-600">{t('totalEarnings')}</p>
                <p className="text-3xl font-bold text-gray-800">₨{stats.totalEarnings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-300 p-4 rounded-lg">
                <Award className="text-purple-600" size={32} />
              </div>
              <div>
                <p className="text-gray-600">{t('averageRating')}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.rating?.toFixed(1) || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">{t('pendingBookingRequests')}</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{booking.service?.title}</h3>
                      <p className="text-gray-600">{booking.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">तारिख</p>
                      <p className="font-semibold">
                        {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString('ne-NP') : 'तोकिएको छैन'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">स्थान</p>
                      <p className="font-semibold">{booking.address?.substring(0, 30)}...</p>
                    </div>
                    <div>
                      <p className="text-gray-600">मूल्य</p>
                      <p className="font-semibold">₨{booking.final_price}</p>
                    </div>
                  </div>

                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800"
                      >
                        स्वीकार गर्नुहोस्
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="px-4 py-2 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800"
                      >
                        अस्वीकार गर्नुहोस्
                      </button>
                    </div>
                  )}

                  {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNavigateToCustomer(booking)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                      >
                        Navigate to Customer
                      </button>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600/90"
                        >
                          शुरू गर्नुहोस्
                        </button>
                      )}
                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          className="px-4 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800"
                        >
                          पूरा गर्नुहोस्
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">कोनै अनुरोधहरू नहिंसे</p>
          )}
        </div>
      </div>
    </div>
  )
}
