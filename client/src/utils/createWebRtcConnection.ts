import type { SimplePeer as Peer } from 'simple-peer'

const SimplePeer = (window as unknown as any)?.SimplePeer as Peer

type WebRtcConnection = {
   onSignal: (signal: any) => void
   onConnect: () => void
   onClose: () => void
   onData: (data: any) => void
   onStream: (stream: MediaStream) => void
   initiator?: boolean
   stream?: MediaStream
}

export default function createWebRtcConnection({
   onSignal,
   onConnect,
   onClose,
   onData,
   onStream,
   initiator = true,
   stream,
}: WebRtcConnection) {
   const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream: stream || undefined,
   })

   peer.on('signal', onSignal)

   peer.on('connect', onConnect)

   peer.on('close', onClose)

   peer.on('data', onData)

   peer.on('stream', onStream)

   return peer
}
