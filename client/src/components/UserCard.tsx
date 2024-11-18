import { useEffect, useRef } from 'react'

import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
   const mediaRef = useRef<HTMLVideoElement>(null)

   useEffect(() => {
      if (!mediaRef.current || !stream) return

      mediaRef.current.srcObject = stream

      return () => {
         if (mediaRef.current) {
            mediaRef.current.srcObject = null
         }
      }
   })

   return (
      <Card>
         <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{id}</CardDescription>
         </CardHeader>
         <CardContent>
            <div className="flex items-center justify-center">
               {stream && stream.getVideoTracks().length > 0 && (
                  <video
                     ref={mediaRef}
                     autoPlay
                     playsInline
                     muted={isMe}
                     style={{
                        width: '200px',
                        height: 'auto',
                        borderRadius: '8px',
                        maxWidth: '200px',
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
            <div className="flex items-center justify-between">
               <CardDescription>
                  {isMe && <Badge variant="secondary">You</Badge>}
                  {!isMe &&
                     (isConnected ? (
                        <Badge>Connected</Badge>
                     ) : (
                        <Badge variant="destructive">Not Connected</Badge>
                     ))}
               </CardDescription>
            </div>
         </CardFooter>
      </Card>
   )
}
