import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, X, Minimize2, Maximize2, LogIn } from 'lucide-react'
import api from '../api/client'
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

export default function ChatBot() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "नमस्ते! मेरो नाम Garuda हो। मलाई तपाईंलाई घर सेवा बुकिङ गर्न मद्द गर्न खुसी छु। के तपाई कस्तो काम चाहिनुहुन्छ?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true)
      if (e.detail) {
        setInputValue(e.detail)
      }
    }
    window.addEventListener('openChatBot', handleOpen)
    return () => window.removeEventListener('openChatBot', handleOpen)
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages([...messages, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      // Call AI chat API
      const response = await api.post('/api/ai/chat', {
        messages: [
          ...messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: 'user', content: inputValue }
        ],
        language: 'nepali'
      })

      const { reply, route_to } = response.data?.data || {}

      const botMessage = {
        id: messages.length + 2,
        text: reply || 'Let me help you!',
        sender: 'bot',
        route: route_to,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: 'माफ गर्नुहोस्, कुरा गर्न असक्षम। कृपया पछि प्रयास गर्नुहोस्।',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Only allow authenticated users to use chatbot
  if (!isAuthenticated) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="fixed bottom-6 right-6 px-4 h-12 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 z-40"
        style={{
          backgroundColor: 'var(--c-primary)',
          color: '#fff',
          boxShadow: 'var(--shadow-strong)',
        }}
      >
        <LogIn size={18} />
        Sign in to chat
      </button>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 animate-bounce overflow-hidden"
        style={{
          background: '#fff',
          boxShadow: 'var(--shadow-strong)',
          border: '2px solid var(--c-primary)'
        }}
      >
        <img src="/garuda.jpeg" alt="Garuda" className="w-full h-full object-cover" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-screen md:h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-40 border"
         style={{ borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-strong)' }}>
      {/* Header */}
      <div
        className="text-white p-4 rounded-t-lg flex justify-between items-center"
        style={{ background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent))' }}
      >
        <div>
          <h3 className="font-bold text-lg">Garuda सहायक</h3>
          <p className="text-sm text-white/80">सवै समयमा उपलब्ध</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded"
          >
            {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: 'var(--c-muted)' }}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'text-white rounded-br-none'
                        : 'bg-white text-[var(--t-primary)] border rounded-bl-none'
                    }`}
                    style={
                      msg.sender === 'user'
                        ? { backgroundColor: 'var(--c-primary)' }
                        : { borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-soft)' }
                    }
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Route suggestion button */}
                {msg.route && SERVICE_ROUTES[msg.route.service] && (
                  <div className="flex justify-start mt-2">
                    <button
                      onClick={() => navigate(SERVICE_ROUTES[msg.route.service].path)}
                      className="flex items-center gap-2 text-white text-xs px-3 py-2 rounded-lg w-max transition-all"
                      style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}
                    >
                      {SERVICE_ROUTES[msg.route.service].icon}
                      View {SERVICE_ROUTES[msg.route.service].label} →
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-[var(--t-primary)] border px-4 py-2 rounded-lg rounded-bl-none" style={{ borderColor: 'var(--c-border)' }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--c-primary)' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--c-primary)', animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--c-primary)', animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-white rounded-b-lg flex gap-2" style={{ borderColor: 'var(--c-border)' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="सन्देश लेख्नुहोस्..."
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 text-sm"
              style={{ borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-soft)' , '--tw-ring-color': 'var(--c-primary)' }}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: 'var(--c-primary)', boxShadow: 'var(--shadow-soft)' }}
            >
              <Send size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
