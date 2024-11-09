import path from 'path'
import { fileURLToPath } from 'url'
import express, { Express, Request, Response } from 'express'

const app: Express = express()
const port = process.env.PORT || 8080

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (_req: Request, res: Response) => {
   res.send('Express + TypeScript Server')
})

app.listen(port, () => {
   console.log(`[server]: Server is running at http://localhost:${port}`)
})
