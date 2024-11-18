import type { Instance } from 'simple-peer'

type User = {
   id: string
   name: string
   peer?: Instance
   isConnected?: boolean
   stream?: MediaStream
}

export default User
