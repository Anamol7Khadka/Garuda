import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function BookingFlow() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const providerId = searchParams.get('provider_id')
  const [bookingData, setBookingData] = useState({
    address: '',
    description: '',
    scheduledDate: '',
    scheduledTime: ''
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('bookNow')}</h1>
        
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="space-y-6">
            
            {/* Step 1: Your Address */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('yourAddress')}
              </label>
              <input
                type="text"
                value={bookingData.address || ''}
                onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                placeholder="Enter your full address in Kathmandu..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 
                           text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500">
                💡 Need to find a provider near you? 
                <a href="/find-nearby" className="text-purple-600 font-medium ml-1">
                  Use Find Nearby Map →
                </a>
              </p>
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
                           text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Step 3: Date & Time */}
            {/* Step 3: Date & Time */}
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
                             text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t('selectDate')}
                </label>
                <input
                  type="time"
                  value={bookingData.scheduledTime || ''}
                  onChange={(e) => setBookingData({...bookingData, scheduledTime: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 
                             text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              className="w-full mt-8 bg-purple-600 text-white font-semibold py-3 rounded-xl 
                         hover:bg-purple-700 transition-colors"
            >
              {t('confirmBooking')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
