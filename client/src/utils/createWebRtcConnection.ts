import type { SimplePeer as Peer } from 'simple-peer'

const SimplePeer = (window as unknown as any)?.SimplePeer as Peer

type WebRtcConnection = {
   onSignal: (signal: any) => void
   onConnect: () => void
   onClose: () => void
   onData: (data: any) => void
   initiator?: boolean
}

export default function createWebRtcConnection({
   onSignal,
   onConnect,
   onClose,
   onData,
   initiator = true,
}: WebRtcConnection) {
   const peer = new SimplePeer({ initiator, trickle: false })

   peer.on('signal', onSignal)

   peer.on('connect', onConnect)

   peer.on('close', onClose)

   peer.on('data', onData)

   return peer
}
