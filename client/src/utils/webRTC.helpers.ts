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
   onTrack: (track: MediaStreamTrack, stream: MediaStream) => void
   initiator?: boolean
   stream?: MediaStream
   id: string
}

type webRTChandlerProps = {
   updateUsers: (users: User[]) => void
   getUsers: () => User[]
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
   onTrack,
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

   peer.on('track', onTrack)

   peer.id = id // Math.floor(Math.random() * 1000)
   return peer
}

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
         console.log(
            'Stream received',
            stream.getTracks(),
            'number of video tracks',
            stream.getVideoTracks().length,
            'number of audio tracks',
            stream.getAudioTracks().length
         )

         const userStream = getUsers().find((u) => u.id === target)?.stream
         if (userStream?.id === stream.id) return console.log('Stream already exists')

         updateUsers(
            getUsers().map((u) => {
               if (u.id === target) {
                  return { ...u, stream }
               }
               return u
            })
         )
      },

      onTrack: (track, stream) => {
         console.log('Track received', track, stream)

         let userStream = getUsers().find((u) => u.id === target)?.stream
         if (!userStream) {
            userStream = stream
         }

         if (
            userStream?.id === stream.id &&
            userStream.getTracks().find((t) => t.id !== track.id)
         ) {
            userStream.addTrack(track)
         }

         updateUsers(
            getUsers().map((u) => {
               if (u.id === target) {
                  return { ...u, stream: userStream }
               }
               return u
            })
         )
      },
   })

   return peer
}
