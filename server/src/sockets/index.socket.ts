import { Server } from 'socket.io'

import type { Server as HttpsServer } from 'https'
import type { Server as HttpServer } from 'https'

import webRTCController from './webRTC.socket.controller.js'

type User = { id: string; name: string }

const rooms: { [key: string]: User[] } = {}

export default (server: HttpsServer | HttpServer) => {
   const io = new Server(server, {
      cors: {
         origin: '*',
         methods: ['GET', 'POST'],
      },
   })

   io.on('connection', (socket) => {
      console.log('[SOCKET]: A user connected', socket.id)
      webRTCController(socket)

      socket.on('join-room', (roomId: string, name: string) => {
         const isInRoom = Array.from(socket.rooms).some(
            (room) => room !== socket.id
         )
         if (!roomId || !name || isInRoom) return

         console.log(`[SOCKET]: ${name} joined room ${roomId}`)

         socket.join(roomId)
         socket.to(roomId).emit('user-connected', name)

         if (!rooms[roomId]) rooms[roomId] = []
         socket.emit('room-users', rooms[roomId])

         rooms[roomId].push({
            id: socket.id,
            name,
         })
      })

      socket.on('leave-room', (roomId: string) => {
         if (!roomId) return

         socket.leave(roomId)
         socket.to(roomId).emit('user-disconnected', socket.id)

         if (!rooms[roomId]) return
         rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id)
      })

      socket.on('disconnect', () => {
         console.log('[SOCKET]: A user disconnected', socket.id)

         socket.rooms.forEach((room) => {
            if (room === socket.id) return
            socket.to(room).emit('user-disconnected', socket.id)
            rooms[room] = rooms[room].filter((user) => user.id !== socket.id)
         })
      })
   })
}
