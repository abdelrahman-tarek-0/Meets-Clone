import type { Socket } from 'socket.io'

export type UserType = Omit<User, 'update' | 'toJson'>
type updateUser = Partial<Omit<UserType, 'socket'>>

class User {
   id: string
   name: string
   socket: Socket

   constructor(user: UserType) {
      this.id = user.id
      this.name = user.name
      this.socket = user.socket
   }

   update = (newDate: updateUser) => {
      if (newDate.name) this.name = newDate.name
   }

   toJson = () => {
      return {
         id: this.id,
         name: this.name,
      }
   }
}

export default User
