import type { Socket, Server } from 'socket.io'

export default (socket: Socket, io: Server) => {
   socket.on('call', (data) => {
      io.to(data?.user).emit('call', {
         caller: socket.id,
         signal: data.signal,
      })
   })

   socket.on('signal', (data) => {
      io.to(data?.user).emit('signal', {
         signal: data.signal,
         caller: socket.id,
      })
   })
}
