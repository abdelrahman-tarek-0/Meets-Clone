import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function useMediaStream(constraint: MediaStreamConstraints) {
   const [stream, setStream] = useState<MediaStream | null>(null)

   useEffect(() => {
      navigator.mediaDevices
         .getUserMedia(constraint)
         .then((stream) => {
            setStream(stream)
         })
         .catch((error) => {
            toast.error('Failed to access media devices')
            console.error(error)
         })

      return () => {
         stream?.getTracks().forEach((track) => {
            track.stop()
         })
      }
   }, [])

   return stream
}
