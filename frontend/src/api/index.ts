import axios from 'axios';
import { type Trend } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const getTrends = async (domains?: string[], stages?: string[]): Promise<Trend[]> => {
  const response = await api.get('/trends', {
    params: { 
      domains: domains?.join(','), 
      stages: stages?.join(',') 
    },
  });
  return response.data;
};

export const getDomains = async (): Promise<{name: string, count: number}[]> => {
  const response = await api.get('/domains');
  return response.data;
};

export const getStages = async (): Promise<{name: string, count: number}[]> => {
  const response = await api.get('/stages');
  return response.data;
};

export const searchTrends = async (q: string): Promise<Trend[]> => {
  const response = await api.get('/search', {
    params: { q },
  });
  return response.data;
};

export const triggerPipeline = async (): Promise<{ status: string; message: string }> => {
  const response = await api.post('/run-pipeline');
  return response.data;
};

export const getPipelineStatus = async (): Promise<{ running: boolean }> => {
  const response = await api.get('/pipeline-status');
  return response.data;
};

export default api;
