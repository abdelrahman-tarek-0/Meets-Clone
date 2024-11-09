import fs from 'fs'
import https from 'https'

import express from 'express'
import cors from 'cors'

import Paths from '@/utils/Paths.utils'

const port = process.env.PORT || 8080
const app = express()

const server = https.createServer(
   {
      cert: fs.readFileSync(Paths.root('ssl.dev', 'cert.pem')),
      key: fs.readFileSync(Paths.root('ssl.dev', 'key.pem')),
   },
   app
)

app.use(cors())
app.use(express.static(Paths.public()))

server.listen(port, () => {
   console.log(`[server]: Server is running at https://127.0.0.1:${port}`)
})
