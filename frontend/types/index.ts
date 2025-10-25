export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  likes: number
  created_at: string
  total_votes: number
}

export interface CreatePollRequest {
  question: string
  options: string[]
}

export interface VoteRequest {
  option_id: string
  user_id?: string
}

export interface LikeRequest {
  user_id?: string
}
