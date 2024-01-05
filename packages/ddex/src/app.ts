/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Express, Request, Response } from 'express'
import path from 'path'
import * as uploadController from './controllers/uploadController'
import { createSdkService } from './services/sdkService'
import { createScheduledReleaseService } from './services/scheduledReleaseService'
import { createDbService } from './services/dbService'

/*
 * Initialize services
 */

const dbUrl =
  process.env.audius_db_url ||
  'postgres://postgres:postgres@localhost:5432/audius_discovery'
const dbService = createDbService(dbUrl)
const sdkService = createSdkService()
const scheduledReleaseService = createScheduledReleaseService(
  sdkService.getSdk()
)

/*
 * Setup app
 */

const app: Express = express()

/*
 * Define API routes
 */

app.post(
  '/api/upload',
  uploadController.postUploadXml(dbService, sdkService.getSdk())
)
app.get('/api/health_check', (req: Request, res: Response) => {
  res.status(200).send('DDEX is alive!')
})

/*
 * Serve the React app as static assets at the root path
 */

const isDev = process.env.IS_DEV === 'true'
const buildPath = isDev
  ? path.join(__dirname, '..', '..', 'ddex-frontend', 'dist')
  : path.join(__dirname, '..', 'public')
app.use(express.static(buildPath))
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(buildPath, 'index.html')) // Fallback for handling client-side routing
})

export default app
