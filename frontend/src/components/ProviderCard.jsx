import React from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Heart } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export default function ProviderCard({ provider, user }) {
  const { t } = useLanguage()

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div
      className="provider-card-hover bg-white rounded-lg overflow-hidden border"
      style={{ borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-soft)' }}
    >
      {/* Provider Photo */}
      <div
        className="relative h-48 flex items-center justify-center"
        style={{ background: 'linear-gradient(145deg, var(--c-bg), #ffffff)' }}
      >
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md" style={{ boxShadow: 'var(--shadow-soft)' }}>
          {(user?.profile_photo || provider?.profile_photo) ? (
            <img
              src={user?.profile_photo || provider?.profile_photo}
              alt={user?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className="w-full h-full flex items-center justify-center font-bold text-xl provider-avatar-fallback"
            style={{
              display: (user?.profile_photo || provider?.profile_photo) ? 'none' : 'flex',
              backgroundColor: '#a05a2c',
              color: '#ffffff',
              border: '1px solid #8f4f26',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            {getInitials(user?.name)}
          </div>
        </div>
        
        {/* Women First Badge */}
        {user?.is_female && (
          <div className="absolute top-2 right-2 women-first-badge" style={{ background: 'rgba(192,57,43,0.08)', borderColor: 'rgba(192,57,43,0.25)', color: 'var(--c-primary)' }}>
            <span>❤️ {t('womenFirst')}</span>
          </div>
        )}
        
        {/* Trust Badge */}
        {provider?.trust_badge && (
          <div className="absolute top-2 left-2 trust-badge">
            {provider.trust_badge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name and Location */}
        <h3 className="font-bold text-lg" style={{ color: 'var(--t-primary)' }}>{user?.name}</h3>
        <div className="flex items-center gap-1 text-sm mb-3" style={{ color: 'var(--t-secondary)' }}>
          <MapPin size={16} strokeWidth={1.75} />
          <span>{user?.city}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex items-center px-2 py-1 rounded"
            style={{ backgroundColor: 'var(--c-muted)', border: '1px solid var(--c-border)' }}
          >
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="ml-1 font-semibold" style={{ color: 'var(--t-primary)' }}>{provider?.rating || 0}</span>
          </div>
          <span className="text-sm" style={{ color: 'var(--t-secondary)' }}>({provider?.total_jobs || 0} jobs)</span>
        </div>

        {/* Skills */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {provider?.skills?.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 rounded border"
                style={{
                  backgroundColor: 'rgba(192,57,43,0.08)',
                  color: 'var(--c-primary)',
                  borderColor: 'var(--c-border)'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Price - Hidden, shown in booking cost calculator */}

        {/* Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/provider/${user?.id}`}
            className="flex-1 py-2.5 border rounded-xl font-semibold text-sm text-center transition-colors"
            style={{
              borderColor: 'var(--c-border)',
              color: 'var(--t-primary)',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            {t('viewProfile')}
          </Link>
          <Link
            to={`/booking?provider_id=${user?.id}&service_id=${provider?.services?.[0]?.id || ''}`}
            className="flex-1 py-2.5 text-white rounded-xl font-semibold text-sm text-center transition-colors"
            style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}
          >
            {t('bookNow')}
          </Link>
        </div>
      </div>
    </div>
  )
}
