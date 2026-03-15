import React, { useState } from 'react'

const ChatWithProvider = ({ booking, provider }) => {
  const [showOptions, setShowOptions] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 
                   text-white rounded-lg text-sm font-medium hover:bg-green-600"
      >
        Chat
      </button>
      {showOptions && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl 
                        shadow-xl border border-gray-100 p-3 min-w-48 z-20">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/977${provider?.phone?.replace(/^0/, '')}?text=Hello ${provider?.name}! I have a booking with you (ID: #${booking.id}) on Garuda.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg 
                       hover:bg-green-50 text-green-700 font-medium text-sm block w-full text-left"
          >
            <span className="text-xl">💬</span>
            WhatsApp
          </a>
          {/* Phone call */}
          <a
            href={`tel:${provider?.phone}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg 
                       hover:bg-blue-50 text-blue-700 font-medium text-sm block w-full text-left"
          >
            <span className="text-xl">📞</span>
            Call Provider
          </a>
          {/* Email */}
          <a
            href={`mailto:${provider?.email}?subject=Booking #${booking.id} on Garuda`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg 
                       hover:bg-purple-300/20 text-purple-600 font-medium text-sm block w-full text-left"
          >
            <span className="text-xl">✉️</span>
            Email
          </a>
          {/* AI Chat */}
          <button
            onClick={() => {
              setShowOptions(false)
              window.dispatchEvent(new CustomEvent('openChatBot', {
                detail: `I need help with my booking #${booking.id} with ${provider?.name}`
              }))
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg 
                       hover:bg-purple-300/20 text-purple-600 font-medium text-sm w-full text-left"
          >
            <img src="/garuda.jpeg" alt="Garuda" className="w-5 h-5 rounded-full object-cover" />
            AI Assistant
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatWithProvider
