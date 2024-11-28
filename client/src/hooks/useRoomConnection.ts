import { useEffect, useState, useRef } from 'react'
import { webRTChandler } from '@/utils/webRTC.helpers'

import type { Socket } from 'socket.io-client'
import type User from '@/types/User.type'

import Connections from '@/global/UsersConnections'
import { toast } from 'sonner'

type RoomConnectionProps = {
   socket: Socket | null
   roomID: string
   localStream: MediaStream | undefined
}

function useRoomConnection({
   socket,
   roomID,
   localStream,
}: RoomConnectionProps) {
   const [users, setUsers] = useState<User[]>([])
   const usersRef = useRef<User[]>(users)

   useEffect(() => {
      console.log('Users:', users)
      console.log('Active Connections:', Connections.length)
      usersRef.current = users
   }, [users])

   const handelTrack =
      (userId: string) => (track: MediaStreamTrack, stream: MediaStream) => {
         let userStream = usersRef?.current?.find(
            (u) => u.id === userId
         )?.stream

         if (!userStream) {
            console.log('No stream found to insert track using stream received')
            userStream = stream
         }

         if (
            userStream?.id === stream.id &&
            userStream.getTracks().find((t) => t.id !== track.id)
         ) {
            console.log('Adding track to existing stream')
            userStream.addTrack(track)
         }

         setUsers((prevUsers) =>
            prevUsers.map((u) =>
               u.id === userId ? { ...u, stream: userStream } : u
            )
         )
      }

   useEffect(() => {
      if (!socket || !roomID) return

      socket.emit('join-room', roomID)

      const handleRoomUsers = (roomUsers: User[]) => {
         console.log('Room Users:', roomUsers)
         setUsers(roomUsers)

         roomUsers.forEach((user) => {
            if (user.id === socket.id) return
            const connectionId = Math.random().toString(36).substr(2, 9)

            socket.emit('call', { user: user.id, id: connectionId }, () => {
               const peer = webRTChandler({
                  connectionId,
                  initiator: true,
                  localStream,
                  socket,
                  target: user.id,
                  updateTargetUser: (updatedUser) => {
                     setUsers((prevUsers) =>
                        prevUsers.map((u) =>
                           u.id === user.id ? { ...u, ...updatedUser } : u
                        )
                     )
                  },
                  getUsers: () => usersRef.current,
                  handelTrack: handelTrack(user.id),
               })

               Connections.setConnection(user.id, connectionId, peer)
            })
         })
      }

      const handleCall = ({ caller, id }: { caller: string; id: string }) => {
         const peer = webRTChandler({
            connectionId: id,
            initiator: false,
            localStream,
            socket,
            target: caller,
            getUsers: () => usersRef.current,
            updateTargetUser: (updatedUser) => {
               setUsers((prevUsers) =>
                  prevUsers.map((u) =>
                     u.id === caller ? { ...u, ...updatedUser } : u
                  )
               )
            },
            handelTrack: handelTrack(caller),
         })

         Connections.setConnection(caller, id, peer)
      }

      const handleSignal = ({
         caller,
         signal,
         id,
      }: {
         caller: string
         signal: any
         id: string
      }) => {
         Connections.signalConnection(caller, id, signal)
      }

      const handleUserConnected = (newUser: User) => {
         setUsers((prevUsers) => [...prevUsers, newUser])
      }

      const handleUserDisconnected = (disconnectedUser: User) => {
         Connections.destroyUserConnections(disconnectedUser.id)
         setUsers((prevUsers) =>
            prevUsers.filter((u) => u.id !== disconnectedUser.id)
         )
      }

      const handelUserMessage = ({
         user,
         message,
         type,
      }: {
         user: User
         message: string
         type: string
      }) => {
         if (!user || !message) return

         if (type !== '/quite') {
            toast.success(`Message from ${user.name}: ${message}`)
         }
         setUsers((prevUsers) =>
            prevUsers.map((u) =>
               u.id === user.id
                  ? {
                       ...u,
                       message: {
                          text: message,
                          type: type || '/default',
                       },
                    }
                  : u
            )
         )
      }

      socket.on('room-users', handleRoomUsers)
      socket.on('call', handleCall)
      socket.on('signal', handleSignal)
      socket.on('user-connected', handleUserConnected)
      socket.on('user-disconnected', handleUserDisconnected)
      socket.on('message', handelUserMessage)

      return () => {
         socket.emit('leave-room', roomID)
         socket.off('room-users', handleRoomUsers)
         socket.off('call', handleCall)
         socket.off('signal', handleSignal)
         socket.off('user-connected', handleUserConnected)
         socket.off('user-disconnected', handleUserDisconnected)
         socket.off('message', handelUserMessage)

         Connections.destroyAllConnections()
         setUsers([])
         usersRef.current = []
      }
   }, [socket])

   return { users, setUsers }
}

export default useRoomConnection
