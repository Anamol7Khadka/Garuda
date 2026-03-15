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
    { name: 'Plumbing', emoji: '🔧', icon: '🚰' },
    { name: 'Cleaning', emoji: '🧹', icon: '✨' },
    { name: 'Electrical', emoji: '⚡', icon: '💡' },
    { name: 'Beauty', emoji: '💅', icon: '✨' },
    { name: 'Carpentry', emoji: '🪛', icon: '🛠️' },
    { name: 'Painting', emoji: '🎨', icon: '🖌️' },
    { name: 'AC', emoji: '❄️', icon: '🌡️' },
    { name: 'Tutoring', emoji: '📚', icon: '📖' },
  ]

  return (
    <div className="w-full">
      {/* Hero Section with Chat */}
      <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 
                          min-h-[85vh] flex items-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"/>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300 rounded-full blur-3xl"/>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left — Hero text */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full 
                              px-4 py-2 text-sm font-medium mb-6">
                <span>💜</span>
                <span>60%+ Women-Led Services</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-4">
                {t('heroTitle')}
              </h1>
              <p className="text-purple-200 text-lg leading-relaxed mb-8">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/services"
                   className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl 
                              hover:bg-purple-50 transition-all shadow-lg">
                  {t('exploreServices')}
                </a>
                <a href="/find-nearby"
                   className="bg-white/20 text-white font-bold px-6 py-3 rounded-xl 
                              hover:bg-white/30 transition-all border border-white/30">
                  🗺️ {t('findNearby')}
                </a>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-10">
                <div>
                  <div className="text-3xl font-black">500+</div>
                  <div className="text-purple-300 text-sm">Verified Providers</div>
                </div>
                <div className="w-px bg-white/20"/>
                <div>
                  <div className="text-3xl font-black">10K+</div>
                  <div className="text-purple-300 text-sm">Happy Customers</div>
                </div>
                <div className="w-px bg-white/20"/>
                <div>
                  <div className="text-3xl font-black">4.9⭐</div>
                  <div className="text-purple-300 text-sm">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Right — Embedded Chatbot */}
            <div className="w-full">
              <p className="text-purple-200 text-sm font-medium mb-3 text-center">
                💬 Tell us what you need — our AI will find the right person
              </p>
              <HomeChat />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            {t('whyChooseUs')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">💜</div>
              <h3 className="text-xl font-bold mb-3 text-primary-700">{t('womenFirstBanner')}</h3>
              <p className="text-gray-600">
                {t('womenFirstBannerDesc')}
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-3 text-primary-700">Trusted & Verified</h3>
              <p className="text-gray-600">
                All providers are verified. Read reviews and ratings from customers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-primary-700">Quick Booking</h3>
              <p className="text-gray-600">
                Simple, fast, and convenient booking. Professional service at your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            {t('servicesTitle')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/services?category_id=${cat.id}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-semibold text-gray-800">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Women Providers */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            💜 {t('featuredProviders')}
          </h2>
          <p className="text-gray-600 mb-12">
            {t('womenFirstBannerDesc')}
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-primary-300 border-t-primary-700 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider.provider}
                  user={provider}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/services?women_first=true"
              className="inline-block px-8 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
            >
              सबै महिला सेवा प्रदान गर्नेहरू देख्नुहोस्
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            {t('howItWorksTitle')}
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: t('step1'), desc: t('step1Desc') },
              { step: '2', title: t('step2'), desc: t('step2Desc') },
              { step: '3', title: t('step3'), desc: t('step3Desc') },
              { step: '4', title: 'Leave a Review', desc: 'Share your experience and help others' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t('bookService')}
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            {t('heroSubtitle_new')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/services"
              className="px-8 py-3 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('exploreServices')}
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
            >
              {t('provideService')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
