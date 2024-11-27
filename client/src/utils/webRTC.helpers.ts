import type { Instance as PeerInstance, SimplePeer as Peer } from 'simple-peer'
import type User from '@/types/User.type'
import type { Socket } from 'socket.io-client'
import Connections from '@/global/UsersConnections'

export interface ExtendedPeer extends PeerInstance {
   id?: string
}

interface GlobalWindow extends Window {
   SimplePeer: Peer
}

const SimplePeer = (window as unknown as GlobalWindow)?.SimplePeer as Peer

type WebRtcConnection = {
   onSignal: (signal: unknown) => void
   onConnect: () => void
   onClose: () => void
   onData: (data: unknown) => void
   onStream: (stream: MediaStream) => void
   onTrack: (track: MediaStreamTrack, stream: MediaStream) => void
   initiator?: boolean
   stream?: MediaStream
   id: string
}

type webRTChandlerProps = {
   updateTargetUser: (user: Partial<User>) => void
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
   getUsers,
   socket,
   connectionId,
   localStream,
   initiator,
   target,
   updateTargetUser,
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
         updateTargetUser({ isConnected: true })
      },

      onClose: () => {
         console.log('[CLOSED]', target, peer.connected, peer?.id)
         const connections = Connections.getAllConnectionsToUser(target).filter(
            (c) => c.id !== connectionId
         )

         updateTargetUser({ isConnected: connections.length > 0 })
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
         if (userStream?.id === stream.id)
            return console.log('Stream already exists')

         updateTargetUser({ stream })
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

         updateTargetUser({ stream: userStream })
      },
   })

   return peer
}
