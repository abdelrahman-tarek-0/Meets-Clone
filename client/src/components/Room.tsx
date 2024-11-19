import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import type { Socket } from 'socket.io-client'
import type User from '@/types/User.type'
import UserCard from '@/components/UserCard'

type RoomProps = {
   roomID: string
   name: string
   setSubmitted: (submitted: boolean) => void
   users: User[]
   socket: Socket | null
   localStream: MediaStream | undefined
   // streamConstraints: MediaStreamConstraints
   // setStreamConstraints: (streamConstraints: MediaStreamConstraints) => void
}

export default function Room({
   roomID,
   name,
   setSubmitted,
   users,
   socket,
   localStream,
   // streamConstraints,
   // setStreamConstraints,
}: RoomProps) {
   return (
      <div className="flex flex-col items-center justify-center w-full">
         <Card className="w-full">
            <CardHeader>
               <CardTitle>Room: {roomID}</CardTitle>
               <CardDescription>Welcome, {name}!</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
                  {users
                     .sort(
                        (a, b) =>
                           (b.id === socket?.id ? 1 : 0) -
                           (a.id === socket?.id ? 1 : 0)
                     ) // .filter(user => user.id !== socket?.id)
                     .map((user) => (
                        <UserCard
                           key={user.id}
                           id={user.id}
                           name={user.name}
                           isConnected={user.isConnected}
                           isMe={user.id === socket?.id}
                           stream={
                              user.id === socket?.id ? localStream : user.stream
                           }
                        />
                     ))}
               </div>
            </CardContent>
            <CardFooter>
               <Button
                  onClick={() => {
                     setSubmitted(false)
                  }}
               >
                  Leave Room
               </Button>
            </CardFooter>
         </Card>
      </div>
   )
}
