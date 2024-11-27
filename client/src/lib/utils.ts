import { clsx, type ClassValue } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
}

export const getMediaStream = async (constraints: MediaStreamConstraints) => {
   try {
      if (!constraints.audio && !constraints.video) {
         return
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      return stream
   } catch (error) {
      const errorMessage = (error as Error)?.message || error
      toast.error(`Requesting media device failed: ${errorMessage}`)
      console.warn(error)
   }
}
