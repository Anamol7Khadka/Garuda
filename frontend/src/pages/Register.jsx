import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

/* ─── Google Fonts injected once ─── */
const fontLink = document.createElement('link')
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap'
fontLink.rel = 'stylesheet'
if (!document.head.querySelector('[href*="Plus+Jakarta+Sans"]')) document.head.appendChild(fontLink)

/* ─── Data ─── */
const SERVICE_SKILLS = [
  { id: 1,  en: 'Plumbing',        np: 'प्लम्बिङ',        icon: '🔧' },
  { id: 2,  en: 'Cleaning',        np: 'सफाई',            icon: '🧹' },
  { id: 3,  en: 'Electrical',      np: 'विद्युत',         icon: '⚡' },
  { id: 4,  en: 'Beauty & Wellness',np: 'सौन्दर्य',        icon: '💆' },
  { id: 5,  en: 'Carpentry',       np: 'काठको काम',        icon: '🪚' },
  { id: 6,  en: 'Painting',        np: 'रंगरोगन',         icon: '🖌️' },
  { id: 7,  en: 'AC & Appliances', np: 'एसी मर्मत',        icon: '❄️' },
  { id: 8,  en: 'Tutoring',        np: 'ट्युटरिङ',        icon: '📖' },
  { id: 9,  en: 'Pest Control',    np: 'किरा नियन्त्रण',  icon: '🐜' },
  { id: 10, en: 'Cooking',         np: 'खाना पकाउने',     icon: '👨‍🍳' },
]

const CITIES = [
  { en: 'Kathmandu',  np: 'काठमाडौं' },
  { en: 'Lalitpur',   np: 'ललितपुर'  },
  { en: 'Bhaktapur',  np: 'भक्तपुर'  },
  { en: 'Pokhara',    np: 'पोखरा'    },
  { en: 'Birgunj',    np: 'वीरगंज'   },
  { en: 'Janakpur',   np: 'जनकपुर'   },
  { en: 'Butwal',     np: 'बुटवल'    },
  { en: 'Hetauda',    np: 'हेटौडा'   },
]

/* ─── Inline style tokens ─── */
const T = {
  crimson:  '#C0392B',
  navy:     '#1A1A2E',
  gold:     '#E8A838',
  bg:       '#FAFAF8',
  surface:  '#FFFFFF',
  muted:    '#F3F2EF',
  border:   '#E8E6E1',
  text:     '#111111',
  sub:      '#666666',
  dis:      '#AAAAAA',
  fontHead: "'Plus Jakarta Sans', sans-serif",
  fontNp:   "'Noto Sans Devanagari', sans-serif",
}

/* ─── Dhaka-inspired SVG top accent ─── */
const DhakaAccent = () => (
  <svg width="100%" height="6" viewBox="0 0 400 6" preserveAspectRatio="none" style={{ display: 'block' }}>
    <defs>
      <pattern id="dhaka" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
        <rect width="4"  height="6" fill={T.crimson} opacity="0.85" />
        <rect x="4"  width="2"  height="6" fill={T.gold}   opacity="0.9"  />
        <rect x="6"  width="4"  height="6" fill={T.navy}   opacity="0.8"  />
        <rect x="10" width="4"  height="6" fill={T.crimson} opacity="0.85" />
        <rect x="14" width="2"  height="6" fill={T.gold}   opacity="0.9"  />
        <rect x="16" width="4"  height="6" fill={T.navy}   opacity="0.8"  />
      </pattern>
    </defs>
    <rect width="100%" height="6" fill="url(#dhaka)" />
  </svg>
)

/* ─── Field wrapper ─── */
const Field = ({ label, labelNp, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{
      fontFamily: T.fontHead, fontWeight: 600, fontSize: 13,
      color: T.text, display: 'flex', alignItems: 'center', gap: 6
    }}>
      {label}
      <span style={{ fontFamily: T.fontNp, fontWeight: 400, fontSize: 12, color: T.sub }}>
        {labelNp}
      </span>
    </label>
    {children}
  </div>
)

