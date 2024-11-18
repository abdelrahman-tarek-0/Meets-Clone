import type { Instance } from 'simple-peer'

type User = {
   id: string
   name: string
   peer?: Instance
   isConnected?: boolean
}

export default User
