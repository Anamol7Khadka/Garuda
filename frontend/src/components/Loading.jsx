import React from 'react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-semibold">लोड हो रहेको छ...</p>
      </div>
    </div>
  )
}
