import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import LiveLogo from '/images/WhiteLiveLogo.gif?url'

interface LoginCardProps {
   name: string
   setName: (name: string) => void
   roomID: string
   setRoomID: (roomID: string) => void
   setSubmitted: (submitted: boolean) => void
   setLoading: (loading: boolean) => void
}

export default function LoginCard({
   name,
   setName,
   roomID,
   setRoomID,
   setSubmitted,
   setLoading,
}: LoginCardProps) {
   return (
      <Card className="w-[350px]">
         <CardHeader>
            <CardTitle
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
               }}
            >
               Join Chat Room
               <img
                  src={LiveLogo}
                  alt="Live"
                  style={{
                     width: '30px',
                     height: '30px',
                     marginLeft: '10px',
                     marginBottom: '-5px',
                     // backgroundColor: "white"
                     // backgroundColor: "white",
                     pointerEvents: 'none',
                     // stop image selection
                     userSelect: 'none',
                  }}
                  className=""
               />
            </CardTitle>
            <CardDescription>
               Enter your name and room id to join the chat room
            </CardDescription>
         </CardHeader>
         <CardContent>
            <form>
               <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                     <Label htmlFor="name">Name</Label>
                     <Input
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                     />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                     <Label htmlFor="framework">Room Id</Label>
                     <Input
                        id="framework"
                        placeholder="Enter room id"
                        value={roomID}
                        onChange={(e) => setRoomID(e.target.value)}
                     />
                  </div>
               </div>
            </form>
         </CardContent>
         <CardFooter className="flex justify-between">
            <Button
               onClick={() => {
                  setLoading(true)
                  setTimeout(() => {
                     setLoading(false)
                     setSubmitted(true)
                  }, 2000) // fake api delay
               }}
            >
               Enter
            </Button>
         </CardFooter>
      </Card>
   )
}
