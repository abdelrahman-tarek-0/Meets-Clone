import { useEffect, useRef, useState } from 'react'

import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Mic, MicOff, Camera, CameraOff } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

type UserCardProps = {
   id: string
   name: string
   isMe: boolean
   isConnected?: boolean
   stream?: MediaStream
}
export default function UserCard({
   id,
   name,
   isConnected,
   isMe,
   stream,
}: UserCardProps) {
   const isAudioExists = () => {
      return stream && stream.getAudioTracks().length > 0
   }

   const isVideoExists = () => {
      return stream && stream.getVideoTracks().length > 0
   }

   const mediaRef = useRef<HTMLVideoElement>(null)
   const [mute, setMute] = useState(false)
   const [muteVideo, setMuteVideo] = useState(false)

   useEffect(() => {
      if (!mediaRef.current || !stream) return

      mediaRef.current.srcObject = stream

      return () => {
         if (mediaRef.current) {
            mediaRef.current.srcObject = null
         }
      }
   }, [stream])

   useEffect(() => {
      console.log('Mute Audio', mute)
      if (!stream) return
      let isMuted = mute

      if (!isAudioExists()) {
         setMute(true)
         isMuted = true
      }

      stream.getAudioTracks().forEach((track) => {
         track.enabled = !isMuted
      })
   }, [mute, stream])

   useEffect(() => {
      console.log('Mute Video', muteVideo)
      if (!stream) return

      let isMuted = muteVideo

      if (!isVideoExists()) {
         setMuteVideo(true)
         isMuted = true
      }

      stream.getVideoTracks().forEach((track) => {
         track.enabled = !isMuted
      })
   }, [muteVideo, stream])

   return (
      <Card>
         <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{id}</CardDescription>
         </CardHeader>
         <div
            className="flex  items-center justify-start flex-col h-full"
         >
            <CardContent className="h-4/6 flex flex-col justify-center items-start">
               <div className="flex items-center justify-center">
                  {stream && stream.getVideoTracks().length > 0 && (
                     <video
                        ref={mediaRef}
                        autoPlay
                        playsInline
                        muted={isMe}
                        className='mt-2'
                        style={{
                           width: '100%',
                           // height: 'auto',
                           borderRadius: '8px',
                        }}
                     />
                  )}
                  {stream &&
                     stream.getAudioTracks().length > 0 &&
                     stream.getVideoTracks().length === 0 && (
                        <>
                           <audio
                              ref={mediaRef}
                              autoPlay
                              playsInline
                              muted={isMe}
                           />
                           <Badge variant="secondary">Audio Only</Badge>
                        </>
                     )}
                  {!stream && <Badge variant="destructive">No Stream</Badge>}
               </div>
            </CardContent>
            <CardFooter>
               <div className="flex flex-col items-center justify-between mt-4">
                  <CardDescription>
                     {
                        <div className="flex items-center space-x-2">
                           {mute ? (
                              <label
                                 htmlFor={`${id}-audio`}
                                 className="cursor-pointer"
                              >
                                 <MicOff />
                              </label>
                           ) : (
                              <label
                                 htmlFor={`${id}-audio`}
                                 className="cursor-pointer"
                              >
                                 <Mic />
                              </label>
                           )}
                           <Checkbox
                              checked={mute || !isAudioExists()}
                              style={{
                                 visibility: 'hidden',
                              }}
                              id={`${id}-audio`}
                              onCheckedChange={(e) => {
                                 setMute(e.valueOf() as boolean)
                              }}
                           />

                           {muteVideo ? (
                              <label
                                 htmlFor={`${id}-video`}
                                 className="cursor-pointer"
                              >
                                 <CameraOff />
                              </label>
                           ) : (
                              <label
                                 htmlFor={`${id}-video`}
                                 className="cursor-pointer"
                              >
                                 <Camera />
                              </label>
                           )}

                           <Checkbox
                              checked={muteVideo || !isVideoExists()}
                              style={{
                                 visibility: 'hidden',
                              }}
                              id={`${id}-video`}
                              onCheckedChange={(e) => {
                                 setMuteVideo(e.valueOf() as boolean)
                              }}
                           />

                           {isMe && <Badge variant="secondary">You</Badge>}
                           {!isMe &&
                              (isConnected ? (
                                 <Badge>Connected</Badge>
                              ) : (
                                 <Badge variant="destructive">
                                    Not Connected
                                 </Badge>
                              ))}
                        </div>
                     }
                  </CardDescription>
               </div>
            </CardFooter>
         </div>
      </Card>
   )
}
