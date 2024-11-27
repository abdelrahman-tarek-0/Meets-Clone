import fs from 'fs'

import https from 'https'
import http from 'http'

import express from 'express'
import cors from 'cors'

import Paths from './utils/Paths.utils.js'

import socketServer from './sockets/index.socket.js'
import rooms from './global/rooms.global.js'

const port = process.env.PORT || 8080
const secure = process.env.SECURE === 'true'

const app = express()

app.use((_req, res, next) => {
   res.setHeader('x-powered-by', 'server')
   next()
})

const server = secure
   ? https.createServer(
        {
           cert: fs.readFileSync(Paths.root('ssl.dev', 'cert.pem')),
           key: fs.readFileSync(Paths.root('ssl.dev', 'key.pem')),
        },
        app
     )
   : http.createServer(app)

app.use(cors())


app.use(express.static(Paths.public()))

app.get('/api/rooms/', (_req, res) => {
   res.json(Object.values(rooms).map((room) => room.toJson()))
})

app.use((_req, res) => {
   res.status(404).sendFile(Paths.public('404.html'))
})


socketServer(server)

server.listen(port, () => {
   console.log(`[SERVER]: http${secure ? 's' : ''}://127.0.0.1:${port}`)
})
