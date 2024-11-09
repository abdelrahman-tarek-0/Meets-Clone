import type { Socket } from "socket.io"

export default (socket: Socket) => {
    socket.on('signal', (data) => {
        console.log('[SOCKET]: Sending', 'from', socket.id, 'to', data.to)
    
        socket.to(data.to).emit('signal', {
            from: socket.id,
            signal: data.signal,
        })
    })
}