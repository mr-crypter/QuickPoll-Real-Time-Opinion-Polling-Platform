'use client'

import { useState } from 'react'
import { Heart, BarChart3, Users } from 'lucide-react'
import { Poll } from '@/types'

interface PollCardProps {
  poll: Poll
  onVote: (pollId: string, optionId: string) => void
  onLike: (pollId: string) => void
  onViewDetails: () => void
}

export function PollCard({ poll, onVote, onLike, onViewDetails }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)

  const handleVote = (optionId: string) => {
    if (selectedOption) return // Already voted
    setSelectedOption(optionId)
    onVote(poll.id, optionId)
  }

  const handleLike = () => {
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    onLike(poll.id)
  }

  const getPercentage = (votes: number) => {
    if (poll.total_votes === 0) return 0
    return Math.round((votes / poll.total_votes) * 100)
  }

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {poll.question}
        </h3>
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
            isLiked 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          {poll.likes}
        </button>
      </div>

      <div className="space-y-3 mb-4">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes)
          const isSelected = selectedOption === option.id
          const hasVotes = option.votes > 0

          return (
            <div key={option.id} className="relative">
              <button
                onClick={() => handleVote(option.id)}
                disabled={selectedOption !== null}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : selectedOption !== null
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.text}</span>
                  <span className="text-sm text-gray-600">
                    {option.votes} vote{option.votes !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {hasVotes && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {poll.total_votes} total votes
          </div>
        </div>
        <button
          onClick={onViewDetails}
          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
        >
          <BarChart3 className="h-4 w-4" />
          View Details
        </button>
      </div>
    </div>
  )
}
