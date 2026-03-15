import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

/* ─── Google Fonts ─── */
const fontLink = document.createElement('link')
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap'
fontLink.rel = 'stylesheet'
if (!document.head.querySelector('[href*="Plus+Jakarta+Sans"]')) document.head.appendChild(fontLink)

/* ─── Design tokens ─── */
const T = {
  crimson: '#C0392B',
  navy:    '#1A1A2E',
  gold:    '#E8A838',
  bg:      '#FAFAF8',
  surface: '#FFFFFF',
  border:  '#E8E6E1',
  text:    '#111111',
  sub:     '#666666',
  dis:     '#AAAAAA',
  fontHead:"'Plus Jakarta Sans', sans-serif",
  fontNp:  "'Noto Sans Devanagari', sans-serif",
}

/* ─── Dhaka fabric SVG stripe ─── */
const DhakaAccent = () => (
  <svg width="100%" height="6" viewBox="0 0 400 6" preserveAspectRatio="none" style={{ display: 'block' }}>
    <defs>
      <pattern id="dhaka-login" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
        <rect width="4"  height="6" fill={T.crimson} opacity="0.85" />
        <rect x="4"  width="2"  height="6" fill={T.gold}    opacity="0.9"  />
        <rect x="6"  width="4"  height="6" fill={T.navy}    opacity="0.8"  />
        <rect x="10" width="4"  height="6" fill={T.crimson} opacity="0.85" />
        <rect x="14" width="2"  height="6" fill={T.gold}    opacity="0.9"  />
        <rect x="16" width="4"  height="6" fill={T.navy}    opacity="0.8"  />
      </pattern>
    </defs>
    <rect width="100%" height="6" fill="url(#dhaka-login)" />
  </svg>
)

/* ─── Shared input style ─── */
const inputBase = {
  width: '100%', boxSizing: 'border-box',
  padding: '12px 14px',
  border: `1.5px solid ${T.border}`,
  borderRadius: 8,
  fontFamily: T.fontHead, fontSize: 14, color: T.text,
  background: T.surface,
  outline: 'none',
  transition: 'border-color 180ms, box-shadow 180ms',
}

const FocusInput = ({ type, value, onChange, placeholder, placeholderNp, required }) => {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type} value={value} onChange={onChange} required={required}
      placeholder={`${placeholder}  /  ${placeholderNp}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? T.crimson : T.border,
        boxShadow:   focused ? '0 0 0 3px rgba(192,57,43,0.10)' : 'none',
      }}
    />
  )
}

/* ─── Main component ─── */
export default function Login() {
  const { t } = useLanguage()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      const searchParams = new URLSearchParams(window.location.search)
      const redirectTo   = searchParams.get('redirect')
      if (redirectTo) {
        navigate(redirectTo)
      } else {
        const role = data.user?.role
        if (role === 'admin') navigate('/admin')
        else if (role === 'provider') navigate('/dashboard/provider')
        else navigate('/dashboard/customer')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed  /  लग इन असफल भयो')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      fontFamily: T.fontHead,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-card { animation: fadeUp 0.35s ease-out both; }
        .submit-btn { transition: all 150ms ease; }
        .submit-btn:hover:not(:disabled) {
          background: #A93226 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(192,57,43,0.28);
        }
        input::placeholder { color: #AAAAAA; font-size: 13px; }
        .signin-link { transition: border-color 150ms; }
        .signin-link:hover { border-bottom-color: ${T.crimson} !important; }
      `}</style>

      <div className="login-card" style={{
        width: '100%', maxWidth: 440,
        background: T.surface,
        borderRadius: 14,
        border: `1px solid ${T.border}`,
        boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>

        <DhakaAccent />

        <div style={{ padding: '40px 36px 44px' }}>

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 50, height: 50, borderRadius: 13,
              background: `linear-gradient(135deg, ${T.crimson} 0%, #9B2335 100%)`,
              marginBottom: 18,
              boxShadow: '0 4px 14px rgba(192,57,43,0.30)',
            }}>
              {/* Key icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="8" cy="15" r="4" stroke="white" strokeWidth="1.8"/>
                <path d="M11.5 11.5L20 3" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M18 5l2 2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M16 7l2 2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 style={{
              fontFamily: T.fontHead, fontWeight: 800, fontSize: 27,
              color: T.navy, margin: '0 0 4px', letterSpacing: '-0.03em',
            }}>
              Welcome Back
            </h1>
            <p style={{
              fontFamily: T.fontNp, fontSize: 14, color: T.sub, margin: '0 0 3px',
            }}>
              फेरि स्वागत छ
            </p>
            <p style={{ fontSize: 13, color: T.sub, margin: 0 }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: `1px solid #FECACA`,
              borderLeft: `3px solid ${T.crimson}`,
              color: '#991B1B',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 22,
              fontFamily: T.fontHead,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{
                fontFamily: T.fontHead, fontWeight: 600, fontSize: 13,
                color: T.text, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                Email Address
                <span style={{ fontFamily: T.fontNp, fontWeight: 400, fontSize: 12, color: T.sub }}>
                  इमेल ठेगाना
                </span>
              </label>
              <FocusInput
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                placeholderNp="तपाईंको इमेल"
                required
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{
                  fontFamily: T.fontHead, fontWeight: 600, fontSize: 13,
                  color: T.text, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  Password
                  <span style={{ fontFamily: T.fontNp, fontWeight: 400, fontSize: 12, color: T.sub }}>
                    पासवर्ड
                  </span>
                </label>
                <Link to="/forgot-password" style={{
                  fontSize: 12, color: T.crimson, textDecoration: 'none',
                  fontWeight: 500, fontFamily: T.fontHead,
                }}>
                  Forgot?  /  बिर्सनु भयो?
                </Link>
              </div>
              <FocusInput
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                placeholderNp="पासवर्ड लेख्नुहोस्"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              style={{
                width: '100%',
                padding: '13px',
                background: loading ? T.dis : T.crimson,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontFamily: T.fontHead,
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
                letterSpacing: '-0.01em',
              }}
            >
              {loading
                ? 'Signing in…  /  लग इन गर्दै…'
                : 'Sign In  /  लग इन गर्नुहोस्'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px' }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{
              fontSize: 11, color: T.dis, fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: T.sub, margin: 0 }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="signin-link"
              style={{
                color: T.crimson, fontWeight: 700, textDecoration: 'none',
                borderBottom: '1px solid transparent',
              }}
            >
              Create one  /  खाता बनाउनुहोस्
            </Link>
          </p>

          {/* Trust line */}
          <p style={{
            textAlign: 'center', fontSize: 11, color: T.dis,
            margin: '16px 0 0', fontFamily: T.fontNp,
          }}>
            नेपालभरका ५०,००० परिवारको भरोसा
          </p>
        </div>

        <DhakaAccent />
      </div>
    </div>
  )
}