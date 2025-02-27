import { expect } from 'chai'
import { describe, it, before, after } from 'mocha'
import { io as Client } from 'socket.io-client'
import http from 'http'
import sinon from 'sinon'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { container } from 'tsyringe'
import { SocketIOAdapter } from '../infrastructure/adapters/SocketIOAdapter'
import { AuthServiceImpl } from '../infrastructure/adapters/AuthServiceImpl'

/**
 * SocketIOAdapter Integration Tests using a real AuthServiceImpl.
 * Only mock external HTTP calls (axios) to avoid real network dependency.
 */

describe('SocketIOAdapter Integration with real Auth', () => {
  let server: http.Server
  const testPort = 3030
  let socketAdapter: SocketIOAdapter
  let axiosPostStub: sinon.SinonStub

  // Use a real JWT key from env or fallback
  const JWT_KEY = process.env.JWT_SIMMETRIC_KEY || 'changeme'
  const validToken = jwt.sign({ userId: 'testUser' }, JWT_KEY, { expiresIn: '1h' })
  const invalidToken = jwt.sign({ userId: 'testUser' }, 'wrongkey', { expiresIn: '1h' })

  // Additional tokens for multiple-client test
  const userA = 'testUserA'
  const userB = 'testUserB'
  const tokenA = jwt.sign({ userId: userA }, JWT_KEY, { expiresIn: '1h' })
  const tokenB = jwt.sign({ userId: userB }, JWT_KEY, { expiresIn: '1h' })

  before(done => {
    server = http.createServer()
    container.registerInstance('JWT_SIMMETRIC_KEY', JWT_KEY)
    container.registerSingleton('AuthServicePort', AuthServiceImpl)
    container.registerInstance('HttpServer', server)

    socketAdapter = container.resolve(SocketIOAdapter)

    server.listen(testPort, () => done())
    axiosPostStub = sinon.stub(axios, 'post').resolves({ data: 'ok' })
  })

  after(done => {
    axiosPostStub.restore()
    sinon.restore()
    if (server) {
      server.close(done)
    } else {
      done()
    }
  })

  describe('Public socket', () => {
    it('connects without auth and receives broadcasts', function (done) {
      this.timeout(5000)
      const client = Client(`http://localhost:${testPort}`, {
        path: '/updates',
        transports: ['websocket']
      })

      client.on('connect', () => {
        client.on('broadcastEUR', msg => {
          expect(msg).to.deep.equal({ data: 'crypto-eur-update' })
          client.disconnect()
          done()
        })
        socketAdapter.broadcastEUR({ data: 'crypto-eur-update' })
      })
    })
  })

  describe('Authenticated socket', () => {
    it('rejects connection with invalid token', done => {
      const client = Client(`http://localhost:${testPort}`, {
        path: '/user-updates',
        transports: ['websocket'],
        extraHeaders: {
          Cookie: `authToken=${invalidToken}`
        }
      })
      client.on('connect_error', err => {
        expect(err.message).to.match(/Unauthorized|invalid/i)
        client.disconnect()
        done()
      })
    })

    it('accepts connection with valid token', done => {
      const client = Client(`http://localhost:${testPort}`, {
        path: '/user-updates',
        transports: ['websocket'],
        extraHeaders: {
          Cookie: `authToken=${validToken}`
        }
      })
      client.on('connect', () => {
        expect(client.connected).equals(true)
        client.disconnect()
        done()
      })
      client.on('connect_error', err => {
        done(new Error(`Should not fail: ${err.message}`))
      })
    })

    it('sends user-specific messages to authenticated user', done => {
      const client = Client(`http://localhost:${testPort}`, {
        path: '/user-updates',
        transports: ['websocket'],
        extraHeaders: {
          Cookie: `authToken=${validToken}`
        }
      })
      client.on('connect', () => {
        client.on('user-specific-event', data => {
          expect(data).to.deep.equal({ test: 'personal-msg' })
          client.disconnect()
          done()
        })
        setTimeout(() => {
          socketAdapter.sendToUser('testUser', { test: 'personal-msg' })
        }, 100)
      })
    })

    it('only sends data to the specified user among multiple authenticated clients', done => {
      const clientA = Client(`http://localhost:${testPort}`, {
        path: '/user-updates',
        transports: ['websocket'],
        extraHeaders: { Cookie: `authToken=${tokenA}` }
      })
      const clientB = Client(`http://localhost:${testPort}`, {
        path: '/user-updates',
        transports: ['websocket'],
        extraHeaders: { Cookie: `authToken=${tokenB}` }
      })

      let receivedByA = false
      let receivedByB = false

      clientA.on('connect', () => {
        clientA.on('user-specific-event', msg => {
          receivedByA = true
          expect(msg).to.deep.equal({ test: 'only-for-A' })
          clientA.disconnect()
          checkDone()
        })
      })

      clientB.on('connect', () => {
        clientB.on('user-specific-event', () => {
          receivedByB = true
        })
      })

      // Give both time to connect and then send message
      setTimeout(() => socketAdapter.sendToUser(userA, { test: 'only-for-A' }), 200)

      function checkDone() {
        // Wait a bit to ensure B doesn't get the same event
        setTimeout(() => {
          clientB.disconnect()
          expect(receivedByA).equals(true)
          expect(receivedByB).equals(false)
          done()
        }, 200)
      }
    })
  })
})
