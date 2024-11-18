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

import createWebRtcConnection from './utils/createWebRtcConnection'

function App() {
   const [roomID, setRoomID] = useLocalStorage('last-room-id', '')
   const [name, setName] = useLocalStorage('client-name', '')
   const [submitted, setSubmitted] = useState(false)
   const [loading, setLoading] = useState(false)
   let [users, setUsers] = useState<User[]>([])

   const { socket, error } = useSocketConnection({
      setLoading,
      submitted,
      name,
   })

   const root = window.document.documentElement
   root.classList.remove('light', 'dark')
   root.classList.add('dark')

   const updateUsers = (newUsers: User[]) => {
      setUsers(newUsers)
      users = newUsers
   }

   useEffect(() => {
      if (!socket) return
      socket.emit('join-room', roomID)

      socket.on('room-users', (usr) => {
         setLoading(false)
         updateUsers(usr)

         usr.forEach((user: User) => {
            if (user.id === socket.id) return

            const peer = createWebRtcConnection({
               onSignal: (signal) => {
                  console.log('[CALLING]', user.id)
                  socket.emit('call', {
                     user: user.id,
                     signal,
                  })
               },
               onConnect: () => {
                  console.log('[CONNECTED]', user.id)
                  peer.send('Hello')

                  updateUsers(
                     users.map((u) => {
                        if (u.id === user.id) {
                           return { ...u, isConnected: true }
                        }
                        return u
                     })
                  )
               },
               onClose: () => {
                  console.log('[CLOSED]', user.id)

                  updateUsers(
                     users.map((u) => {
                        if (u.id === user.id) {
                           return { ...u, peer: undefined, isConnected: false }
                        }
                        return u
                     })
                  )
               },
               onData: (data) => {
                  console.log('Data received', data)
               },
            })

            updateUsers(
               users.map((u) => {
                  if (u.id === user.id) {
                     return { ...u, peer }
                  }
                  return u
               })
            )
         })
      })

      socket.on('call', ({ caller, signal }) => {
         const user = users.find((u) => u.id === caller)
         if (!user) return
         console.log('[ANSWERING]', caller)

         const peer = createWebRtcConnection({
            initiator: false,
            onSignal: (signal) => {
               console.log('[ACCEPTING]', caller)
               socket.emit('answer', {
                  user: caller,
                  signal,
               })
            },
            onConnect: () => {
               console.log('[CONNECTED]', caller)
               setUsers((prev) =>
                  prev.map((u) => {
                     if (u.id === caller) {
                        return { ...u, isConnected: true }
                     }
                     return u
                  })
               )
            },
            onClose: () => {
               console.log('[CLOSED]', caller)
               setUsers((prev) =>
                  prev.map((u) => {
                     if (u.id === caller) {
                        return { ...u, peer: undefined, isConnected: false }
                     }
                     return u
                  })
               )
            },
            onData: (data) => {
               console.log('Data received', data)
            },
         })

         peer.signal(signal)

         updateUsers(
            users.map((u) => {
               if (u.id === caller) {
                  return { ...u, peer }
               }
               return u
            })
         )
      })

      socket.on('answer', ({ answerID, signal }) => {
         const user = users.find((u) => u.id === answerID)
         if (!user) return
         console.log('[ANSWERED]', answerID)
         console.log(user.peer?.signal)
         user.peer?.signal(signal)
      })

      socket.on('user-connected', (user) => {
         console.log('User connected', user)
         updateUsers([...users, user])
      })

      socket.on('user-disconnected', (user) => {
         console.log('User disconnected', user)
         users.forEach((u) => {
            if (u.id === user.id && u.peer) {
               console.log('Closing peer connection', u?.peer?.destroy?.())
            }
         })
         updateUsers(users.filter((u) => u.id !== user.id))
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
