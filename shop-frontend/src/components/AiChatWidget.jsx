import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

// ─── Markdown-like renderer (FIXED: Link to Button & Clean URL)
function MessageContent({ content }) {
  // Regex bắt 3 nhóm: 1. In đậm (**), 2. Markdown Link ([text](url)), 3. Link thuần (http)
  const parts = content.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g);

  return (
    <span className="leading-relaxed block">
      {parts.map((part, i) => {
        // 1. Xử lý Chữ in đậm
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-black text-slate-800">
              {part.slice(2, -2)}
            </strong>
          );
        }

        // 2. Xử lý Link Markdown [Xem chi tiết](/products/abc) -> CHUYỂN THÀNH BUTTON
        if (part.startsWith('[') && part.includes('](')) {
          const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (match) {
            const rawLink = match[2];
            // Fix lỗi dư dấu ) hoặc . ở cuối link
            const cleanLink = rawLink.replace(/[).,]+$/, '');

            return (
              <a
                key={i}
                href={cleanLink}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[11px] font-black no-underline my-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 uppercase tracking-wider border-0"
              >
                <span>🛒</span> Xem sản phẩm
              </a>
            );
          }
        }

        // 3. Xử lý Link thuần (nếu có)
        if (part.startsWith('http')) {
          const cleanLink = part.replace(/[).,]+$/, '');
          return (
            <a
              key={i}
              href={cleanLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-4 py-2 rounded-xl text-[11px] font-black no-underline my-2 shadow-lg transition-all active:scale-95 uppercase tracking-wider"
            >
              <span>🔗</span> Xem ngay
            </a>
          );
        }

        // 4. Văn bản thường
        return (
          <span key={i} className="whitespace-pre-wrap text-slate-600">
            {part}
          </span>
        );
      })}
    </span>
  );
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

    const aiMsgId = Date.now() + 1
    setMessages(prev => [...prev, 
      { id: Date.now(), role: 'user', content: userMessage }, 
      { id: aiMsgId, role: 'assistant', content: '', streaming: true }
    ])
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

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data:') && !line.includes('[DONE]')) {
            const data = line.slice(5).trim()
            if (!data || data === 'null') continue
            fullContent += data
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, content: fullContent } : m
            ))
          }
        }
      }

      setMessages(prev => prev.map(m =>
        m.id === aiMsgId ? { ...m, streaming: false } : m
      ))

    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: 'Lỗi kết nối AI.', streaming: false } : m
        ))
      }
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!open && (
          <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 text-[10px] font-black text-slate-600 shadow-2xl uppercase tracking-widest animate-bounce">
            ShopVN AI Assistant ✨
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className={`w-16 h-16 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-0 cursor-pointer transition-all flex items-center justify-center text-3xl active:scale-90 ${
            open ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {open ? '✕' : '🤖'}
        </button>
      </div>

      {/* Main Chat Container - FIXED LAYOUT */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Premium Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 px-6 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-xl border border-white/10">🤖</div>
              <div>
                <p className="text-white font-black text-xs uppercase tracking-widest">ShopVN AI</p>
                <p className="text-indigo-200 text-[9px] font-bold uppercase truncate max-w-[150px]">
                  {activeSession ? activeSession.title : 'Tư vấn thông minh'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setView(v => v === 'sessions' ? 'chat' : 'sessions')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-white border-0 bg-transparent cursor-pointer transition-colors">📋</button>
              <button onClick={handleNewSession} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-white border-0 bg-transparent cursor-pointer transition-colors">➕</button>
            </div>
          </div>

          {/* Dynamic Content Area - FIXED SCROLLING */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfdfe] min-h-0">
            {view === 'sessions' ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Lịch sử trò chuyện</p>
                {sessions.map(s => (
                  <div key={s.id} onClick={() => handleSelectSession(s)} className={`group flex items-center justify-between px-4 py-3 cursor-pointer rounded-2xl transition-all ${activeSession?.id === s.id ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-white/60'}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-bold truncate ${activeSession?.id === s.id ? 'text-indigo-600' : 'text-slate-700'}`}>{s.title}</p>
                      <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-tighter">{new Date(s.updatedAt || s.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button onClick={e => handleDeleteSession(e, s.id)} className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all text-slate-300 border-0 bg-transparent cursor-pointer">🗑</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {loadingMessages ? (
                  <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">✨</div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Chào {user?.username}!</p>
                    <p className="text-[11px] text-slate-400 font-medium px-10 mt-2 leading-relaxed italic">Hỏi tôi bất cứ điều gì về sản phẩm hoặc phối đồ thời trang.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                      {msg.role === 'assistant' && <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-xs shrink-0 shadow-lg">🤖</div>}
                      <div className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-[13px] font-medium leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-sm' : 'bg-white text-slate-700 border-slate-100 rounded-tl-sm'}`}>
                        <MessageContent content={msg.content} />
                        {msg.streaming && <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-1 animate-pulse rounded-full align-middle" />}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <div className="p-5 bg-white border-t border-slate-50 shrink-0">
            <div className="flex items-end gap-3 bg-slate-50 rounded-[1.5rem] p-2 border border-slate-100 focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Đặt câu hỏi..."
                rows={1}
                disabled={streaming}
                className="flex-1 bg-transparent border-0 px-3 py-2 text-[13px] outline-none resize-none font-medium text-slate-700 max-h-32"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border-0 cursor-pointer shadow-lg flex items-center justify-center disabled:bg-slate-200 transition-all active:scale-90 shrink-0"
              >
                ➤
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase mt-3 tracking-widest">Powered by ShopVN RAG Engine</p>
          </div>
        </div>
      )}
    </>
  )
}