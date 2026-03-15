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
    <nav className="sticky top-0 z-50 bg-white border-b border-[#F0F0F0] backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl" style={{ color: 'var(--c-secondary)' }}>
            <img
              src="/garuda.jpeg"
              alt="Garuda logo"
              className="h-9 w-9 rounded-full border"
              style={{ borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-soft)' }}
            />
            <span style={{ color: 'var(--c-primary)' }}>Garuda</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`flex items-center gap-1 text-sm font-medium ${isActive('/') ? 'text-[var(--c-primary)]' : 'text-[#333] hover:text-[var(--c-primary)]'}`}
            >
              <Home size={20} />
              {t('home')}
            </Link>
            
            <Link 
              to="/services" 
              className={`flex items-center gap-1 text-sm font-medium ${isActive('/services') ? 'text-[var(--c-primary)]' : 'text-[#333] hover:text-[var(--c-primary)]'}`}
            >
              <Briefcase size={20} />
              {t('services')}
            </Link>

            {isAuthenticated && (
              <Link 
                to="/find-nearby" 
                className={`flex items-center gap-1 text-sm font-medium ${
                  isActive('/find-nearby') ? 'text-[var(--c-primary)]' : 'text-[#333] hover:text-[var(--c-primary)]'
                }`}
              >
                {t('findNearby')}
              </Link>
            )}

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-[#333] hover:text-[var(--c-primary)] font-semibold"
                >
                  {t('login')}
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  {t('register')}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {(user?.role === 'customer' || user?.role === 'provider') && (
                  <Link 
                    to={user?.role === 'customer' ? '/dashboard/customer' : '/dashboard/provider'}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FDF0EE] text-[var(--c-primary)] rounded-lg border border-[#F7D4CF] hover:shadow-sm"
                  >
                    <LayoutDashboard size={20} />
                    {t('dashboard')}
                  </Link>
                )}
                
                {user?.role === 'admin' && (
                  <Link 
                    to="/dashboard/admin"
                    className="flex items-center gap-2 px-4 py-2 bg-[#FDF0EE] text-[var(--c-primary)] rounded-lg border border-[#F7D4CF] hover:shadow-sm"
                  >
                    <LayoutDashboard size={20} />
                    Admin
                  </Link>
                )}

                <div className="pl-4 border-l border-[#E5E5E5] flex items-center gap-3">
                  <span className="text-sm text-[#333]">{user?.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-[#555] hover:text-[var(--c-primary)]"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[#F3F2EF] rounded-lg p-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'bg-white text-[var(--c-primary)] shadow-sm font-bold'
                    : 'text-[#666] hover:text-[var(--c-primary)]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('np')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  language === 'np'
                    ? 'bg-white text-[var(--c-primary)] shadow-sm font-bold'
                    : 'text-[#666] hover:text-[var(--c-primary)]'
                }`}
              >
                नेपाली
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[#333]"
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
              className="block px-4 py-2 text-[#333] hover:bg-[#F3F2EF] rounded"
              onClick={() => setIsOpen(false)}
            >
              {t('home')}
            </Link>
            <Link 
              to="/services" 
              className="block px-4 py-2 text-[#333] hover:bg-[#F3F2EF] rounded"
              onClick={() => setIsOpen(false)}
            >
              {t('services')}
            </Link>

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="block px-4 py-2 text-[#333] hover:bg-[#F3F2EF] rounded"
                  onClick={() => setIsOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2 text-white rounded" style={{ backgroundColor: 'var(--c-primary)' }}
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
                    className="block px-4 py-2 text-[var(--c-primary)] hover:bg-[#FDF0EE] rounded"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                )}
                {user?.role === 'provider' && (
                  <Link 
                    to="/dashboard/provider"
                    className="block px-4 py-2 text-[var(--c-primary)] hover:bg-[#FDF0EE] rounded"
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
                  className="block w-full text-left px-4 py-2 text-[var(--c-primary)] hover:bg-[#FDF0EE] rounded"
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
