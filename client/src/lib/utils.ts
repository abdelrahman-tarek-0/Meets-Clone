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

export const monitorAudioActivity = (
   stream: MediaStream,
   update: (status: string) => void
) => {
   const audioContext = new AudioContext()
   const analyser = audioContext.createAnalyser()
   analyser.fftSize = 256
   const source = audioContext.createMediaStreamSource(stream)
   source.connect(analyser)

   const dataArray = new Uint8Array(analyser.frequencyBinCount)
   const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray)
      const volume =
         dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length

      const threshold = 10
      if (volume > threshold) {
         update('active')
      } else {
         update('inactive')
      }
   }

   return setInterval(() => {
      checkVolume()
   }, 20)
}
