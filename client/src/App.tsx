import './App.css'

import { useState, useEffect } from 'react'
import useLocalStorage from 'use-local-storage'
import { toast } from 'sonner'

import { motion } from 'framer-motion'

import { Toaster } from '@/components/ui/sonner'

import LoginCard from '@/components/LoginCard'
import Room from '@/components/Room'

import Loader from '@/components/Loader'

import useSocketConnection from './hooks/useSocketConnection'

import type User from '@/types/User.type'

function App() {
   const [roomID, setRoomID] = useLocalStorage('last-room-id', '')
   const [name, setName] = useLocalStorage('client-name', '')
   const [submitted, setSubmitted] = useState(false)
   const [loading, setLoading] = useState(false)
   const [users, setUsers] = useState<User[]>([])

   const { socket, error } = useSocketConnection({
      setLoading,
      submitted,
      name,
   })

   const root = window.document.documentElement
   root.classList.remove('light', 'dark')
   root.classList.add('dark')

   useEffect(() => {
      if (!socket) return
      socket.emit('join-room', roomID)

      socket.on('room-users', (users) => {
         setLoading(false)
         setUsers(users)
      })

      socket.on('user-connected', (user) => {
         setUsers((prev) => [...prev, user])
      })

      socket.on('user-disconnected', (user) => {
         setUsers((prev) => prev.filter((u) => u.id !== user.id))
      })

      return () => {
         socket.emit('leave-room', roomID)
      }
   }, [socket])

   useEffect(() => {
      if (!error) return
      if (error !== 'Disconnected') toast.error(error)
      setSubmitted(false)
   }, [error])

   return (
      <main className="flex flex-col items-center justify-center min-h-screen">
         {!submitted && !socket && !loading && (
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
               <LoginCard
                  name={name}
                  setName={setName}
                  roomID={roomID}
                  setRoomID={setRoomID}
                  setSubmitted={setSubmitted}
               />
            </motion.div>
         )}

         {loading && <Loader />}

         {submitted && !loading && socket && (
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
               <Room
                  roomID={roomID}
                  name={name}
                  setSubmitted={setSubmitted}
                  users={users}
                  socket={socket}
               />
            </motion.div>
         )}
         <Toaster />
      </main>
   )
}

export default App
