import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

// ─── Markdown-like renderer
function MessageContent({ content }) {
  const parts = content.split(/(\*\*[^*]+\*\*|\/products\/[^\s\n]+)/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('/products/'))
          return (
            <a key={i} href={part} className="text-orange-500 underline text-xs">
              Xem sản phẩm →
            </a>
          )
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

export default function AiChatWidget() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [view, setView] = useState('chat')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && user) {
      api.get('/chat/sessions')
        .then(res => {
          setSessions(res.data)
          if (!activeSession && res.data.length > 0) {
            handleSelectSession(res.data[0])
          }
        })
        .catch(console.error)
    }
  }, [open])

  const handleOpen = () => {
    if (!user) { navigate('/login'); return }
    setOpen(true)
  }

  const handleSelectSession = async (session) => {
    setActiveSession(session)
    setView('chat')
    setLoadingMessages(true)
    try {
      const res = await api.get(`/chat/sessions/${session.id}/messages`)
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleNewSession = async () => {
    try {
      const res = await api.post('/chat/sessions')
      setSessions(prev => [res.data, ...prev])
      setActiveSession(res.data)
      setMessages([])
      setView('chat')
      setTimeout(() => inputRef.current?.focus(), 100)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation()
    if (!window.confirm('Xóa cuộc trò chuyện này?')) return
    try {
      await api.delete(`/chat/session/${sessionId}`)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      if (activeSession?.id === sessionId) {
        setActiveSession(null)
        setMessages([])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || streaming) return
    if (!activeSession) { await handleNewSession(); return }

    const userMessage = input.trim()
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', content: userMessage, createdAt: new Date().toISOString() }
    const aiMsgId = Date.now() + 1
    const aiMsg = { id: aiMsgId, role: 'assistant', content: '', createdAt: new Date().toISOString(), streaming: true }

    setMessages(prev => [...prev, userMsg, aiMsg])
    setStreaming(true)

    try {
      const token = sessionStorage.getItem('accessToken')
      const controller = new AbortController()
      abortRef.current = controller

      const response = await fetch(
        `http://localhost:9090/api/chat/session/${activeSession.id}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ message: userMessage }),
          signal: controller.signal,
        }
      )

      if (!response.ok) throw new Error('Stream failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      let done = false

      while (!done) {
        const { done: readerDone, value } = await reader.read()
        if (readerDone) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // giữ dòng chưa hoàn chỉnh

        for (const line of lines) {
          const trimmed = line.trim()

          // Bỏ qua dòng trống và event name
          if (!trimmed || trimmed.startsWith('event:')) continue

          if (trimmed.startsWith('data:')) {
            const data = trimmed.slice(5).trim()

            if (data === '[DONE]') {
              done = true
              // Refresh session list để cập nhật title
              api.get('/chat/sessions').then(res => setSessions(res.data)).catch(() => {})
              break
            }

            // Bỏ qua null hoặc rỗng
            if (!data || data === 'null') continue

            fullContent += data
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, content: fullContent } : m
            ))
          }
        }
      }

      // Đánh dấu hết streaming
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, streaming: false } : m
      ))

    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: 'Có lỗi xảy ra, vui lòng thử lại.', streaming: false }
            : m
        ))
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {!open && (
          <div className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 shadow-md whitespace-nowrap">
            ShopVN - Trợ lý mua sắm AI 🛍️
          </div>
        )}
        <button
          onClick={open ? () => setOpen(false) : handleOpen}
          className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl border-0 cursor-pointer transition flex items-center justify-center text-2xl"
        >
          {open ? '✕' : '🤖'}
        </button>
      </div>

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <p className="text-white font-bold text-sm">Trợ lý AI ShopVN</p>
                <p className="text-orange-100 text-[10px]">
                  {activeSession ? activeSession.title : 'Tư vấn mua sắm thông minh'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView(v => v === 'sessions' ? 'chat' : 'sessions')}
                className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-sm"
                title="Lịch sử trò chuyện"
              >
                📋
              </button>
              <button
                onClick={handleNewSession}
                className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer text-sm"
                title="Cuộc trò chuyện mới"
              >
                ✏️
              </button>
            </div>
          </div>

          {view === 'sessions' ? (
            <div className="flex-1 overflow-y-auto">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-2">
                Lịch sử trò chuyện
              </p>
              {sessions.length === 0 ? (
                <p className="text-xs text-gray-400 px-4">Chưa có cuộc trò chuyện nào</p>
              ) : (
                sessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer transition border-b border-gray-50 last:border-0 ${
                      activeSession?.id === session.id ? 'bg-orange-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${activeSession?.id === session.id ? 'text-orange-500' : 'text-gray-700'}`}>
                        {session.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(session.updatedAt || session.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <button
                      onClick={e => handleDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 bg-transparent border-0 cursor-pointer text-xs ml-2 shrink-0"
                    >
                      🗑
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {loadingMessages ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-orange-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-2xl mb-2">👋</p>
                    <p className="text-xs text-gray-500 font-medium">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                    <p className="text-[10px] text-gray-400 mt-1">Hỏi tôi về sản phẩm, thời trang, giá cả...</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                      {['Áo phù hợp đi biển?', 'Giày dưới 500k?', 'Outfit đi làm?'].map(q => (
                        <button
                          key={q}
                          onClick={() => { setInput(q); inputRef.current?.focus() }}
                          className="text-[10px] bg-orange-50 text-orange-500 border border-orange-200 rounded-full px-2.5 py-1 cursor-pointer hover:bg-orange-100 transition"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs shrink-0 mt-0.5">
                          🤖
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                      }`}>
                        {msg.role === 'assistant'
                          ? <MessageContent content={msg.content} />
                          : msg.content
                        }
                        {msg.streaming && (
                          <span className="inline-block w-1 h-3 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 p-2.5">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    disabled={streaming}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-400 resize-none disabled:opacity-50 max-h-24"
                  />
                  {streaming ? (
                    <button
                      onClick={() => abortRef.current?.abort()}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-xl border-0 cursor-pointer transition shrink-0"
                    >
                      ⏹
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-2 rounded-xl border-0 cursor-pointer transition shrink-0 disabled:opacity-40"
                    >
                      ➤
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}