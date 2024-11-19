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
import useMediaStream from '@/hooks/useMediaStream'

function App() {
   const [roomID, setRoomID] = useLocalStorage('last-room-id', '')
   const [name, setName] = useLocalStorage('client-name', '')
   const [submitted, setSubmitted] = useState(false)
   const [loading, setLoading] = useState(false)
   let [users, setUsers] = useState<User[]>([])

   const [streamConstraints, setStreamConstraints] =
      useState<MediaStreamConstraints>({ video: false, audio: false })

   const localStream = useMediaStream(streamConstraints)

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
               initiator: true,
               stream: localStream,
               onSignal: (signal) => {
                  socket.emit(signal.type === 'offer' ? 'call' : 'signal', {
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
                  console.log('[CLOSED]', user.id, peer.connected, peer?.id)

                  const connectedUser = users.find((u) => u.id === user.id)
                  // If the peer is not the same as the connected user's peer, return
                  if (connectedUser?.peer?.id !== peer.id) return

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
               onStream: (stream) => {
                  console.log('Stream received', stream)
                  updateUsers(
                     users.map((u) => {
                        if (u.id === user.id) {
                           return { ...u, stream }
                        }
                        return u
                     })
                  )
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

         const peer = createWebRtcConnection({
            initiator: false,
            stream: localStream,
            onSignal: (signal) => {
               socket.emit('signal', {
                  user: caller,
                  signal,
               })
            },
            onConnect: () => {
               console.log('[CONNECTED]', caller)

               updateUsers(
                  users.map((u) => {
                     if (u.id === caller) {
                        return { ...u, isConnected: true }
                     }
                     return u
                  })
               )
            },
            onClose: () => {
               console.log('[CLOSED]', caller, peer.connected, peer?.id)

               const connectedUser = users.find((u) => u.id === caller)
               if (connectedUser?.peer?.id !== peer.id) return

               updateUsers(
                  users.map((u) => {
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
            onStream: (stream) => {
               console.log('Stream received', stream)

               updateUsers(
                  users.map((u) => {
                     if (u.id === caller) {
                        return { ...u, stream }
                     }
                     return u
                  })
               )
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

      socket.on('signal', ({ caller, signal }) => {
         const user = users.find((u) => u.id === caller)
         if (!user) return
         console.log('[SIGNAL]', caller)
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
         socket.off('room-users')
         socket.off('call')
         socket.off('signal')
         socket.off('user-connected')
         socket.off('user-disconnected')
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
                  streamConstraints={streamConstraints}
                  setStreamConstraints={setStreamConstraints}
               />
            </motion.div>
         )}

         {loading && <Loader />}

         {submitted && !loading && socket && (
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} className='sm:w-10/12 xm:w-full lg:w-9/12 md:w-full'>
               <Room
                  roomID={roomID}
                  name={name}
                  setSubmitted={setSubmitted}
                  users={users}
                  localStream={localStream}
                  socket={socket}
               />
            </motion.div>
         )}


         <Toaster />
      </main>
   )
}

export default App
