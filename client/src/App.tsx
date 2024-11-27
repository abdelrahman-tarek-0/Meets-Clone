import './App.css'

import { useState, useEffect } from 'react'
import useLocalStorage from 'use-local-storage'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import LoginCard from '@/components/LoginCard'
import Room from '@/components/Room'
import Loader from '@/components/Loader'
import useSocketConnection from '@/hooks/useSocketConnection'
import { getMediaStream } from '@/lib/utils'
import RoomsTable from '@/components/RoomsTable'

function App() {
   const [roomID, setRoomID] = useLocalStorage('last-room-id', '')
   const [name, setName] = useLocalStorage('client-name', '')
   const [currentPage, setCurrentPage] = useState('login')

   const [loading, setLoading] = useState(false)

   const [connectSocket, setConnectSocket] = useState(false)

   const [localStream, setLocalStream] = useState<MediaStream | undefined>(
      undefined
   )

   const handelLogin = (
      username: string,
      constraints: MediaStreamConstraints
   ) => {
      if(localStream) localStream.getTracks().forEach((track) => track.stop())

      getMediaStream(constraints).then((stream) => {
         setLocalStream(stream)
         setName(username)
         setCurrentPage('roomsTable')
         setConnectSocket(true)
      })
   }

   const handleJoinRoom = (roomID: string) => {
      setRoomID(roomID)
      setCurrentPage('room')
   }

   const { socket, error } = useSocketConnection({
      setLoading,
      name,
      connect: connectSocket,
   })

   const root = window.document.documentElement
   root.classList.remove('light', 'dark')
   root.classList.add('dark')

   useEffect(() => {
      if (!error) return
      if (error !== 'Disconnected') toast.error(error)
      setConnectSocket(false)
      setCurrentPage('login')
   }, [error])

   return (
      <main className="flex flex-col items-center justify-center min-h-screen">
         {currentPage === 'login' && !loading && (
            <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
               <LoginCard onSubmit={handelLogin} />
            </motion.div>
         )}

         {loading && <Loader />}

         {currentPage === 'roomsTable' && !loading && socket && (
            <motion.div
               initial={{ scale: 0.6 }}
               animate={{ scale: 1 }}
               className="sm:w-10/12 xm:w-full lg:w-9/12 md:w-full flex flex-col items-center justify-center"
            >
               <RoomsTable
                  onJoin={handleJoinRoom}
                  setCurrentPage={setCurrentPage}
               />
            </motion.div>
         )}

         {currentPage === 'room' && !loading && socket && (
            <motion.div
               initial={{ scale: 0.6 }}
               animate={{ scale: 1 }}
               className="sm:w-10/12 xm:w-full lg:w-9/12 md:w-full"
            >
               <Room
                  roomID={roomID}
                  name={name}
                  setCurrentPage={setCurrentPage}
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
