import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

// SERVICE ROUTING MAP
const SERVICE_ROUTES = {
  plumbing: { path: '/services?category=plumbing', label: 'Plumbers', categoryId: 1 },
  electrical: { path: '/services?category=electrical', label: 'Electricians', categoryId: 3 },
  cleaning: { path: '/services?category=cleaning', label: 'Cleaners', categoryId: 2 },
  beauty: { path: '/services?category=beauty', label: 'Beauty & Wellness', categoryId: 4 },
  carpentry: { path: '/services?category=carpentry', label: 'Carpenters', categoryId: 5 },
  painting: { path: '/services?category=painting', label: 'Painters', categoryId: 6 },
  ac_repair: { path: '/services?category=ac_repair', label: 'AC & Appliances', categoryId: 7 },
  tutoring: { path: '/services?category=tutoring', label: 'Tutors', categoryId: 8 },
  pest_control: { path: '/services?category=pest_control', label: 'Pest Control', categoryId: 9 },
  cooking: { path: '/services?category=cooking', label: 'Cooks', categoryId: 10 },
}

const HomeChat = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { isAuthenticated } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "👋 Hi! I'm your Garuda assistant. Tell me what home service you need and I'll find the right professionals for you!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [routeSuggestion, setRouteSuggestion] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { id: Date.now(), role: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setRouteSuggestion(null)

    try {
      const history = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.text }))

      const res = await client.post('/api/ai/chat', {
        messages: [...history, { role: 'user', content: text }],
        language
      })

      const { reply, route_to } = res.data?.data || {}

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: reply || "Let me help you find the right service!",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMsg])

      // Show routing suggestion
      if (route_to?.service && SERVICE_ROUTES[route_to.service]) {
        setRouteSuggestion({
          ...SERVICE_ROUTES[route_to.service],
          service: route_to.service,
          urgency: route_to.urgency
        })
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'I had trouble responding. Please try again or browse services below.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleRoute = (suggestion) => {
    navigate(suggestion.path)
  }

  const QUICK_PROMPTS = [
    'Pipe is leaking',
    'No electricity',
    'House cleaning',
    'Beauty service',
    'Furniture repair',
    'AC not cooling',
  ]

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border p-6 max-w-2xl mx-auto" style={{ borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-soft)', backgroundColor: 'var(--c-surface)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}>
            <img src="/garuda.jpeg" alt="Garuda" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: 'var(--t-primary)' }}>Garuda Assistant</h3>
            <p className="text-sm" style={{ color: 'var(--t-secondary)' }}>Sign in to chat with our AI helper</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: 'var(--c-primary)', color: '#fff', boxShadow: 'var(--shadow-soft)' }}
          >
            Login to chat
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-lg font-semibold border"
            style={{ borderColor: 'var(--c-border)', color: 'var(--t-primary)' }}
          >
            Create account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl overflow-hidden max-w-2xl mx-auto border" style={{ borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-strong)', backgroundColor: 'var(--c-surface)' }}>
      {/* Chat header */}
      <div className="p-5" style={{ background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent))' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl overflow-hidden flex items-center justify-center">
            <img src="/garuda.jpeg" alt="Garuda" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Garuda Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <span className="text-white/80 text-sm">Online — Ask me anything</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: 'var(--c-muted)' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-1"
                   style={{ backgroundColor: 'var(--c-accent)', boxShadow: 'var(--shadow-soft)' }}>
                <img src="/garuda.jpeg" alt="Garuda" className="w-full h-full object-cover" />
              </div>
            )}
            <div
              className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-white rounded-br-none'
                  : 'bg-white text-[var(--t-primary)] shadow-sm rounded-bl-none border'
              }`}
              style={
                msg.role === 'user'
                  ? { backgroundColor: 'var(--c-primary)' }
                  : { borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-soft)' }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2"
              style={{ backgroundColor: 'var(--c-accent)', boxShadow: 'var(--shadow-soft)' }}>
              <img src="/garuda.jpeg" alt="Garuda" className="w-full h-full object-cover" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border"
              style={{ borderColor: 'var(--c-border)' }}>
              <div className="flex gap-1">
             <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--c-primary)' }}/>
             <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--c-primary)', animationDelay: '0.1s' }}/>
             <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--c-primary)', animationDelay: '0.2s' }}/>
              </div>
            </div>
          </div>
        )}

        {/* Route suggestion card */}
        {routeSuggestion && (
          <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0"
                style={{ backgroundColor: 'var(--c-accent)', boxShadow: 'var(--shadow-soft)' }}>
                <img src="/garuda.jpeg" alt="Garuda" className="w-full h-full object-cover" />
              </div>
            <div className="rounded-2xl rounded-bl-none p-3 max-w-xs border"
                 style={{ backgroundColor: 'var(--c-muted)', borderColor: 'var(--c-accent)' }}>
              <p className="text-sm mb-2 font-medium" style={{ color: 'var(--t-primary)' }}>
                I found the right professionals for you:
              </p>
              <button
                onClick={() => handleRoute(routeSuggestion)}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all font-semibold text-sm text-white"
                style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}
              >
                <span className="text-xl">{routeSuggestion.icon}</span>
                <div className="text-left">
                  <div>View {routeSuggestion.label}</div>
                  <div className="text-white/80 text-xs font-normal">
                    {routeSuggestion.urgency === 'high' ? '🔴 Urgent' : '✅ Available now'}
                  </div>
                </div>
                <span className="ml-auto">→</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white" style={{ borderTop: '1px solid var(--c-border)' }}>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt.replace(/^[^\s]+\s/, ''))}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all font-medium whitespace-nowrap"
            style={{
              backgroundColor: 'var(--c-muted)',
              color: 'var(--c-primary)',
              borderColor: 'var(--c-accent)'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t" style={{ borderColor: 'var(--c-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Describe your problem... (e.g. 'my pipe is leaking')"
            className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-gray-50"
            style={{ borderColor: 'var(--c-border)', '--tw-ring-color': 'var(--c-primary)' }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="text-white rounded-xl px-5 py-3 font-semibold text-sm transition-all flex items-center gap-2"
            style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent 
                              rounded-full animate-spin"/>
            ) : (
              '→'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeChat
