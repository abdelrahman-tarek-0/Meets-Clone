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
   // onStream: (stream: MediaStream) => void
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
   handelTrack: (track: MediaStreamTrack, stream: MediaStream) => void
}

export default function createWebRtcConnection({
   onSignal,
   onConnect,
   onClose,
   onData,
   // onStream,
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

   // peer.on('stream', onStream)

   peer.on('track', onTrack)

   peer.id = id // Math.floor(Math.random() * 1000)
   return peer
}

export function webRTChandler({
   socket,
   connectionId,
   localStream,
   initiator,
   target,
   updateTargetUser,
   handelTrack,
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
      onTrack: (track, stream) => {
         console.log('Track received', track, stream)
         handelTrack(track, stream)
      },
   })

   return peer
}
