import type { Socket } from 'socket.io'
import { randomID } from '../src/utils/general.utils.js'

type UserWithoutId = Omit<User, 'id' | 'update' | 'toJson'>
type updateUser = Partial<Omit<UserWithoutId, 'socket'>>

class User {
   id: string
   name: string
   socket: Socket

   constructor(user: UserWithoutId) {
      this.id = randomID()
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
