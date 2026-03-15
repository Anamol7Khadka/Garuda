import React, { useState } from 'react'

const Avatar = ({ provider, size = 'md' }) => {
  const [imageError, setImageError] = useState(false)
  const sizes = { 
    sm: 'w-10 h-10', 
    md: 'w-16 h-16', 
    lg: 'w-24 h-24' 
  }
  
  const palettes = [
    { bg: '#f2decf', text: '#8f4f26', border: '#d9b596' },
    { bg: '#f5d7cc', text: '#a13b2d', border: '#e3b8ac' },
    { bg: '#f3e5d8', text: '#7a3f1e', border: '#d5c1a9' },
    { bg: '#f8e7d1', text: '#b24c2f', border: '#e6c9a3' },
    { bg: '#efd9c5', text: '#9c5a30', border: '#d8b899' },
  ]
  
  const colorIndex = provider?.id % palettes.length || 0

  if (provider?.profile_photo && !imageError) {
    return (
      <img
        src={provider.profile_photo}
        alt={provider.name}
        onError={() => setImageError(true)}
        className={`${sizes[size]} rounded-full object-cover shadow-md`}
        style={{ border: '2px solid var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold shadow-md text-lg`}
      style={{
        backgroundColor: palettes[colorIndex].bg,
        color: palettes[colorIndex].text,
        border: `2px solid ${palettes[colorIndex].border}`,
        boxShadow: 'var(--shadow-soft)'
      }}
    >
      {provider?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

export default Avatar
