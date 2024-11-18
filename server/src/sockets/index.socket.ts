import { Server } from 'socket.io'

import type { Socket as BaseSocket } from 'socket.io'
import type { Server as HttpsServer } from 'https'
import type { Server as HttpServer } from 'https'

import webRTCController from './webRTC.socket.controller.js'

import User from '../../models/User.model.js'
import Room from '../../models/Room.model.js'

interface Socket extends BaseSocket {
   user?: User
}

const rooms: { [key: string]: Room } = {}

export default (server: HttpsServer | HttpServer) => {
   const io = new Server(server, {
      cors: {
         origin: '*',
         methods: ['GET', 'POST'],
      },
   })

   io.use((socket: Socket, next) => {
      const { name } = socket.handshake.query
      if (!name || Array.isArray(name)) return next(new Error('Invalid data'))

      socket.user = new User({ name, socket, id: socket.id })
      next()
   })

   io.on('connection', (socket: Socket) => {
      if (!socket.user) return socket.disconnect()
      console.log(
         '[SOCKET]: A user connected',
         socket.user.name,
         socket.user.id
      )

      webRTCController(socket)

      socket.on('join-room', (roomId: string, name: string) => {
         if (!socket.user) return

         const isInRoom = Array.from(socket.rooms).some(
            (room) => room !== socket.id
         )

         if (!roomId || !name || isInRoom) return
         if (!rooms[roomId]) rooms[roomId] = new Room(roomId)
         rooms[roomId].addUser(socket.user)

         socket.join(roomId)
         socket.to(roomId).emit('user-connected', socket.user.toJson())
         socket.emit('room-users', rooms[roomId].toJson().users)

         console.log(`[SOCKET]: ${name} joined room ${roomId}`)
      })

      socket.on('leave-room', (roomId: string) => {
         if (!roomId || !socket.user) return

         socket.leave(roomId)
         socket.to(roomId).emit('user-disconnected', socket.user.toJson())

         if (!rooms[roomId]) return
         rooms[roomId].removeUserBySocket(socket.user.id)
      })

      socket.on('disconnect', () => {
         if (!socket.user) return

         console.log(
            '[SOCKET]: A user disconnected',
            socket.user.name,
            socket.user.id
         )

         socket.rooms.forEach((room) => {
            if (room === socket.id || !socket.user || !rooms[room]) return

            socket.to(room).emit('user-disconnected', socket.user.toJson())
            rooms[room].removeUserBySocket(socket.id)
         })
      })
   })
}
