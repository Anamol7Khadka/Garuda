import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import client from '../api/client'
import LocationStep from '../components/LocationStep'
import DynamicCostCalculator from '../components/DynamicCostCalculator'

export default function BookingFlow() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const providerId = searchParams.get('provider_id')
  const paramLat = searchParams.get('lat')
  const paramLng = searchParams.get('lng')
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [provider, setProvider] = useState(null)
  const [serviceCategory, setServiceCategory] = useState('')
  const [calculatedCost, setCalculatedCost] = useState(null)

  const [bookingData, setBookingData] = useState({
    address: '',
    lat: paramLat ? parseFloat(paramLat) : null,
    lng: paramLng ? parseFloat(paramLng) : null,
    description: '',
    scheduledDate: '',
    scheduledTime: ''
  })

  // Fetch provider data
  useEffect(() => {
    if (providerId) {
      const fetchProvider = async () => {
        try {
          const response = await client.get(`/api/providers/${providerId}`)
          const providerData = response.data?.data || response.data
          setProvider(providerData)
          
          // Try to extract service category from first service
          if (providerData.services && providerData.services.length > 0) {
            setServiceCategory(providerData.services[0].category?.title || 'Service')
          }
        } catch (err) {
          console.error('Failed to fetch provider:', err)
        }
      }
      fetchProvider()
    }
  }, [providerId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const bookingPayload = {
        provider_id: parseInt(providerId) || undefined,
        description: bookingData.description || '',
        address: bookingData.address || '',
        latitude: bookingData.lat || undefined,
        longitude: bookingData.lng || undefined,
        scheduled_at: `${bookingData.scheduledDate}T${bookingData.scheduledTime}:00`,
        status: 'pending',
        final_price: calculatedCost || undefined  // Include calculated cost
      }

      // Remove undefined keys
      const cleanPayload = Object.fromEntries(
        Object.entries(bookingPayload).filter(([_, v]) => v !== undefined)
      )

      const response = await client.post('/api/bookings', cleanPayload)
      const responseData = response.data?.data || response.data
      
      setConfirmedBooking(responseData)
      setCurrentStep(7)
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.')
      console.error('Booking error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (currentStep === 7 && confirmedBooking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('bookingSuccess')}
            </h2>
            <p className="text-gray-500">
              Your booking has been confirmed. Here are your provider details:
            </p>
          </div>

          {/* Provider contact card */}
          {confirmedBooking?.provider && (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-left mb-6 
                            border border-purple-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-purple-300 
                                flex items-center justify-center text-2xl font-bold text-purple-600">
                  {confirmedBooking.provider.is_female ? 'F' : 'M'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {confirmedBooking.provider.name}
                  </h3>
                  {confirmedBooking.provider.is_female && (
                    <span className="text-xs bg-purple-300 text-purple-600 
                                   px-2 py-0.5 rounded-full font-medium">
                      Women First Provider
                    </span>
                  )}
                  <p className="text-sm text-gray-500 mt-0.5">
                    {confirmedBooking.provider.city}
                  </p>
                </div>
              </div>

              {/* Contact details */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a href={`tel:${confirmedBooking.provider.phone}`}
                       className="font-semibold text-purple-600 hover:underline">
                      {confirmedBooking.provider.phone || 'Will be shared soon'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg">✉️</span>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${confirmedBooking.provider.email}`}
                       className="font-semibold text-purple-600 hover:underline">
                      {confirmedBooking.provider.email}
                    </a>
                  </div>
                </div>

                {/* WhatsApp button */}
                {confirmedBooking.provider.phone && (
                  <a
                    href={`https://wa.me/977${confirmedBooking.provider.phone.replace(/^0/, '')}?text=Hello ${confirmedBooking.provider.name}, I just booked your service on Garuda. Booking ID: ${confirmedBooking.booking?.id || confirmedBooking.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 
                               bg-green-500 hover:bg-green-600 text-white rounded-xl 
                               font-semibold transition-all mt-2"
                  >
                    <span className="text-xl">💬</span>
                    Chat on WhatsApp
                  </a>
                )}
              </div>

              {/* Booking details */}
              <div className="bg-gray-50 rounded-xl p-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-semibold">#{confirmedBooking.booking?.id || confirmedBooking.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Scheduled</span>
                  <span className="font-semibold">
                    {new Date(confirmedBooking.booking?.scheduled_at || confirmedBooking.scheduled_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold text-purple-600">
                    Rs. {confirmedBooking.booking?.final_price || confirmedBooking.final_price || 'To be determined'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="text-yellow-600 font-medium">
                    🏦 Pay on arrival (Cash/eSewa/Khalti)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link to="/dashboard/customer"
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl 
                         font-semibold hover:bg-purple-600/90 text-center">
              View My Bookings
            </Link>
            <Link to="/"
              className="flex-1 py-3 border border-gray-200 text-gray-700 
                         rounded-xl font-semibold hover:bg-gray-50 text-center">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('bookNow')}</h1>
        
        <div className="bg-white rounded-2xl shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Location Picker */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('yourAddress')}
              </label>
              <LocationStep
                onLocationSelect={(location) => {
                  setBookingData({
                    ...bookingData,
                    address: location.address,
                    lat: location.lat,
                    lng: location.lng
                  })
                }}
              />
            </div>

            {/* Step 2: Describe Issue */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('describeIssue')}
              </label>
              <textarea
                value={bookingData.description || ''}
                onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
                placeholder="Tell us what service you need..."
                rows="4"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 
                           text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            {/* Cost Calculator - Shows only when location and description are entered */}
            {bookingData.lat && bookingData.lng && bookingData.description?.trim() && provider && (
              <div className="relative">
                <DynamicCostCalculator
                  serviceCategory={serviceCategory}
                  description={bookingData.description}
                  providerRating={provider.rating || 0}
                  providerExperience={provider.total_jobs || 0}
                  latitude={provider.latitude}
                  longitude={provider.longitude}
                  customerLat={bookingData.lat}
                  customerLng={bookingData.lng}
                  isVisible={true}
                  onCostUpdate={(cost) => setCalculatedCost(cost)}
                />
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t('selectDate')}
                </label>
                <input
                  type="date"
                  value={bookingData.scheduledDate || ''}
                  onChange={(e) => setBookingData({...bookingData, scheduledDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 
                             text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  value={bookingData.scheduledTime || ''}
                  onChange={(e) => setBookingData({...bookingData, scheduledTime: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 
                             text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-purple-600 text-white font-semibold py-3 rounded-xl 
                         hover:bg-purple-600/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Booking...' : t('confirmBooking')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
