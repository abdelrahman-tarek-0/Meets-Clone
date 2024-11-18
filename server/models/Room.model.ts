import { randomID } from '../src/utils/general.utils.js'
import User from './User.model.js'

class Room {
   id: string
   users: User[]

   constructor() {
      this.id = randomID()
      this.users = []
   }

   addUser = (user: User) => {
      this.users.push(user)
   }

   removeUserByID = (userId: string) => {
      this.users = this.users.filter((user) => user.id !== userId)
   }
   removeUserBySocket = (socketId: string) => {
      this.users = this.users.filter((user) => user.socket.id !== socketId)
   }

   toJson = () => {
      return {
         id: this.id,
         users: this.users.map((user) => user.toJson()),
      }
   }
}

export default Room