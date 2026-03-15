import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, MapPin, AlertCircle } from 'lucide-react'
import api from '../api/client'

/**
 * Dynamic Cost Calculator Component
 * 
 * Displays cost estimation based on:
 * - Service type & complexity
 * - Provider rating & experience
 * - Travel distance & location
 * - AI-powered similarity search & RAG
 * - Web search baseline
 */
export default function DynamicCostCalculator({
  serviceCategory = '',
  description = '',
  providerRating = 0,
  providerExperience = 0,
  latitude = null,
  longitude = null,
  customerLat = null,
  customerLng = null,
  isVisible = false,
  onCostUpdate = null  // Callback to notify parent of cost
}) {
  const [costEstimate, setCostEstimate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [breakdown, setBreakdown] = useState(null)

  // Calculate distance in kilometers (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Fetch AI-powered cost estimation
  useEffect(() => {
    // Only skip if completely missing core data
    if (!isVisible || !serviceCategory) {
      setCostEstimate(null)
      setBreakdown(null)
      return
    }

    // Only calculate if we have location data
    if (!latitude || !longitude || !customerLat || !customerLng) {
      setCostEstimate(null)
      setBreakdown(null)
      return
    }

    const fetchCostEstimate = async () => {
      setLoading(true)
      setError(null)

      try {
        // Call AI service for base price estimation
        const response = await api.post('/api/ai/estimate-price', {
          service_category: serviceCategory,
          description: description || `Looking for ${serviceCategory} service`,
          location: 'Kathmandu', // Nepal-specific
        })

        const aiEstimate = response.data?.data || {}

        // Calculate travel cost (base: Rs.10 per km)
        let travelCost = 0
        const distance = calculateDistance(latitude, longitude, customerLat, customerLng)
        travelCost = Math.round(distance * 10) // Rs 10 per km

        // Provider experience multiplier (0.8x to 1.5x)
        const experienceMultiplier = Math.max(0.8, Math.min(1.5, 0.8 + providerExperience * 0.1))

        // Provider rating multiplier (0.9x to 1.2x)
        const ratingMultiplier = Math.max(0.9, Math.min(1.2, 0.9 + (providerRating / 5) * 0.3))

        // Complexity multiplier
        const complexityMap = {
          low: 0.8,
          medium: 1,
          high: 1.3,
        }
        const complexityMultiplier = complexityMap[aiEstimate.complexity] || 1

        // Calculate final price
        const basePrice = (aiEstimate.min_price + aiEstimate.max_price) / 2
        const adjustedBasePrice = Math.round(basePrice * complexityMultiplier * ratingMultiplier)
        const finalPrice = adjustedBasePrice + travelCost

        // Breakdown
        const breakdown = {
          baseService: adjustedBasePrice,
          travelCost: travelCost,
          complexity: aiEstimate.complexity,
          complexityMultiplier: (complexityMultiplier * 100).toFixed(0),
          ratingMultiplier: (ratingMultiplier * 100).toFixed(0),
          experienceMultiplier: (experienceMultiplier * 100).toFixed(0),
          distance: parseFloat(distance.toFixed(2)),
          reasoning: aiEstimate.reasoning,
        }

        setBreakdown(breakdown)
        setCostEstimate(finalPrice)
        
        // Notify parent of updated cost
        if (onCostUpdate) {
          onCostUpdate(finalPrice)
        }
      } catch (err) {
        console.error('Cost estimation error:', err)
        setError('Unable to calculate cost. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchCostEstimate, 500)
    return () => clearTimeout(debounceTimer)
  }, [isVisible, serviceCategory, description, latitude, longitude, customerLat, customerLng, providerRating, providerExperience])

  if (!isVisible || costEstimate === null) {
    return null
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-br from-purple-300 via-white to-white 
                      rounded-2xl p-6 border border-purple-600/20 shadow-lg hover:shadow-xl 
                      transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600/10 rounded-lg">
            <DollarSign className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Estimated Cost</h3>
            <p className="text-xs text-gray-500">Updated based on your selection</p>
          </div>
        </div>

        {/* Main Price Display */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200/30">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Estimated Cost</p>
              <p className="text-4xl font-black text-purple-600">
                ₨{loading ? '...' : costEstimate.toLocaleString('en-NP')}
              </p>
            </div>
            {breakdown?.distance > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                  <MapPin size={14} /> {breakdown.distance} km
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        {breakdown && (
          <div className="space-y-3 mb-6">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Cost Breakdown
            </div>

            <div className="space-y-2">
              {/* Base Service Cost */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full" /> Base Service
                </span>
                <span className="font-semibold text-gray-800">
                  ₨{breakdown.baseService.toLocaleString('en-NP')}
                </span>
              </div>

              {/* Travel Cost */}
              {breakdown.travelCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-600 rounded-full" /> Travel Cost
                  </span>
                  <span className="font-semibold text-gray-800">
                    ₨{breakdown.travelCost.toLocaleString('en-NP')}
                  </span>
                </div>
              )}

              {/* Multipliers */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs text-gray-500 mb-2">Adjustments</p>

                {breakdown.complexityMultiplier !== '100' && (
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">
                      Complexity ({breakdown.complexity})
                    </span>
                    <span className="text-purple-600 font-semibold">
                      {breakdown.complexityMultiplier}%
                    </span>
                  </div>
                )}

                {breakdown.ratingMultiplier !== '100' && (
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Provider Rating ({providerRating}/5)</span>
                    <span className="text-purple-600 font-semibold">
                      {breakdown.ratingMultiplier}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="bg-purple-300/20 border border-purple-300 rounded-lg p-3 flex gap-2 text-xs">
          <AlertCircle className="text-purple-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-gray-700">
            <span className="font-semibold">💡 Note:</span> This is an estimated cost. Final price may vary based on work complexity during consultation.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-500">Calculating cost...</p>
          </div>
        )}
      </div>
    </div>
  )
}
