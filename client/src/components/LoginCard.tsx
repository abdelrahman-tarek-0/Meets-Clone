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
import { Checkbox } from '@/components/ui/checkbox'

import LiveLogo from '/images/WhiteLiveLogo.gif?url'
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react'

interface LoginCardProps {
   name: string
   setName: (name: string) => void
   roomID: string
   setRoomID: (roomID: string) => void
   setSubmitted: (submitted: boolean) => void
   streamConstraints: MediaStreamConstraints
   setStreamConstraints: (constraints: MediaStreamConstraints) => void
}

export default function LoginCard({
   name,
   setName,
   roomID,
   setRoomID,
   setSubmitted,
   streamConstraints,
   setStreamConstraints,
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
                     <Label htmlFor="roomID">Room Id</Label>
                     <Input
                        id="roomID"
                        placeholder="Enter room id"
                        value={roomID}
                        onChange={(e) => setRoomID(e.target.value)}
                     />
                  </div>

                  <div
                     className="flex space-x-4"
                     style={{
                        justifyContent: 'center',
                        marginTop: '1rem',
                     }}
                  >
                     <div className="flex items-center justify-left">
                        {streamConstraints.audio ? (
                           <label htmlFor="audio" className="cursor-pointer">
                              <Mic />
                           </label>
                        ) : (
                           <label htmlFor="audio" className="cursor-pointer">
                              <MicOff />
                           </label>
                        )}
                        <Checkbox
                           checked={streamConstraints.audio ? true : false}
                           style={{
                              visibility: 'hidden',
                           }}
                           id="audio"
                           onCheckedChange={(e) => {
                              console.log(e.valueOf())
                              setStreamConstraints({
                                 ...streamConstraints,
                                 audio: e.valueOf() as boolean,
                              })
                           }}
                        />
                     </div>
                     <div className="flex items-center justify-left">
                        {streamConstraints.video ? (
                           <label htmlFor="video" className="cursor-pointer">
                              <Camera />
                           </label>
                        ) : (
                           <label htmlFor="video" className="cursor-pointer">
                              <CameraOff />
                           </label>
                        )}
                        <Checkbox
                           checked={streamConstraints.video ? true : false}
                           style={{
                              visibility: 'hidden',
                           }}
                           id="video"
                           onCheckedChange={(e) => {
                              console.log(e.valueOf())
                              setStreamConstraints({
                                 ...streamConstraints,
                                 video: e.valueOf() as boolean,
                              })
                           }}
                        />
                     </div>
                  </div>
               </div>
            </form>
         </CardContent>
         <CardFooter className="flex justify-between">
            <Button
               onClick={() => {
                  setSubmitted(true)
               }}
            >
               Enter
            </Button>
         </CardFooter>
      </Card>
   )
}
