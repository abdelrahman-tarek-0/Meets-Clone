import './App.css'

import { useState, useEffect } from 'react'
import useLocalStorage from 'use-local-storage'
import { toast } from 'sonner'

import { motion } from 'framer-motion'

import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import LoginCard from '@/components/LoginCard'
import Loader from '@/components/Loader'

import useSocketConnection from './hooks/useSocketConnection'

function App() {
   const [roomID, setRoomID] = useLocalStorage('last-room-id', '')
   const [name, setName] = useLocalStorage('client-name', '')
   const [submitted, setSubmitted] = useState(false)
   const [loading, setLoading] = useState(false)
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
         console.log(users)
         setLoading(false)
      })
   }, [socket])

   useEffect(() => {
      if (!error) return
      toast.error(error)
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
               <Card className="w-[350px]">
                  <CardHeader>
                     <CardTitle>Chat Room</CardTitle>
                     <CardDescription>
                        You have successfully joined the chat room
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                           <p className="font-semibold">Room ID</p>
                           <p className="text-gray-600">{roomID}</p>
                        </div>
                        <div className="flex justify-between items-center">
                           <p className="font-semibold">Name</p>
                           <p className="text-gray-600">{name}</p>
                        </div>
                     </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                     <Button
                        onClick={() => {
                           setSubmitted(false)
                        }}
                     >
                        Leave
                     </Button>
                  </CardFooter>
               </Card>
            </motion.div>
         )}
         <Toaster />
      </main>
   )
}

export default App
