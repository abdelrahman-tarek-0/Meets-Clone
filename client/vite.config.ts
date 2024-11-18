import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), basicSsl()],
   resolve: {
      alias: {
         '@': path.resolve(__dirname, './src'),
      },
   },

   define: {
      global: {},
   },
})
