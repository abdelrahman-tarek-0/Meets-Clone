import useLocalStorage from 'use-local-storage'

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
import { useEffect, useRef, useState } from 'react'
import { getMediaStream } from '@/lib/utils'

interface LoginCardProps {
   onSubmit: (username: string, constraints: MediaStreamConstraints) => void
}

export default function LoginCard({
   onSubmit,
}: LoginCardProps) {
   const [name, setName] = useLocalStorage('client-name', '')
   const [streamConstraints, setStreamConstraints] =
      useLocalStorage<MediaStreamConstraints>('prefer-media-constraints', {
         video: false,
         audio: false,
      })

   const [prevStreamConstraints, setPrevStreamConstraints] =
      useState<MediaStreamConstraints>(streamConstraints)

   const streamRef = useRef<MediaStream>()

   // for testing stream on the login card
   useEffect(() => {
      if (!streamConstraints.audio && !streamConstraints.video) {
         streamRef.current?.getTracks().forEach((track) => track.stop())
         streamRef.current = undefined

         return
      }

      if (!streamConstraints.audio) {
         streamRef.current?.getAudioTracks().forEach((track) => track.stop())
      }

      if (!streamConstraints.video) {
         streamRef.current?.getVideoTracks().forEach((track) => track.stop())
      }

      getMediaStream(streamConstraints).then((stream) => {
         if (!stream) {
            return setStreamConstraints(prevStreamConstraints)
         }
         console.log('stream request')
         streamRef.current = stream
      })
   }, [streamConstraints])

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
               <span>Live Rooms</span>
               <img
                  src={LiveLogo}
                  alt="Live"
                  style={{
                     width: '30px',
                     height: '30px',
                     marginLeft: '10px',
                     marginBottom: '-5px',
                     pointerEvents: 'none',
                     userSelect: 'none',
                  }}
                  className=""
               />
            </CardTitle>
            <CardDescription>
               Enter your name and choose your media preferences
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
                              setPrevStreamConstraints(streamConstraints)
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
                              setPrevStreamConstraints(streamConstraints)
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
                  streamRef.current
                     ?.getTracks()
                     .forEach((track) => track.stop())
                  streamRef.current = undefined
                  onSubmit(name, streamConstraints)
               }}
            >
               Enter
            </Button>
         </CardFooter>
      </Card>
   )
}
