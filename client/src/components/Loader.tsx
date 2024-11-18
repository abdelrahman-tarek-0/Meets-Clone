import LoaderGif from '/images/loader.gif?url'
import { motion } from 'framer-motion'

export default function Loader({
   noStyle,
   width,
   height,
}: {
   noStyle?: boolean
   width?: string
   height?: string
}) {
   const defaultStyle = {
      pointerEvents: 'none',
      userSelect: 'none',
      width: width || '100px',
      height: height || '100px',
   }

   const styled = noStyle
      ? {}
      : {
           borderRadius: '50%',
           padding: '20px',
           backgroundColor: 'rgba(0, 0, 0, 0.7)',
           boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
        }

   return (
      <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
         <img
            src={LoaderGif}
            alt="Live"
            style={{ ...defaultStyle, ...styled } as React.CSSProperties}
            className=""
         />
      </motion.div>
   )
}
