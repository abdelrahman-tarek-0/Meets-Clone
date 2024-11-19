import type { Socket, Server } from 'socket.io'

export default (socket: Socket, io: Server) => {
   socket.on('call', ({ user, id }, cb) => {
      io.to(user).emit('call', { caller: socket.id, id })
      if (cb) cb?.()
   })

   socket.on('signal', ({ user, id, signal }) => {
      io.to(user).emit('signal', { signal, caller: socket.id, id })
   })
}
