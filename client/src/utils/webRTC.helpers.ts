import type { Instance as PeerInstance, SimplePeer as Peer } from 'simple-peer'
import type User from '@/types/User.type'
import type { Socket } from 'socket.io-client'

export interface ExtendedPeer extends PeerInstance {
   id?: string
}

const SimplePeer = (window as unknown as any)?.SimplePeer as Peer

type WebRtcConnection = {
   onSignal: (signal: any) => void
   onConnect: () => void
   onClose: () => void
   onData: (data: any) => void
   onStream: (stream: MediaStream) => void
   initiator?: boolean
   stream?: MediaStream
   id: string
}

type webRTChandlerProps = {
   updateUsers: (users: User[]) => void
   getUsers: ()=>User[]
   socket: Socket
   connectionId: string
   localStream?: MediaStream
   initiator: boolean
   target: string
}

export default function createWebRtcConnection({
   onSignal,
   onConnect,
   onClose,
   onData,
   onStream,
   initiator = true,
   stream,
   id,
}: WebRtcConnection) {
   const peer: ExtendedPeer = new SimplePeer({
      initiator,
      trickle: true,
      stream: stream || undefined,
   })

   peer.on('signal', onSignal)

   peer.on('connect', onConnect)

   peer.on('close', onClose)

   peer.on('data', onData)

   peer.on('stream', onStream)

   peer.id = id // Math.floor(Math.random() * 1000)
   return peer
}

// export function onConnectHandler({
//    connection,
//    updateUsers,
//    users,
//    user,
// }: onConnectHandlerProps) {
//    console.log('[CONNECTED]', user.id)
//    connection.send('Hello')

//    updateUsers(
//       users.map((u) => {
//          if (u.id === user.id) {
//             return { ...u, isConnected: true }
//          }
//          return u
//       })
//    )
// }

export function webRTChandler({
   updateUsers,
   getUsers,
   socket,
   connectionId,
   localStream,
   initiator,
   target,
}: webRTChandlerProps) {
   const peer = createWebRtcConnection({
      id: connectionId,
      initiator,
      stream: localStream,
      onSignal: (signal) => {
         socket.emit('signal', {
            user: target,
            id: connectionId,
            signal,
         })
      },

      onConnect: () => {
         console.log('[CONNECTED]', target)
         updateUsers(
            getUsers().map((u) => {
               if (u.id === target) {
                  return { ...u, isConnected: true }
               }
               return u
            })
         )
      },

      onClose: () => {
         console.log('[CLOSED]', target, peer.connected, peer?.id)

         updateUsers(
            getUsers().map((u) => {
               if (u.id === target) {
                  delete u?.connections?.[connectionId]
                  return {
                     ...u,
                     isConnected: Object.keys(u?.connections || {}).length > 0,
                  }
               }
               return u
            })
         )
      },
      onData: (data) => {
         console.log('Data received', data)
      },
      onStream: (stream) => {
         console.log('Stream received', stream)
         updateUsers(
            getUsers().map((u) => {
               if (u.id === target) {
                  return { ...u, stream }
               }
               return u
            })
         )
      },
   })

   return peer
}
