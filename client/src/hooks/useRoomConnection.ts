import { useEffect, useState, useRef } from 'react'
import { webRTChandler } from '@/utils/webRTC.helpers'

import type { Socket } from 'socket.io-client'
import type User from '@/types/User.type'

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
      usersRef.current = users
   }, [users])

   useEffect(() => {
      if (!socket || !roomID) return

      socket.emit('join-room', roomID)
      const handleRoomUsers = (roomUsers: User[]) => {
         console.log('Room Users:', roomUsers)

         setUsers((prevUsers) =>
            roomUsers.map((user) => ({
               ...user,
               connections:
                  prevUsers.find((u) => u.id === user.id)?.connections || {},
            }))
         )

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
                  updateUsers: (updatedUsers) => setUsers(() => updatedUsers),
                  getUsers: () => usersRef.current,
               })

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
               )
            })
         })
      }

      const handleCall = ({ caller, id }: { caller: string; id: string }) => {
         setUsers((prevUsers) => {
            const user = prevUsers.find((u) => u.id === caller)
            if (!user) return prevUsers

            const peer = webRTChandler({
               connectionId: id,
               initiator: false,
               localStream,
               socket,
               target: caller,
               updateUsers: (updatedUsers) => setUsers(() => updatedUsers),
               getUsers: () => usersRef.current,
            })

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
            )
         })
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
         setUsers((prevUsers) => {
            const user = prevUsers.find((u) => u.id === caller)
            if (!user) return prevUsers

            const peer = user.connections?.[id]
            if (peer) peer.signal(signal)

            return prevUsers
         })
      }

      const handleUserConnected = (newUser: User) => {
         setUsers((prevUsers) => [...prevUsers, newUser])
      }

      const handleUserDisconnected = (disconnectedUser: User) => {
         // usersRef.current.forEach((user) => {
         //    Object.values({ ...(user?.connections || {}) }).forEach((conn) => {
         //       if (conn.destroyed) return
         //       conn?.destroy?.()
         //    })
         // })
         setUsers((prevUsers) =>
            prevUsers.filter((u) => u.id !== disconnectedUser.id)
         )
      }

      socket.on('room-users', handleRoomUsers)
      socket.on('call', handleCall)
      socket.on('signal', handleSignal)
      socket.on('user-connected', handleUserConnected)
      socket.on('user-disconnected', handleUserDisconnected)

      return () => {
         socket.emit('leave-room', roomID)
         socket.off('room-users', handleRoomUsers)
         socket.off('call', handleCall)
         socket.off('signal', handleSignal)
         socket.off('user-connected', handleUserConnected)
         socket.off('user-disconnected', handleUserDisconnected)

         // usersRef.current.forEach((user) => {
         //    Object.values({ ...(user?.connections || {}) }).forEach((conn) => {
         //       if (conn.destroyed) return
         //       conn?.destroy?.()
         //    })
         // })

         setUsers([])
         usersRef.current = []
      }
   }, [socket])

   return { users }
}

export default useRoomConnection
