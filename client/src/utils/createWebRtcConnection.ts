import type { Instance as PeerInstance, SimplePeer as Peer } from 'simple-peer'

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
