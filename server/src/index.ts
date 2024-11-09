import express, { Express, Request, Response } from 'express'
import Paths from '@/utils/Paths.utils'

const app: Express = express()
const port = process.env.PORT || 8080

app.use(express.static(Paths.public()))

app.get('/', (_req: Request, res: Response) => {
   res.send('Express + TypeScript Server')
})

app.listen(port, () => {
   console.log(`[server]: Server is running at http://localhost:${port}`)
})
