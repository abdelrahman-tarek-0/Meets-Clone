import './App.css'

import { useState, useEffect, useRef } from 'react'
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

   const [users, setUsers] = useState<User[]>([])

   const usersRef = useRef<User[]>(users)

   useEffect(() => {
      usersRef.current = users
   }, [users])

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

   useEffect(() => {
      if (!socket || !roomID) return;
    
      socket.emit('join-room', roomID);
    
      const handleRoomUsers = (roomUsers: User[]) => {
        setLoading(false);
    
        setUsers((prevUsers) => {
          return roomUsers.map((user) => ({
            ...user,
            connections: prevUsers.find((u) => u.id === user.id)?.connections || {},
          }));
        });
    
        roomUsers.forEach((user) => {
          if (user.id === socket.id) return;
    
          const connectionId = Math.random().toString(36).substr(2, 9);
    
          socket.emit(
            'call',
            { user: user.id, id: connectionId },
            () => {
              const peer = webRTChandler({
                connectionId,
                initiator: true,
                localStream,
                socket,
                target: user.id,
                updateUsers: (updatedUsers) =>
                  setUsers(() => updatedUsers),
                getUsers: () => usersRef.current,
              });
    
              setUsers((prevUsers) =>
                prevUsers.map((u) =>
                  u.id === user.id
                    ? {
                        ...u,
                        connections: {
                          ...u.connections,
                          [connectionId]: peer,
                        },
                      }
                    : u
                )
              );
            }
          );
        });
      };
    
      // Other handlers...
      const handleCall = ({ caller, id }: { caller: string; id: string }) => {
        setUsers((prevUsers) => {
          const user = prevUsers.find((u) => u.id === caller);
          if (!user) return prevUsers;
    
          const peer = webRTChandler({
            connectionId: id,
            initiator: false,
            localStream,
            socket,
            target: caller,
            updateUsers: (updatedUsers) =>
              setUsers(() => updatedUsers),
            getUsers: () => usersRef.current,
          });
    
          return prevUsers.map((u) =>
            u.id === caller
              ? {
                  ...u,
                  connections: {
                    ...u.connections,
                    [id]: peer,
                  },
                }
              : u
          );
        });
      };
    
      const handleSignal = ({ caller, signal, id }: { caller: string; signal: any; id: string }) => {
        setUsers((prevUsers) => {
          const user = prevUsers.find((u) => u.id === caller);
          if (!user) return prevUsers;
    
          const peer = user.connections?.[id];
          if (peer) peer.signal(signal);
    
          return prevUsers;
        });
      };
    
      const handleUserConnected = (newUser: User) => {
        setUsers((prevUsers) => [...prevUsers, newUser]);
      };
    
      const handleUserDisconnected = (disconnectedUser: User) => {
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u.id !== disconnectedUser.id)
        );
      };
    
      socket.on('room-users', handleRoomUsers);
      socket.on('call', handleCall);
      socket.on('signal', handleSignal);
      socket.on('user-connected', handleUserConnected);
      socket.on('user-disconnected', handleUserDisconnected);
    
      return () => {
        socket.emit('leave-room', roomID);
        socket.off('room-users', handleRoomUsers);
        socket.off('call', handleCall);
        socket.off('signal', handleSignal);
        socket.off('user-connected', handleUserConnected);
        socket.off('user-disconnected', handleUserDisconnected);
      };
    }, [socket, roomID]);
    
   useEffect(() => {
      if (!error) return
      if (error !== 'Disconnected') toast.error(error)
      setSubmitted(false)
   }, [error])

   useEffect(() => {
      console.log('Users:', users.length)
   }, [users])

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
