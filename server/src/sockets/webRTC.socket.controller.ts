import type { Socket, Server } from 'socket.io'

export default (socket: Socket, io: Server) => {
   socket.on('call', (data) => {
      io.to(data?.user).emit('call', {
         caller: socket.id,
         signal: data.signal,
      })
   })

   socket.on('answer', (data) => {
      io.to(data?.user).emit('answer', {
         answerID: socket.id,
         signal: data.signal,
      })
   })
}
