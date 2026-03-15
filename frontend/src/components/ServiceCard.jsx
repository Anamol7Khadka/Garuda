import React from 'react'

export default function ServiceCard({ service, provider }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow provider-card-hover">
      <div className="h-40 bg-gradient-to-br from-purple-300 to-slate-200 flex items-center justify-center">
        <div className="text-5xl font-bold text-purple-600">★</div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{service?.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{service?.description?.substring(0, 80)}...</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-purple-600 font-semibold">₨{service?.price}</span>
          <span className="text-gray-500 text-sm">({service?.price_type})</span>
        </div>
        
        {provider && (
          <div className="text-sm text-gray-600 mb-3">
            By: <span className="font-semibold">{provider?.name}</span>
          </div>
        )}
        
        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600/90 transition-colors">
          Book Service
        </button>
      </div>
    </div>
  )
}
