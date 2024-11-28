type User = {
   id: string
   name: string
   isConnected?: boolean
   stream?: MediaStream
   message?: {
      text?: string
      type?: string
   }
}

export default User
