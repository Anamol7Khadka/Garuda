import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, Home, Briefcase, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { language, changeLanguage , t} = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-primary-700">
            <span className="text-purple-600">सेवा</span>Sathi
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`flex items-center gap-1 ${isActive('/') ? 'text-primary-700 font-semibold' : 'text-gray-600 hover:text-primary-700'}`}
            >
              <Home size={20} />
              {t('home')}
            </Link>
            
            <Link 
              to="/services" 
              className={`flex items-center gap-1 ${isActive('/services') ? 'text-primary-700 font-semibold' : 'text-gray-600 hover:text-primary-700'}`}
            >
              <Briefcase size={20} />
              {t('services')}
            </Link>

            {isAuthenticated && (
              <Link 
                to="/find-nearby" 
                className={`flex items-center gap-1 text-sm font-medium ${
                  isActive('/find-nearby') ? 'text-primary-700 font-semibold' : 'text-gray-600 hover:text-primary-700'
                }`}
              >
                🗺️ {t('findNearby')}
              </Link>
            )}

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-600 hover:text-primary-700 font-semibold"
                >
                  {t('login')}
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800"
                >
                  {t('register')}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {user?.role === 'customer' && (
                  <Link 
                    to="/dashboard/customer"
                    className="flex items-center gap-1 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                  >
                    <LayoutDashboard size={20} />
                    {t('dashboard')}
                  </Link>
                )}
                
                {user?.role === 'provider' && (
                  <Link 
                    to="/dashboard/provider"
                    className="flex items-center gap-1 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                  >
                    <LayoutDashboard size={20} />
                    {t('dashboard')}
                  </Link>
                )}
                
                {user?.role === 'admin' && (
                  <Link 
                    to="/dashboard/admin"
                    className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    <LayoutDashboard size={20} />
                    Admin
                  </Link>
                )}

                <div className="pl-4 border-l border-gray-300 flex items-center gap-3">
                  <span className="text-sm text-gray-700">{user?.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'bg-white text-purple-700 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('np')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  language === 'np'
                    ? 'bg-white text-purple-700 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                नेपाली
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              to="/" 
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              {t('home')}
            </Link>
            <Link 
              to="/services" 
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => setIsOpen(false)}
            >
              {t('services')}
            </Link>

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2 bg-primary-700 text-white rounded"
                  onClick={() => setIsOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'customer' && (
                  <Link 
                    to="/dashboard/customer"
                    className="block px-4 py-2 text-primary-700 hover:bg-primary-100 rounded"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                )}
                {user?.role === 'provider' && (
                  <Link 
                    to="/dashboard/provider"
                    className="block px-4 py-2 text-primary-700 hover:bg-primary-100 rounded"
                    onClick={() => setIsOpen(false)}
                  >
                    Provider Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
