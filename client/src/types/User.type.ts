import type { ExtendedPeer } from '@/utils/createWebRtcConnection'

type User = {
   id: string
   name: string
   connections?: {
      [key: string]: ExtendedPeer
   }
   isConnected?: boolean
   stream?: MediaStream
}

export default User