/* ─── Input style ─── */
const inputBase = {
  width: '100%', boxSizing: 'border-box',
  padding: '11px 14px',
  border: `1.5px solid ${T.border}`,
  borderRadius: 8,
  fontFamily: T.fontHead, fontSize: 14, color: T.text,
  background: T.surface,
  outline: 'none',
  transition: 'border-color 180ms, box-shadow 180ms',
}

const InputField = ({ type = 'text', name, value, onChange, placeholder, placeholderNp, required }) => {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type} name={name} value={value} onChange={onChange} required={required}
      placeholder={`${placeholder}  /  ${placeholderNp}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? T.crimson : T.border,
        boxShadow: focused ? `0 0 0 3px rgba(192,57,43,0.10)` : 'none',
      }}
    />
  )
}

const SelectField = ({ name, value, onChange, options, placeholder, placeholderNp }) => {
  const [focused, setFocused] = useState(false)
  return (
    <select
      name={name} value={value} onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        borderColor: focused ? T.crimson : T.border,
        boxShadow: focused ? `0 0 0 3px rgba(192,57,43,0.10)` : 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: 36,
        cursor: 'pointer',
      }}
    >
      <option value="">{placeholder}  /  {placeholderNp}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.en}  /  {o.np}</option>
      ))}
    </select>
  )
}

/* ─── Main Component ─── */
export default function Register() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    role: 'customer', gender: '', city: '', skills: []
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleSkill = (id) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(id)
        ? prev.skills.filter(s => s !== id)
        : [...prev.skills, id]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register(
        formData.name, formData.email, formData.password,
        formData.role, formData.gender, formData.city,
        formData.skills.length > 0 ? formData.skills : undefined
      )
      const role = data.user?.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'provider') navigate('/dashboard/provider')
      else navigate('/dashboard/customer')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed / दर्ता असफल भयो')
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
      {/* Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reg-card { animation: fadeUp 0.35s ease-out both; }
        .skill-btn { transition: all 150ms ease; }
        .skill-btn:hover { transform: translateY(-1px); }
        .submit-btn { transition: all 150ms ease; }
        .submit-btn:hover:not(:disabled) {
          background: #A93226 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(192,57,43,0.28);
        }
        input::placeholder { color: #AAAAAA; font-size: 13px; }
        select option { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="reg-card" style={{
        width: '100%', maxWidth: 480,
        background: T.surface,
        borderRadius: 14,
        border: `1px solid ${T.border}`,
        boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>

        {/* Dhaka stripe top */}
        <DhakaAccent />

        <div style={{ padding: '36px 36px 40px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {/* Logo mark */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, ${T.crimson} 0%, #9B2335 100%)`,
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(192,57,43,0.30)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 style={{
              fontFamily: T.fontHead, fontWeight: 800, fontSize: 26,
              color: T.navy, margin: '0 0 4px', letterSpacing: '-0.03em'
            }}>
              Create Account
            </h1>
            <p style={{
              fontFamily: T.fontNp, fontSize: 14, color: T.sub, margin: '0 0 2px'
            }}>
              खाता सिर्जना गर्नुहोस्
            </p>
            <p style={{ fontSize: 13, color: T.sub, margin: 0 }}>
              Join Nepal's trusted home services platform
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: `1px solid #FECACA`,
              borderLeft: `3px solid ${T.crimson}`,
              color: '#991B1B', borderRadius: 8, padding: '10px 14px',
              fontSize: 13, marginBottom: 20,
              fontFamily: T.fontHead,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Name */}
            <Field label="Full Name" labelNp="पूरा नाम">
              <InputField
                name="name" value={formData.name} onChange={handleChange}
                placeholder="Your full name" placeholderNp="तपाईंको पूरा नाम" required
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" labelNp="इमेल ठेगाना">
              <InputField
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" placeholderNp="तपाईंको इमेल" required
              />
            </Field>

            {/* Password */}
            <Field label="Password" labelNp="पासवर्ड">
              <InputField
                type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="At least 8 characters" placeholderNp="कम्तिमा ८ अक्षर" required
              />
            </Field>

            {/* Role + Gender row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="I am a" labelNp="म हुँ">
                <SelectField
                  name="role" value={formData.role} onChange={handleChange}
                  placeholder="Role" placeholderNp="भूमिका"
                  options={[
                    { value: 'customer', en: 'Customer',  np: 'ग्राहक'    },
                    { value: 'provider', en: 'Provider',  np: 'प्रदायक'   },
                  ]}
                />
              </Field>
              <Field label="Gender" labelNp="लिङ्ग">
                <SelectField
                  name="gender" value={formData.gender} onChange={handleChange}
                  placeholder="Select" placeholderNp="छान्नुस्"
                  options={[
                    { value: 'male',   en: 'Male',   np: 'पुरुष'   },
                    { value: 'female', en: 'Female', np: 'महिला'   },
                    { value: 'other',  en: 'Other',  np: 'अन्य'    },
                  ]}
                />
              </Field>
            </div>

            {/* City */}
            <Field label="City" labelNp="सहर">
              <SelectField
                name="city" value={formData.city} onChange={handleChange}
                placeholder="Select your city" placeholderNp="आफ्नो सहर छान्नुस्"
                options={CITIES.map(c => ({ value: c.en, en: c.en, np: c.np }))}
              />
            </Field>

            {/* Skills — provider only */}
            {formData.role === 'provider' && (
              <div>
                <label style={{
                  fontFamily: T.fontHead, fontWeight: 600, fontSize: 13,
                  color: T.text, display: 'flex', alignItems: 'center', gap: 6,
                  marginBottom: 10,
                }}>
                  Your Services
                  <span style={{ fontFamily: T.fontNp, fontWeight: 400, fontSize: 12, color: T.sub }}>
                    तपाईंका सेवाहरू
                  </span>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {SERVICE_SKILLS.map(skill => {
                    const active = formData.skills.includes(skill.id)
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        className="skill-btn"
                        onClick={() => toggleSkill(skill.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: `1.5px solid ${active ? T.crimson : T.border}`,
                          background: active ? 'rgba(192,57,43,0.06)' : T.surface,
                          cursor: 'pointer',
                          fontFamily: T.fontHead, fontSize: 12, fontWeight: 600,
                          color: active ? T.crimson : T.sub,
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 15 }}>{skill.icon}</span>
                        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                          <span>{skill.en}</span>
                          <span style={{ fontFamily: T.fontNp, fontWeight: 400, fontSize: 10, color: active ? T.crimson : T.dis }}>
                            {skill.np}
                          </span>
                        </span>
                        {active && (
                          <span style={{ marginLeft: 'auto', color: T.crimson }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M20 6L9 17l-5-5" stroke={T.crimson} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {formData.skills.length > 0 && (
                  <p style={{
                    fontSize: 12, color: T.crimson, marginTop: 8, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke={T.crimson} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {formData.skills.length} service{formData.skills.length > 1 ? 's' : ''} selected
                    {' '}/ {formData.skills.length} सेवा छनोट
                  </p>
                )}
              </div>
            )}

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
                ? 'Creating account…  /  खाता बनाउँदै…'
                : 'Create Account  /  खाता बनाउनुहोस्'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 18px' }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 11, color: T.dis, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: T.sub, margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: T.crimson, fontWeight: 700, textDecoration: 'none',
              borderBottom: `1px solid transparent`,
              transition: 'border-color 150ms',
            }}
              onMouseEnter={e => e.target.style.borderBottomColor = T.crimson}
              onMouseLeave={e => e.target.style.borderBottomColor = 'transparent'}
            >
              Sign in  /  लग इन गर्नुहोस्
            </Link>
          </p>

          {/* Footer note */}
          <p style={{
            textAlign: 'center', fontSize: 11, color: T.dis,
            margin: '16px 0 0', fontFamily: T.fontNp
          }}>
            नेपालभरका ५०,००० परिवारको भरोसा
          </p>
        </div>

        {/* Bottom Dhaka stripe */}
        <DhakaAccent />
      </div>
    </div>
  )
}