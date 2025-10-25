'use client'

import { useState } from 'react'
import { X, Heart, Users, BarChart3 } from 'lucide-react'
import { Poll } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface PollDetailModalProps {
  poll: Poll
  onClose: () => void
  onVote: (pollId: string, optionId: string) => void
  onLike: (pollId: string) => void
}

export function PollDetailModal({ poll, onClose, onVote, onLike }: PollDetailModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)

  const handleVote = (optionId: string) => {
    if (selectedOption) return // Already voted
    setSelectedOption(optionId)
    onVote(poll.id, optionId)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(poll.id)
  }

  const getPercentage = (votes: number) => {
    if (poll.total_votes === 0) return 0
    return Math.round((votes / poll.total_votes) * 100)
  }

  // Prepare data for charts
  const pieData = poll.options.map(option => ({
    name: option.text,
    value: option.votes,
    percentage: getPercentage(option.votes)
  }))

  const barData = poll.options.map(option => ({
    option: option.text,
    votes: option.votes,
    percentage: getPercentage(option.votes)
  }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Poll Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{poll.question}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {poll.total_votes} total votes
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {poll.likes} likes
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Created {new Date(poll.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Voting Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Cast Your Vote</h4>
              <div className="space-y-3">
                {poll.options.map((option) => {
                  const percentage = getPercentage(option.votes)
                  const isSelected = selectedOption === option.id
                  const hasVotes = option.votes > 0

                  return (
                    <div key={option.id} className="relative">
                      <button
                        onClick={() => handleVote(option.id)}
                        disabled={selectedOption !== null}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : selectedOption !== null
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{option.text}</span>
                          <span className="text-sm text-gray-600">
                            {option.votes} vote{option.votes !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {hasVotes && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{percentage}%</div>
                          </div>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'} ({poll.likes})
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Results</h4>
              
              {poll.total_votes > 0 ? (
                <div className="space-y-6">
                  {/* Pie Chart */}
                  <div>
                    <h5 className="text-md font-medium text-gray-700 mb-3">Vote Distribution</h5>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div>
                    <h5 className="text-md font-medium text-gray-700 mb-3">Vote Count</h5>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="option" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="votes" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No votes yet. Be the first to vote!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
