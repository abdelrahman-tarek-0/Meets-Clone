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

import { webRTChandler } from './utils/webRTC.helpers'
import useMediaStream from '@/hooks/useMediaStream'

function App() {
   const [roomID, setRoomID] = useLocalStorage('last-room-id', '')
   const [name, setName] = useLocalStorage('client-name', '')
   const [submitted, setSubmitted] = useState(false)
   const [loading, setLoading] = useState(false)

   // eslint-disable-next-line
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
      console.log('update socket')
      if (!socket) return
      socket.emit('join-room', roomID)

      socket.on('room-users', (usr) => {
         setLoading(false)
         updateUsers(usr)

         usr.forEach((user: User) => {
            if (user.id === socket.id) return
            const connectionId = Math.random().toString(36).substr(2, 9)

            socket.emit(
               'call',
               {
                  user: user.id,
                  id: connectionId,
               },
               () => {
                  console.log(
                     '[CALL]',
                     user.id,
                     'my local stream video tracks',
                     localStream?.getVideoTracks(),
                     'my local stream audio tracks',
                     localStream?.getAudioTracks()
                  )

                  const peer = webRTChandler({
                     connectionId,
                     initiator: true,
                     localStream,
                     socket,
                     target: user.id,
                     updateUsers,
                     getUsers: () => users,
                  })

                  updateUsers(
                     users.map((u) => {
                        if (u.id === user.id) {
                           return {
                              ...u,
                              connections: {
                                 ...u?.connections,
                                 [connectionId]: peer,
                              },
                           }
                        }
                        return u
                     })
                  )
               }
            )
         })
      })

      socket.on('call', ({ caller, id }) => {
         const user = users.find((u) => u.id === caller)
         if (!user) return

         console.log(
            '[CALL]',
            caller,
            'my local stream video tracks',
            localStream?.getVideoTracks(),
            'my local stream audio tracks',
            localStream?.getAudioTracks()
         )

         const peer = webRTChandler({
            connectionId: id,
            initiator: false,
            localStream,
            socket,
            target: caller,
            updateUsers,
            getUsers: () => users,
         })

         updateUsers(
            users.map((u) => {
               if (u.id === caller) {
                  return {
                     ...u,
                     connections: {
                        ...u?.connections,
                        [id]: peer,
                     },
                  }
               }
               return u
            })
         )
      })

      socket.on('signal', ({ caller, signal, id }) => {
         const user = users.find((u) => u.id === caller)
         if (!user) return

         console.log('[SIGNAL]', caller)

         const peer = user?.connections?.[id]
         if (!peer) return

         peer.signal(signal)
      })

      socket.on('user-connected', (user) => {
         console.log('User connected', user)
         updateUsers([...users, user])
      })

      socket.on('user-disconnected', (user) => {
         console.log('User disconnected', user)
         users.forEach((u) => {
            Object.values(u?.connections || {}).forEach((peer) => {
               if (peer.id === user.id) {
                  console.log('Closing peer connection', peer.destroy?.())
               }
            })
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
            <motion.div
               initial={{ scale: 0.6 }}
               animate={{ scale: 1 }}
               className="sm:w-10/12 xm:w-full lg:w-9/12 md:w-full"
            >
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
