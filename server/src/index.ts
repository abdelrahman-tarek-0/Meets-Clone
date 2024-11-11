import fs from 'fs'
import https from 'https'

import express from 'express'
import cors from 'cors'

import Paths from './utils/Paths.utils.js'

import socketServer from './sockets/index.socket.js'

const port = process.env.PORT || 8080
const app = express()

app.use((_req, res, next) => {
   res.setHeader('x-powered-by', 'server')
   next()
})

const server = https.createServer(
   {
      cert: fs.readFileSync(Paths.root('ssl.dev', 'cert.pem')),
      key: fs.readFileSync(Paths.root('ssl.dev', 'key.pem')),
   },
   app
)

app.use(cors())
app.use(express.static(Paths.public()))

app.use((_req, res) => {
   res.status(404).sendFile(Paths.public('404.html'))
})
socketServer(server)
server.listen(port, () => {
   console.log(`[SERVER]: https://127.0.0.1:${port}`)
})
