import { useEffect, useState } from 'react'

import type User from '@/types/User.type'
import type Room from '@/types/Room.type'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

import { getRooms } from '@/api/api'

import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table'

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog'

function UsersDialog({ users, roomId }: { users: User[]; roomId: string }) {
   return (
      <Dialog>
         <DialogTrigger>
            <Button variant="secondary">
               {users.length > 1
                  ? `${users.length} users`
                  : `${users.length} user`}
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Users in room {roomId}</DialogTitle>
            </DialogHeader>
            <DialogDescription>
               {/* display user names and ids in table */}
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead className="font-medium">Name</TableHead>
                        <TableHead className="font-medium">ID</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {users.map((user) => (
                        <TableRow key={user.id}>
                           <TableCell>{user.name}</TableCell>
                           <TableCell>{user.id}</TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </DialogDescription>
         </DialogContent>
      </Dialog>
   )
}

export default function RoomsTable({
   onJoin,
   setCurrentPage,
}: {
   onJoin: (roomId: string) => void
   setCurrentPage: (page: string) => void
}) {
   const [rooms, setRooms] = useState<Room[]>([
      //   {
      //      id: '123',
      //      users: [
      //         { id: '1', name: 'user1' },
      //         { id: '2', name: 'user2' },
      //         { id: '3', name: 'user3' },
      //      ],
      //   },
      //   {
      //      id: '456',
      //      users: [
      //         { id: '4', name: 'user4' },
      //         { id: '5', name: 'user5' },
      //         { id: '6', name: 'user6' },
      //      ],
      //   },
   ])
   const [roomId, setRoomId] = useState('')

   useEffect(() => {
      getRooms()
         .then((rooms) => {
            setRooms(rooms)
         })
         .catch((error) => {
            if (error.response) {
               toast.error(error?.response?.data?.message)
            } else {
               toast.error('An error occurred')
            }
         })
   }, [])

   return (
      <div
         className="
            w-full sm:p-4 
            sm:w-10/12
            xm:w-full
            lg:w-9/12
            md:w-full
            flex flex-col 
            items-start 
            justify-center
            border-2
        "
      >
         <h1 className="p-4  text-2xl">Rooms</h1>
         <div
            className="
            mt-4
            w-full
            flex
            justify-between
            items-center
         "
         >
            <Input
               id="room-id"
               type="text"
               placeholder="Enter Room ID"
               onChange={(e) => setRoomId(e.target.value)}
            />

            <Button
               variant="default"
               className="ml-2"
               onClick={() => {
                  if (!roomId) {
                     toast.error('Room ID is required')
                     return
                  }
                  onJoin(roomId)
               }}
            >
               Join/create
            </Button>
         </div>
         <div className="rounded-md sm:border w-full mt-4">
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="font-medium">Room</TableHead>
                     <TableHead className="font-medium">Users</TableHead>
                     <TableHead className="font-medium">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {rooms.length ? (
                     rooms.map((room) => (
                        <TableRow key={room.id}>
                           <TableCell>{room.id}</TableCell>
                           <TableCell>
                              <UsersDialog
                                 users={room.users}
                                 roomId={room.id}
                              />
                           </TableCell>
                           <TableCell>
                              <Button
                                 variant="outline"
                                 onClick={() => onJoin(room.id)}
                              >
                                 Join
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center">
                           No rooms available
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         <div className="mt-4">
            <Button
               variant="destructive"
               onClick={() => setCurrentPage('login')}
            >
               Leave
            </Button>
         </div>
      </div>
   )
}
