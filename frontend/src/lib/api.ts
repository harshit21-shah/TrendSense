import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({ baseURL: API_URL })

export const fetchTrends = async (params: Record<string, string> = {}) => {
  const { data } = await api.get('/trends', { params })
  return data
}

export const fetchTrendById = async (id: string) => {
  const { data } = await api.get(`/trends/${id}`)
  return data
}

export const fetchDomains = async (): Promise<string[]> => {
  const { data } = await api.get('/domains')
  return data
}

export const fetchBrief = async () => {
  const { data } = await api.get('/brief/today')
  return data
}

export const fetchTimeline = async (topic: string) => {
  const { data } = await api.get(`/timeline/${encodeURIComponent(topic)}`)
  return data
}

export const triggerPipeline = async () => {
  const { data } = await api.post('/admin/run-pipeline')
  return data
}

export const fetchPipelineStatus = async () => {
  const { data } = await api.get('/pipeline-status')
  return data
}
