import type { ExtendedPeer } from '@/utils/createWebRtcConnection';

type User = {
   id: string
   name: string
   peer?: ExtendedPeer
   isConnected?: boolean
   stream?: MediaStream
}

export default User
