import { CryptoData } from '../../domain/model/CryptoData'

export interface ViewUpdateMessage {
  eventType: string
  timestamp: string
  payload: CryptoData[]
}

export function createViewUpdateMessage(
  timestamp: string,
  payload: CryptoData[]
): ViewUpdateMessage {
  return {
    eventType: 'CRYPTO_UPDATE',
    timestamp,
    payload
  }
}
