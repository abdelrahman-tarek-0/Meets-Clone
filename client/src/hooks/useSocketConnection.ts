import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

const URL = import.meta.env.VITE_SERVER_URL

type UseSocketConnectionProps = {
   setLoading: (loading: boolean) => void
   submitted: boolean
   name: string
}

function useSocketConnection({
   setLoading,
   submitted,
   name,
}: UseSocketConnectionProps) {
   const [socket, setSocket] = useState<Socket | null>(null)
   const [error, setError] = useState<string | null>(null)

   useEffect(() => {
      if (submitted) {
         setLoading(true)
         setError(null)

         const socket = io(URL + `?name=${name}`)

         socket.on('connect', () => {
            console.log('[SOCKET]', 'connected', socket.id)
            setSocket(socket)
            setError(null)
            setLoading(false)
         })

         socket.on('error', (error) => {
            console.error('[SOCKET]', 'error', error)
            setLoading(false)
            setSocket(null)
            setError(error?.message || error)
         })

         socket.on('connect_error', () => {
            console.error('[SOCKET]', 'connection error')
            setLoading(false)
            setSocket(null)
            setError('Connection error')
         })

         socket.on('disconnect', () => {
            console.log('[SOCKET]', 'disconnected')
            setLoading(false)
            setSocket(null)
            setError('Disconnected')
         })

         return () => {
            console.log('[SOCKET-HOOK]', 'disconnecting')
            socket.disconnect()
            setSocket(null)
         }
      } else {
         setSocket(null)
      }
   }, [submitted])

   return {
      socket,
      error,
   }
}

export default useSocketConnection
