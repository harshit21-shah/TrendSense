import axios from 'axios'
import { MOCK_TRENDS, MOCK_BRIEF, MOCK_DOMAINS } from './mockData'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
})

const isMock = () => import.meta.env.VITE_USE_MOCK === 'true'

export const fetchTrends = async (params: Record<string, string> = {}) => {
  try {
    const { data } = await api.get('/trends', { params })
    return data
  } catch {
    let results = MOCK_TRENDS
    if (params.domain) results = results.filter(t => t.domain === params.domain)
    if (params.stage) results = results.filter(t => t.stage?.toLowerCase() === params.stage.toLowerCase())
    return results
  }
}

export const fetchTrendById = async (id: string) => {
  try {
    const { data } = await api.get(`/trends/${id}`)
    return data
  } catch {
    return MOCK_TRENDS.find(t => String(t.id) === id) ?? MOCK_TRENDS[0]
  }
}

export const fetchDomains = async (): Promise<string[]> => {
  try {
    const { data } = await api.get('/domains')
    return data
  } catch {
    return MOCK_DOMAINS
  }
}

export const fetchBrief = async () => {
  try {
    const { data } = await api.get('/brief/today')
    return data
  } catch {
    return MOCK_BRIEF
  }
}

export const fetchTimeline = async (topic: string) => {
  try {
    const { data } = await api.get(`/timeline/${encodeURIComponent(topic)}`)
    return data
  } catch {
    // Generate mock timeline for the topic
    const points = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      score: Math.max(5, Math.min(95, 30 + i * 4 + (Math.random() - 0.3) * 15)),
    }))
    return { topic, data_points: points }
  }
}

export const triggerPipeline = async () => {
  try {
    const { data } = await api.post('/admin/run-pipeline')
    return data
  } catch {
    return { message: 'Pipeline triggered (mock)', status: 'started' }
  }
}

export const fetchPipelineStatus = async () => {
  try {
    const { data } = await api.get('/pipeline-status')
    return data
  } catch {
    return { running: false }
  }
}

export { isMock }
