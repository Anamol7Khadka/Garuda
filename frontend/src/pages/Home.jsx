import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Shield, MapPin, Zap } from 'lucide-react'
import ProviderCard from '../components/ProviderCard'
import HomeChat from '../components/HomeChat'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const [featuredProviders, setFeaturedProviders] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFeaturedProviders()
  }, [])

  const loadFeaturedProviders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/providers', {
        params: {
          women_first: true,
          page: 1,
          per_page: 6
        }
      })
      const providers = 
        response.data?.data?.providers ||
        response.data?.providers ||
        response.data?.data ||
        response.data ||
        []
      setFeaturedProviders(Array.isArray(providers) ? providers : [])
    } catch (error) {
      console.error('Failed to load providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 1, name: 'Plumbing' },
    { id: 2, name: 'Cleaning' },
    { id: 3, name: 'Electrical' },
    { id: 4, name: 'Beauty' },
    { id: 5, name: 'Carpentry' },
    { id: 6, name: 'Painting' },
    { id: 7, name: 'AC' },
    { id: 8, name: 'Tutoring' },
  ]

  return (
    <div className="w-full" style={{ backgroundColor: 'var(--c-bg)' }}>
      {/* Hero Section with Chat */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden py-12"
        style={{ backgroundColor: 'var(--c-bg)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.25 }}>
          <div className="absolute top-16 left-8 w-72 h-72 bg-[rgba(255,255,255,0.6)] rounded-full blur-3xl" />
          <div className="absolute bottom-12 right-6 w-96 h-96 bg-[rgba(232,168,56,0.25)] rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            
            {/* Left — Hero text */}
            <div className="text-[var(--t-primary)]">
              <div className="inline-flex items-center gap-2 bg-white/70 rounded-full 
                              px-4 py-2 text-sm font-medium mb-6 animate-fadeIn border border-[var(--c-border)]" style={{ color: 'var(--t-secondary)' }}>
                <span>60%+ Women-Led Services</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 animate-slideUp" style={{ color: 'var(--t-primary)' }}>
                {t('heroTitle')}
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-8 animate-slideUp" style={{ color: 'var(--t-secondary)' }}>
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-3 animate-slideUp">
                <a href="/find-services"
                   className="btn-primary shadow" style={{ boxShadow: 'var(--shadow-soft)' }}>
                  {t('exploreServices')}
                </a>
                <a href="/find-nearby"
                   className="btn-secondary">
                  {t('findNearby')}
                </a>
              </div>
            </div>

            {/* Right — Embedded Chatbot */}
            <div className="w-full">
              <p className="text-sm font-medium mb-4 text-center md:text-left" style={{ color: 'var(--t-secondary)' }}>
                Tell us what you need — our AI will find the right person
              </p>
              <HomeChat />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--c-muted)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--t-primary)' }}>
            {t('whyChooseUs')}
          </h2>
          <p className="text-center mb-16" style={{ color: 'var(--t-secondary)' }}>Why thousands of customers trust Garuda</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow border-t-4" style={{ borderColor: 'var(--c-accent)' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--t-primary)' }}>{t('womenFirstBanner')}</h3>
              <p className="leading-relaxed" style={{ color: 'var(--t-secondary)' }}>
                {t('womenFirstBannerDesc')}
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow border-t-4" style={{ borderColor: 'var(--c-accent)' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--t-primary)' }}>Trusted & Verified</h3>
              <p className="leading-relaxed" style={{ color: 'var(--t-secondary)' }}>
                All providers are verified. Read reviews and ratings from customers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow border-t-4" style={{ borderColor: 'var(--c-accent)' }}>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--t-primary)' }}>Quick & Convenient</h3>
              <p className="leading-relaxed" style={{ color: 'var(--t-secondary)' }}>
                Simple, fast booking. Professional service at your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--c-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--t-primary)' }}>
            {t('servicesTitle')}
          </h2>
          <p className="text-center text-lg mb-12" style={{ color: 'var(--t-secondary)' }}>
            Explore our wide range of professional services
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/services?category=${cat.name.toLowerCase()}`}
                className="block p-6 rounded-xl border-2 transition-all hover:-translate-y-1 text-center bg-white group"
                style={{
                  borderColor: 'var(--c-border)',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <h3 className="font-semibold" style={{ color: 'var(--t-primary)' }}>{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Women Providers */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--c-muted)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--t-primary)' }}>
              {t('featuredProviders')}
            </h2>
            <p className="text-lg" style={{ color: 'var(--t-secondary)' }}>
              {t('womenFirstBannerDesc')}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[var(--c-border)] border-t-[var(--c-primary)] rounded-full animate-spin"></div>
              <p className="mt-4" style={{ color: 'var(--t-secondary)' }}>Loading providers...</p>
            </div>
          ) : featuredProviders && featuredProviders.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {featuredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id || provider.user_id}
                  provider={provider.provider || provider}
                  user={provider}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">No providers available yet</p>
              <p className="text-gray-500 mt-2">Check back soon or explore our other services</p>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/services?women_first=true"
              className="inline-block px-8 py-3 btn-primary"
            >
              View All Women Providers
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--c-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--t-primary)' }}>
            {t('howItWorksTitle')}
          </h2>
          <p className="text-center mb-16" style={{ color: 'var(--t-secondary)' }}>Simple steps to get help from verified professionals</p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: t('step1'), desc: t('step1Desc') },
              { step: '2', title: t('step2'), desc: t('step2Desc') },
              { step: '3', title: t('step3'), desc: t('step3Desc') },
              { step: '4', title: 'Leave a Review', desc: 'Share your experience and help others' }
            ].map((item) => (
              <div key={item.step} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-[var(--c-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--t-primary)' }}>{item.title}</h3>
                <p style={{ color: 'var(--t-secondary)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--c-secondary)', color: '#fff' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('bookService')}
          </h2>
          <p className="text-xl text-white/80 mb-10">
            {t('heroSubtitle_new')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/services"
              className="px-8 py-3 bg-white rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              style={{ color: 'var(--c-primary)' }}
            >
              {t('exploreServices')}
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              {t('provideService')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
