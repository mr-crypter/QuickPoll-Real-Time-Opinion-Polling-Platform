import axios from 'axios'
import { Poll, CreatePollRequest, VoteRequest, LikeRequest } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiClient = {
  // Poll endpoints
  getPolls: async (): Promise<Poll[]> => {
    const response = await api.get('/polls')
    return response.data
  },

  getPoll: async (id: string): Promise<Poll> => {
    const response = await api.get(`/polls/${id}`)
    return response.data
  },

  createPoll: async (data: CreatePollRequest): Promise<Poll> => {
    const response = await api.post('/polls', data)
    return response.data
  },

  votePoll: async (pollId: string, optionId: string): Promise<any> => {
    const response = await api.post(`/polls/${pollId}/vote`, { option_id: optionId })
    return response.data
  },

  likePoll: async (pollId: string, action: string = "toggle"): Promise<any> => {
    const response = await api.post(`/polls/${pollId}/like`, { action })
    return response.data
  },
}

export { apiClient as api }
