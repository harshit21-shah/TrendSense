import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Zap, User, Bot, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useStore } from '../store/useStore'
import { useSSE } from '../hooks/useSSE'
import type { ChatMessage } from '../types'

const SUGGESTIONS = [
  "What's emerging in AI infrastructure this week?",
  "Which fintech trends should founders watch?",
  "What health tech signals are rising?",
  "Compare AI and crypto trend velocity",
]

function Message({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-indigo-600' : 'bg-white/[0.06] border border-white/[0.08]'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-indigo-400" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-white/[0.04] border border-white/[0.06] text-slate-300 rounded-tl-sm'
        }`}>
          {isUser ? (
            msg.content
          ) : (
            <div className="prose prose-invert prose-sm max-w-none
              prose-p:text-slate-300 prose-p:my-1
              prose-strong:text-white
              prose-a:text-indigo-400
              prose-code:text-indigo-300 prose-code:bg-white/[0.08] prose-code:px-1 prose-code:rounded
              prose-ul:my-1 prose-li:my-0.5 prose-li:text-slate-300
            ">
              <ReactMarkdown>{msg.content || '▋'}</ReactMarkdown>
            </div>
          )}
        </div>
        {msg.grounded_in !== undefined && msg.grounded_in > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <Zap size={9} className="text-indigo-500" />
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
  const { streamQuery } = useSSE()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const send = async (question: string) => {
    if (!question.trim() || streaming) return
    setInput('')
    setStreaming(true)

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }
    addMessage(userMsg)

    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    addMessage(aiMsg)

    let accumulated = ''
    streamQuery(
      question,
      sessionId,
      (chunk) => {
        accumulated += chunk
        updateLastMessage(accumulated)
      },
      () => setStreaming(false)
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Trend Chat</h1>
          <p className="text-slate-500 text-sm">Ask anything — answers grounded in real trend data</p>
        </div>
        {chatMessages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 text-slate-600 hover:text-red-400 text-xs transition-colors"
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
              <Bot size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-1">Ask about any trend</p>
              <p className="text-slate-600 text-sm">Responses are grounded in live trend data from Reddit, HN, and News</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-indigo-500/20 rounded-xl px-4 py-3 text-xs text-slate-400 hover:text-slate-200 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {chatMessages.map((msg) => <Message key={msg.id} msg={msg} />)}
          </AnimatePresence>
        )}
        {streaming && chatMessages[chatMessages.length - 1]?.role === 'assistant' && chatMessages[chatMessages.length - 1]?.content === '' && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <Loader2 size={13} className="text-indigo-400 animate-spin" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input) }}
          className="flex gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2 focus-within:border-indigo-500/40 transition-all"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about trends, signals, opportunities..."
            disabled={streaming}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all"
          >
            {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-700 mt-2">
          Powered by Groq Llama 3.1 · RAG over ChromaDB
        </p>
      </div>
    </div>
  )
}
