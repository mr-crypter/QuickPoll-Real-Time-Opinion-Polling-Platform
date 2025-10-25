'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface WebSocketMessage {
  type: 'vote_update' | 'like_update' | 'new_poll'
  poll_id?: string
  options?: Array<{ id: string; text: string; votes: number }>
  total_votes?: number
  likes?: number
  poll?: any
}

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isConnecting = false

    const connectWebSocket = () => {
      if (isConnecting) return
      isConnecting = true

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
      const ws = new WebSocket(`${wsUrl}/ws/general`)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        isConnecting = false
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          switch (message.type) {
            case 'vote_update':
              if (message.poll_id && message.options && message.total_votes !== undefined) {
                // Update the specific poll in the cache
                queryClient.setQueryData(['polls'], (oldData: any) => {
                  if (!oldData) return oldData
                  return oldData.map((poll: any) => 
                    poll.id === message.poll_id 
                      ? { ...poll, options: message.options, total_votes: message.total_votes }
                      : poll
                  )
                })
              }
              break
              
            case 'like_update':
              if (message.poll_id && message.likes !== undefined) {
                queryClient.setQueryData(['polls'], (oldData: any) => {
                  if (!oldData) return oldData
                  return oldData.map((poll: any) => 
                    poll.id === message.poll_id 
                      ? { ...poll, likes: message.likes }
                      : poll
                  )
                })
              }
              break
              
            case 'new_poll':
              if (message.poll) {
                queryClient.setQueryData(['polls'], (oldData: any) => {
                  if (!oldData) return [message.poll, ...oldData]
                  return [message.poll, ...oldData]
                })
              }
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...')
        isConnecting = false
        reconnectTimeout = setTimeout(connectWebSocket, 5000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        isConnecting = false
      }

      wsRef.current = ws
    }

    // Add a small delay before attempting to connect
    const initialTimeout = setTimeout(connectWebSocket, 1000)

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      clearTimeout(initialTimeout)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [queryClient])

  return wsRef.current
}
