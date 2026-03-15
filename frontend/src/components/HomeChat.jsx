import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useLanguage } from '../context/LanguageContext'

// SERVICE ROUTING MAP
const SERVICE_ROUTES = {
  plumbing: { path: '/services?category=plumbing', label: 'Plumbers', icon: '🔧', categoryId: 1 },
  electrical: { path: '/services?category=electrical', label: 'Electricians', icon: '⚡', categoryId: 3 },
  cleaning: { path: '/services?category=cleaning', label: 'Cleaners', icon: '🧹', categoryId: 2 },
  beauty: { path: '/services?category=beauty', label: 'Beauty & Wellness', icon: '💆', categoryId: 4 },
  carpentry: { path: '/services?category=carpentry', label: 'Carpenters', icon: '🪚', categoryId: 5 },
  painting: { path: '/services?category=painting', label: 'Painters', icon: '🎨', categoryId: 6 },
  ac_repair: { path: '/services?category=ac_repair', label: 'AC & Appliances', icon: '❄️', categoryId: 7 },
  tutoring: { path: '/services?category=tutoring', label: 'Tutors', icon: '📚', categoryId: 8 },
  pest_control: { path: '/services?category=pest_control', label: 'Pest Control', icon: '🐛', categoryId: 9 },
  cooking: { path: '/services?category=cooking', label: 'Cooks', icon: '👨‍🍳', categoryId: 10 },
}

const HomeChat = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "👋 Hi! I'm your SewaSathi assistant. Tell me what home service you need and I'll find the right professionals for you!",
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
    '🔧 Pipe is leaking',
    '⚡ No electricity',
    '🧹 House cleaning',
    '💆 Beauty service',
    '🪚 Furniture repair',
    '❄️ AC not cooling',
  ]

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 
                    overflow-hidden max-w-2xl mx-auto">
      {/* Chat header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center 
                          justify-center text-2xl">
            🤖
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">SewaSathi Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <span className="text-purple-200 text-sm">Online — Ask me anything</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center 
                              justify-center text-sm mr-2 flex-shrink-0 mt-1">
                🤖
              </div>
            )}
            <div
              className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center 
                            justify-center text-sm mr-2">🤖</div>
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 
                            shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"/>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" 
                     style={{animationDelay: '0.1s'}}/>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                     style={{animationDelay: '0.2s'}}/>
              </div>
            </div>
          </div>
        )}

        {/* Route suggestion card */}
        {routeSuggestion && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center 
                            justify-center text-sm mr-2 flex-shrink-0">🤖</div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl 
                            rounded-bl-none p-3 max-w-xs">
              <p className="text-sm text-gray-700 mb-2 font-medium">
                I found the right professionals for you:
              </p>
              <button
                onClick={() => handleRoute(routeSuggestion)}
                className="w-full flex items-center gap-3 bg-purple-600 hover:bg-purple-700 
                           text-white rounded-xl px-4 py-3 transition-all font-semibold text-sm"
              >
                <span className="text-xl">{routeSuggestion.icon}</span>
                <div className="text-left">
                  <div>View {routeSuggestion.label}</div>
                  <div className="text-purple-200 text-xs font-normal">
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
      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => sendMessage(prompt.replace(/^[^\s]+\s/, ''))}
            className="flex-shrink-0 text-xs bg-purple-50 hover:bg-purple-100 
                       text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 
                       transition-all font-medium whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Describe your problem... (e.g. 'my pipe is leaking')"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 
                       text-white rounded-xl px-5 py-3 font-semibold text-sm 
                       transition-all flex items-center gap-2"
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
