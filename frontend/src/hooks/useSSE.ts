import { useCallback, useRef } from 'react'
import { API_URL } from '../lib/api'

export const useSSE = () => {
  const esRef = useRef<EventSource | null>(null)

  const streamQuery = useCallback(
    (question: string, sessionId: string, onChunk: (chunk: string) => void, onDone: () => void) => {
      if (esRef.current) esRef.current.close()

      // POST via fetch with streaming
      const controller = new AbortController()
      esRef.current = null

      fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ question, session_id: sessionId }),
        signal: controller.signal,
      })
        .then(async (res) => {
          const reader = res.body?.getReader()
          const decoder = new TextDecoder()
          if (!reader) { onDone(); return }

          while (true) {
            const { done, value } = await reader.read()
            if (done) { onDone(); break }
            const text = decoder.decode(value)
            // Parse SSE lines
            const lines = text.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') { onDone(); return }
                try {
                  const parsed = JSON.parse(data)
                  onChunk(parsed.content ?? parsed)
                } catch {
                  onChunk(data)
                }
              }
            }
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') onDone()
        })

      return () => controller.abort()
    },
    []
  )

  const cancel = useCallback(() => {
    if (esRef.current) { esRef.current.close(); esRef.current = null }
  }, [])

  return { streamQuery, cancel }
}
