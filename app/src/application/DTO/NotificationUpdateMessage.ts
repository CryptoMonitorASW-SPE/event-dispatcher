import { CryptoPriceData } from '../../domain/model/CryptoPriceData'
import { Event } from '../../domain/model/Event'

export interface NotificationUpdateMessage {
  timestamp: string
  payload: CryptoPriceData[]
}

export function createNotificationUpdateMessage(
  timestamp: string,
  eventInbound: Event
): NotificationUpdateMessage {
  const cryptoPriceData: CryptoPriceData[] = eventInbound.payload.map(
    (crypto: { id: string; symbol: string; price: number }) => ({
      id: crypto.id,
      symbol: crypto.symbol,
      price: crypto.price
    })
  )

  return {
    timestamp,
    payload: cryptoPriceData
  }
}
