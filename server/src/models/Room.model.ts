import type User from './User.model.js'

class Room {
   id: string
   users: User[]

   constructor(id: string) {
      this.id = id
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
