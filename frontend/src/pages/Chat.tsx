import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Bot, User, Loader2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useStore } from '../store/useStore'
import { useSSE } from '../hooks/useSSE'
import type { ChatMessage } from '../types'

const SUGGESTIONS = [
  { icon: '🤖', text: "What's emerging in AI infrastructure this week?" },
  { icon: '💰', text: 'Which fintech trends should founders watch?' },
  { icon: '🏥', text: 'What health tech signals are rising right now?' },
  { icon: '📊', text: 'Compare AI and crypto trend velocity' },
]

function Message({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5`}
        style={isUser
          ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
          : { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
        {isUser ? <User size={12} className="text-white" /> : <Bot size={12} style={{ color: '#818cf8' }} />}
      </div>
      <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
          style={isUser
            ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: 'white', borderRadius: '16px 4px 16px 16px' }
            : { background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', color: '#cbd5e1', borderRadius: '4px 16px 16px 16px' }}>
          {isUser ? msg.content : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-p:text-slate-300 prose-strong:text-white prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-white/[0.08] prose-code:px-1 prose-code:rounded prose-ul:my-1 prose-li:text-slate-300">
              <ReactMarkdown>{msg.content || '▋'}</ReactMarkdown>
            </div>
          )}
        </div>
        {msg.grounded_in !== undefined && msg.grounded_in > 0 && (
          <span className="flex items-center gap-1 text-[10px]" style={{ color: '#475569' }}>
            <Sparkles size={9} style={{ color: '#6366f1' }} />
            Grounded in {msg.grounded_in} trend{msg.grounded_in !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function Chat() {
  const { chatMessages, sessionId, addMessage, updateLastMessage, clearChat } = useStore()
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { streamQuery } = useSSE()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const send = (question: string) => {
    if (!question.trim() || streaming) return
    setInput('')
    setStreaming(true)

    addMessage({ id: crypto.randomUUID(), role: 'user', content: question, timestamp: new Date() })
    addMessage({ id: crypto.randomUUID(), role: 'assistant', content: '', timestamp: new Date() })

    let acc = ''
    streamQuery(question, sessionId,
      chunk => { acc += chunk; updateLastMessage(acc) },
      () => { setStreaming(false); setTimeout(() => inputRef.current?.focus(), 100) }
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trend Intelligence Chat</h1>
          <p className="text-slate-600 text-xs mt-0.5">RAG-grounded answers from live trend data</p>
        </div>
        {chatMessages.length > 0 && (
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-red-400 transition-colors">
            <Trash2 size={12} /> Clear chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
            <div>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Bot size={28} style={{ color: '#818cf8' }} />
              </div>
              <p className="text-slate-300 font-semibold text-lg mb-1">Ask about any trend</p>
              <p className="text-slate-600 text-sm max-w-sm">
                Answers are grounded in real-time signals from Reddit, HackerNews, and NewsAPI
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTIONS.map(s => (
                <button key={s.text} onClick={() => send(s.text)}
                  className="text-left px-4 py-3 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                >
                  <span className="mr-2">{s.icon}</span>{s.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {chatMessages.map(msg => <Message key={msg.id} msg={msg} />)}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {streaming && chatMessages.at(-1)?.content === '' && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Loader2 size={12} style={{ color: '#818cf8' }} className="animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
              style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#6366f1' }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <form onSubmit={e => { e.preventDefault(); send(input) }}
          className="flex gap-2 p-2 rounded-2xl transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask about trends, signals, investment opportunities..."
            disabled={streaming}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-300 placeholder-slate-700 focus:outline-none disabled:opacity-50"
          />
          <button type="submit" disabled={!input.trim() || streaming}
            className="p-2.5 rounded-xl text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-800 mt-2">
          Powered by Groq Llama 3.1 70B · RAG over ChromaDB · Session-scoped memory
        </p>
      </div>
    </div>
  )
}
