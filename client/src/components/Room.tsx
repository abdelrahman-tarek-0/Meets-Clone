import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type RoomProps = {
   roomID: string
   name: string
   setSubmitted: (submitted: boolean) => void
}

export default function Room({ roomID, name, setSubmitted }: RoomProps) {
   return (
      <Card className="w-[350px]">
         <CardHeader>
            <CardTitle>Chat Room</CardTitle>
            <CardDescription>
               You have successfully joined the chat room
            </CardDescription>
         </CardHeader>
         <CardContent>
            <div className="flex flex-col space-y-2">
               <div className="flex justify-between items-center">
                  <p className="font-semibold">Room ID</p>
                  <p className="text-gray-600">{roomID}</p>
               </div>
               <div className="flex justify-between items-center">
                  <p className="font-semibold">Name</p>
                  <p className="text-gray-600">{name}</p>
               </div>
            </div>
         </CardContent>
         <CardFooter className="flex justify-between">
            <Button
               onClick={() => {
                  setSubmitted(false)
               }}
            >
               Leave
            </Button>
         </CardFooter>
      </Card>
   )
}
