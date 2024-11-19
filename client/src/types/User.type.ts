import type { ExtendedPeer } from '@/utils/webRTC.helpers'

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
