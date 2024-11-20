import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

export default function useMediaStream(constraint: MediaStreamConstraints) {
   const [stream, setStream] = useState<MediaStream | undefined>(undefined)
   const streamRef = useRef<MediaStream | null>(null) // To hold the latest stream

   useEffect(() => {
      if (!constraint.audio && !constraint.video) return
      console.log('Requesting media stream')
      navigator.mediaDevices
         .getUserMedia(constraint)
         .then((stream) => {
            setStream(stream)
            streamRef.current = stream
         })
         .catch((error) => {
            toast.error('Failed to access media devices')
            console.error(error)
         })

      return () => {
         console.log('Cleaning up media stream')
         streamRef.current?.getTracks().forEach((track) => {
            console.log('Stopping track', track)
            track.stop()
         })
         setStream(undefined)
         streamRef.current = null
      }
   }, [constraint])

   return stream
}
