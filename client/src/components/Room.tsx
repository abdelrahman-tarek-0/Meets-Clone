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
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from '@/components/ui/tooltip'

type RoomProps = {
   roomID: string
   name: string
   setCurrentPage: (page: string) => void
   socket: Socket | null
   localStream: MediaStream | undefined
}

const commands = [
   {
      command: '/red',
      schema: '/red [message] -- Send a red message',
   },
]

const getCommandMessage = (message: string) => {
   const isCommand = commands.find((command) =>
      message.startsWith(command.command)
   )
   if (!isCommand) return null
   return isCommand.command
}

const sanitizeMessage = (message: string) => {
   const command = getCommandMessage(message)
   if (!command) return message
   return message.replace(command, '')
}

export default function Room({
   roomID,
   name,
   setCurrentPage,
   socket,
   localStream,
}: RoomProps) {
   const { users, setUsers } = useRoomConnection({
      socket,
      roomID,
      localStream,
   })
   const [message, setMessage] = useState<string | null | undefined>(null)
   const [tooltipOpen, setTooltipOpen] = useState(false)
   const [selectedCommand, setSelectedCommand] = useState<string | null>(null)

   const handelSendMessage = () => {
      if (!message || !socket) return

      const command = getCommandMessage(message)
      const text = sanitizeMessage(message)

      socket.emit('message', text, command)

      setUsers((prevUsers) => {
         return prevUsers.map((u) =>
            u.id === socket.id
               ? {
                    ...u,
                    message: {
                       text,
                       type: command || 'text',
                    },
                 }
               : u
         )
      })

      setMessage('')
   }

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
                           message={user.message}
                        />
                     ))}
               </div>
            </CardContent>
            <CardFooter>
               <div
                  className="flex flex-col space-y-4"
                  style={{ width: '100%' }}
               >
                  <div className="flex items-center justify-between">
                     <TooltipProvider delayDuration={0}>
                        <Tooltip open={tooltipOpen}>
                           <TooltipTrigger asChild>
                              <Input
                                 placeholder="Say something..."
                                 className="mr-2"
                                 onKeyUp={(e) => {
                                    if (e.key === 'Enter') {
                                       handelSendMessage()
                                    }
                                 }}
                                 value={message || ''}
                                 onChange={(e) => {
                                    const command = getCommandMessage(
                                       e.target.value
                                    )
                                    setSelectedCommand(command)
                                    setMessage(e.target.value)
                                 }}
                                 onFocus={() => setTooltipOpen(true)}
                                 onBlur={() => setTooltipOpen(false)}
                              />
                           </TooltipTrigger>
                           <TooltipContent align="start">
                              <div className="flex flex-col space-y-2">
                                 <h1>Commands:</h1>
                                 <ul>
                                    {commands.map((command) => (
                                       <li
                                          key={command.command}
                                          className={`
                                          ${selectedCommand === command.command && 'bg-gray-700'} p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200 ease-in-out'
                                       `}
                                          onClick={() => {
                                             setMessage(command.command + ' ')
                                          }}
                                       >
                                          {command.schema}
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                     <Button
                        variant="secondary"
                        type="submit"
                        onClick={handelSendMessage}
                     >
                        Send
                     </Button>
                  </div>

                  <Button
                     variant="destructive"
                     className="w-fit"
                     onClick={() => {
                        setCurrentPage('roomsTable')
                     }}
                  >
                     Leave Room
                  </Button>
               </div>
            </CardFooter>
         </Card>
      </div>
   )
}
