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
import { monitorAudioActivity } from '@/lib/utils'

type UserCardProps = {
   id: string
   name: string
   isMe: boolean
   isConnected?: boolean
   stream?: MediaStream
   message?: {
      text?: string
      type?: string
   }
}

const typeMessageMap = {
   '/red': 'destructive',
   '/quite': 'outline',
   '/default': 'secondary',
} as {
   [key: string]: 'destructive' | 'outline' | 'secondary'
}

export default function UserCard({
   id,
   name,
   isConnected,
   isMe,
   stream,
   message,
}: UserCardProps) {
   const mediaRef = useRef<HTMLVideoElement>(null)
   const [muteAudio, setMuteAudio] = useState(false)
   const [muteVideo, setMuteVideo] = useState(false)

   const [micColor, setMicColor] = useState('white')

   const hasAudioTracks = () => stream && stream?.getAudioTracks()?.length > 0
   const hasVideoTracks = () => stream && stream?.getVideoTracks()?.length > 0

   useEffect(() => {
      if (mediaRef.current && stream) {
         mediaRef.current.srcObject = stream
      }
      return () => {
         if (mediaRef.current) {
            mediaRef.current.srcObject = null
         }
      }
   }, [stream])

   useEffect(() => {
      if (!stream) return
      const interval = monitorAudioActivity(stream, (status) => {
         setMicColor(status === 'active' ? 'green' : 'white')
      })

      return () => {
         clearInterval(interval)
      }
   }, [stream])

   useEffect(() => {
      if (!stream) return
      console.log(
         id,
         'Mute Audio',
         muteAudio,
         'isAudioExists',
         hasAudioTracks()
      )
      let isMuted = muteAudio

      if (!hasAudioTracks()) {
         setMuteAudio(true)
         isMuted = true
      }

      stream?.getAudioTracks()?.forEach((track) => {
         track.enabled = !isMuted
      })
   }, [stream, muteAudio])

   useEffect(() => {
      if (!stream) return
      console.log(
         id,
         'Mute Video',
         muteVideo,
         'isVideoExists',
         hasVideoTracks()
      )
      let isMuted = muteVideo

      if (!hasVideoTracks()) {
         setMuteVideo(true)
         isMuted = true
      }

      stream?.getVideoTracks()?.forEach((track) => {
         track.enabled = !isMuted
      })
   }, [stream, muteVideo])

   useEffect(() => {
      if (!stream) return

      const handleTrackAdded = () => {
         if (hasVideoTracks()) {
            setMuteVideo(false)
         }
      }

      const handleTrackRemoved = () => {
         if (!hasVideoTracks()) {
            setMuteVideo(true)
         }
      }

      stream.addEventListener('addtrack', handleTrackAdded)
      stream.addEventListener('removetrack', handleTrackRemoved)

      return () => {
         stream.removeEventListener('addtrack', handleTrackAdded)
         stream.removeEventListener('removetrack', handleTrackRemoved)
      }
   }, [stream])

   return (
      <Card>
         <CardHeader className="h-1/6">
            <CardTitle>{name}</CardTitle>
            <CardDescription>{id}</CardDescription>
            {message && (
               <div className="w-full flex">
                  said:
                  <Badge
                     variant={
                        typeMessageMap[(message?.type as '/red' | '/quite')] || 'secondary'
                     }
                     className="flex-grow text-center ml-1 overflow-hidden whitespace-nowrap text-ellipsis"
                     title={message.text}
                  >
                     {message.text}
                  </Badge>
               </div>
            )}
         </CardHeader>
         <div className="flex items-center justify-end flex-col h-5/6">
            <CardContent className="flex flex-col justify-center items-start">
               <div
                  className="flex items-center justify-center"
               >
                  {/* border-2 border-green-500 */}
                  {stream ? (
                     <video
                        ref={mediaRef}
                        autoPlay
                        playsInline
                        muted={isMe}
                        className="mt-2 rounded-lg shadow-lg w-[300px]"
                     />
                  ) : (
                     <Badge variant="destructive">No Stream</Badge>
                  )}
               </div>
            </CardContent>
            <CardFooter>
               <div className="flex flex-col items-center justify-between">
                  <CardDescription>
                     {
                        <div className="flex items-center space-x-2">
                           <label
                              htmlFor={`${id}-audio`}
                              className="cursor-pointer"
                           >
                              {!stream || muteAudio ? <MicOff /> : <Mic color={micColor} />}
                           </label>
                           <Checkbox
                              checked={muteAudio || !hasAudioTracks()}
                              style={{
                                 visibility: 'hidden',
                              }}
                              id={`${id}-audio`}
                              onCheckedChange={(e) => {
                                 setMuteAudio(e.valueOf() as boolean)
                              }}
                           />
                           <label
                              htmlFor={`${id}-video`}
                              className="cursor-pointer"
                           >
                              {!stream || muteVideo ? (
                                 <CameraOff/>
                              ) : (
                                 <Camera />
                              )}
                           </label>
                           <Checkbox
                              checked={muteVideo || !hasVideoTracks()}
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
