import 'reflect-metadata'
import express from 'express'
import bodyParser from 'body-parser'
import http from 'http'
import { container, InjectionToken } from 'tsyringe'
import dotenv from 'dotenv'
import { resolve } from 'path'

import { EventAdapter } from './infrastructure/adapters/EventAdapter'
import { SocketIOAdapter } from './infrastructure/adapters/SocketIOAdapter'
import { EventService } from './application/EventService'
import { AuthServiceImpl } from './infrastructure/adapters/AuthServiceImpl'
import { NotificationAdapter } from './infrastructure/adapters/NotificationAdapter'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../../../.env') })

// Validate essential environment variables
const jwtKey = process.env.JWT_SIMMETRIC_KEY
if (!jwtKey) {
  throw new Error('JWT_SIMMETRIC_KEY is not defined in the environment variables')
}

const app = express()
app.use(bodyParser.json())

const server = http.createServer(app)

// Register JWT Key as a constant in the DI container
const JWT_KEY_TOKEN: InjectionToken<string> = 'JWT_SIMMETRIC_KEY'
container.registerInstance(JWT_KEY_TOKEN, jwtKey)
container.registerInstance('HttpServer', server)
container.registerSingleton('EventOutputPort', SocketIOAdapter)
container.registerSingleton('AuthServicePort', AuthServiceImpl)
container.registerSingleton('EventInputPort', EventService)
container.registerSingleton('NotificationServicePort', NotificationAdapter)

const eventAdapter = container.resolve(EventAdapter)
eventAdapter.initialize()

// Mount routes
app.use('/', eventAdapter.getRouter())

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
