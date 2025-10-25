'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Heart, BarChart3 } from 'lucide-react'
import { PollCard } from '@/components/PollCard'
import { CreatePollModal } from '@/components/CreatePollModal'
import { PollDetailModal } from '@/components/PollDetailModal'
import { useWebSocket } from '@/hooks/useWebSocket'
import { api } from '@/lib/api'
import { Poll } from '@/types'

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)
  const queryClient = useQueryClient()
  
  // Initialize WebSocket connection for real-time updates
  useWebSocket()

  const { data: polls, isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: api.getPolls,
  })

  const createPollMutation = useMutation({
    mutationFn: api.createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      setShowCreateModal(false)
    },
  })

  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      api.votePoll(pollId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })

  const likeMutation = useMutation({
    mutationFn: (pollId: string) => api.likePoll(pollId, "toggle"),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
      // Update the specific poll's like count in cache
      queryClient.setQueryData(['polls'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((poll: any) => 
          poll.id === data.poll_id 
            ? { ...poll, likes: data.likes }
            : poll
        )
      })
    },
  })

  const handleCreatePoll = (question: string, options: string[]) => {
    createPollMutation.mutate({ question, options })
  }

  const handleVote = (pollId: string, optionId: string) => {
    voteMutation.mutate({ pollId, optionId })
  }

  const handleLike = (pollId: string) => {
    likeMutation.mutate(pollId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading polls...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">QuickPoll</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Poll
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Live Polls</h2>
          <p className="text-gray-600">Vote on polls and see results update in real-time</p>
        </div>

        {polls && polls.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
                onLike={handleLike}
                onViewDetails={() => setSelectedPoll(poll)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No polls yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create a poll!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Poll
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreatePollModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePoll}
          isLoading={createPollMutation.isPending}
        />
      )}

      {selectedPoll && (
        <PollDetailModal
          poll={selectedPoll}
          onClose={() => setSelectedPoll(null)}
          onVote={handleVote}
          onLike={handleLike}
        />
      )}
    </div>
  )
}
