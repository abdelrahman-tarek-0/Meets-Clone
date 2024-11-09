import { useState } from 'react'

import useLocalStorage from 'use-local-storage'

import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle, 
} from '@/components/ui/card'
import './App.css'
import LoginCard from './components/LoginCard'

import { motion } from 'framer-motion'

function App() {
   const [roomID, setRoomID] = useLocalStorage('last-room-id', '')
   const [name, setName] = useLocalStorage('client-name', '')
   const [submitted, setSubmitted] = useState(false)
   console.log(import.meta.env.BASE_URL)
   const root = window.document.documentElement
   root.classList.remove('light', 'dark')
   root.classList.add('dark')

   return (
      <main className="flex flex-col items-center justify-center min-h-screen">
         {!submitted && (
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

         {submitted && (
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
      </main>
   )
}

export default App
