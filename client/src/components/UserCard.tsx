import { useState, useEffect, useRef } from 'react'

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
   isConnected: boolean
   stream: MediaStream | null
}
export default function UserCard({
   id,
   name,
   isConnected,
   isMe,
   stream,
}: UserCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (!videoRef.current || !stream) return
    
        videoRef.current.srcObject = stream
    
        return () => {
            videoRef.current!.srcObject = null
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
               <video
                  ref={videoRef}
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
