import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AIChatWidget() {
  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your DA SHOP assistant. Ask me about our products, brands, sizing, or shipping." }
  ])
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const { data } = await axios.post(`${API_URL}/ai/chat`, {
        message: text,
        history: next.slice(1, -1),  // all except the greeting and current message
      })
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...next, { role: 'assistant', content: "Sorry, I'm having trouble right now. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col bg-white border border-[#E5E5E5] shadow-xl"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="bg-midnight px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-white font-black text-[11px] tracking-[0.15em] uppercase">DA SHOP Assistant</p>
              <p className="text-white/40 text-[10px] tracking-wide">Ask about products, shipping, sizing</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors text-xl leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-midnight text-white'
                      : 'bg-[#F7F7F7] text-midnight border border-[#E5E5E5]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F7F7F7] border border-[#E5E5E5] px-4 py-3 flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#E5E5E5] p-3 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              className="flex-1 border border-[#E5E5E5] px-3 py-2 text-sm text-midnight placeholder-gray-300 focus:outline-none focus:border-midnight transition-colors bg-white"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="bg-midnight text-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] hover:bg-midnight/80 transition-colors disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-midnight text-white w-14 h-14 flex items-center justify-center shadow-lg hover:bg-midnight/80 transition-colors"
        aria-label="Open chat"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        )}
      </button>
    </>
  )
}
