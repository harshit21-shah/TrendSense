import { useCallback, useRef } from 'react'
import { API_URL } from '../lib/api'

const MOCK_RESPONSES: Record<string, string> = {
  default: `I'm currently running in **offline mode** — the backend isn't reachable right now.

Here's what I can tell you based on the loaded trend data:

- **Agentic AI Frameworks** (TVS: 91) are the top signal this week, with multi-agent systems replacing traditional SaaS workflows
- **AI-Native Code Review** (TVS: 88) is seeing rapid adoption — tools like CodeRabbit handling 70–80% of PR reviews autonomously
- **GLP-1 Secondary Effects** (TVS: 85) are creating downstream opportunities in food, fitness, and companion apps
- **On-Device LLM Inference** (TVS: 78) is enabling a new wave of privacy-first AI applications

To get live RAG-grounded answers, start the backend with \`docker-compose up\`.`,
}

function getMockResponse(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('ai') || q.includes('agent') || q.includes('llm') || q.includes('model')) {
    return `**AI Trends Analysis (Offline Mode)**

Based on current signals, the top AI trends are:

1. **Agentic AI Frameworks** (TVS: 91, Rising) — LangGraph and AutoGen replacing SaaS workflows. 60–80% operational overhead reduction reported by early adopters.

2. **On-Device LLM Inference** (TVS: 78, Emerging) — Llama 3.2 and Phi-3 Mini running on consumer hardware, enabling privacy-first apps.

3. **AI-Native Code Review** (TVS: 88, Rising) — 2–3x faster merge cycles, 70–80% of routine PR comments handled autonomously.

4. **Synthetic Data Generation** (TVS: 72, Emerging) — Unlocking AI in data-scarce domains like radiology and fraud detection.

**Investment angle:** The agentic layer is the highest-conviction bet — it's a $200B+ displacement of point-solution SaaS.`
  }
  if (q.includes('fintech') || q.includes('finance') || q.includes('crypto') || q.includes('stablecoin')) {
    return `**Fintech Trends Analysis (Offline Mode)**

Top fintech signals right now:

1. **Stablecoin B2B Payment Rails** (TVS: 67, Emerging) — USDC/USDT bypassing SWIFT for cross-border payments. 99% cost reduction, 3-second settlement.

2. **Embedded Finance APIs** (TVS: 79, Rising) — Vertical SaaS companies seeing 40–60% revenue uplift from embedded banking products.

**Key insight:** The $150T annual B2B cross-border payment market is being disrupted from the bottom up. The embedded finance infrastructure layer is a $30B+ opportunity.`
  }
  if (q.includes('health') || q.includes('glp') || q.includes('ozempic') || q.includes('longevity')) {
    return `**Health Tech Trends Analysis (Offline Mode)**

Top health signals:

1. **GLP-1 Secondary Market Disruption** (TVS: 85, Rising) — Ozempic/Wegovy reshaping consumer behavior. Gym memberships down 12%, new companion app category emerging. 15M+ current users growing to 50M+ by 2027.

2. **Longevity Science → Consumer Products** (TVS: 63, Emerging) — Biological age testing and senolytics crossing from research to mainstream. Bryan Johnson's Blueprint protocol creating cultural momentum.

**Opportunity:** GLP-1 companion app for meal planning and muscle preservation — the TAM is massive and growing fast.`
  }
  return MOCK_RESPONSES.default
}

async function* simulateStream(text: string): AsyncGenerator<string> {
  const words = text.split(' ')
  for (let i = 0; i < words.length; i++) {
    yield words[i] + (i < words.length - 1 ? ' ' : '')
    await new Promise(r => setTimeout(r, 18 + Math.random() * 25))
  }
}

export const useSSE = () => {
  const abortRef = useRef<AbortController | null>(null)
  const mockRef = useRef<boolean>(false)

  const streamQuery = useCallback(
    (question: string, sessionId: string, onChunk: (chunk: string) => void, onDone: () => void) => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller
      mockRef.current = false

      const runMock = async () => {
        mockRef.current = true
        const response = getMockResponse(question)
        for await (const chunk of simulateStream(response)) {
          if (controller.signal.aborted) return
          onChunk(chunk)
        }
        if (!controller.signal.aborted) onDone()
      }

      fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ question, session_id: sessionId }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) { runMock(); return }
          const reader = res.body?.getReader()
          const decoder = new TextDecoder()
          if (!reader) { runMock(); return }

          while (true) {
            const { done, value } = await reader.read()
            if (done) { onDone(); break }
            const text = decoder.decode(value)
            for (const line of text.split('\n')) {
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
          if (err.name !== 'AbortError') runMock()
        })

      return () => controller.abort()
    },
    []
  )

  const cancel = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null }
  }, [])

  return { streamQuery, cancel }
}
