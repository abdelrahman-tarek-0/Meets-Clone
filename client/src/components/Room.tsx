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

import UserCard from '@/components/UserCard'
import useRoomConnection from '@/hooks/useRoomConnection'

type RoomProps = {
   roomID: string
   name: string
   setCurrentPage: (page: string) => void
   socket: Socket | null
   localStream: MediaStream | undefined
}

export default function Room({
   roomID,
   name,
   setCurrentPage,
   socket,
   localStream,
}: RoomProps) {
   const { users } = useRoomConnection({ socket, roomID, localStream })


   return (
      <div className="flex flex-col items-center justify-center w-full">
         <Card className="w-full">
            <CardHeader>
               <CardTitle>Room: {roomID}</CardTitle>
               <CardDescription>Welcome, {name}!</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid lg:grid-cols-2 xl:grid-cols-3 sm:grid-cols-1 gap-4">
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
               variant='destructive'
                  onClick={() => {
                     setCurrentPage('roomsTable')
                  }}
               >
                  Leave Room
               </Button>
            </CardFooter>
         </Card>
      </div>
   )
}
