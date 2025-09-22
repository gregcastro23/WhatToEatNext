export type PlanetaryHourUpdate = {
  planet: 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn',
  start: string,
  end: string,
},

export type EnergyUpdate = {
  Fire: number,
  Water: number,
  Air: number,
  Earth: number,
},

export type CelestialEvent = {
  type: string,
  timestamp: string,
  detail?: string,
},

export type WSMessage =
  | { channel: 'planetary_hours'; data: PlanetaryHourUpdate }
  | { channel: 'energy_updates'; data: EnergyUpdate }
  | { channel: 'celestial_events'; data: CelestialEvent },

export class AlchmWebSocket {
  private ws: WebSocket | null = null,
  private readonly url: string | undefined = process.env.NEXT_PUBLIC_WEBSOCKET_URL,

  connect(): void {
    if (!this.url) return,
    this.ws = new WebSocket(this.url)
    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data as string)
        this.handleMessage(message)
      } catch {
        // ignore malformed messages
      }
    },
  }

  private handleMessage(message: WSMessage): void {
    switch (message.channel) {
      case 'planetary_hours':
        this.updatePlanetaryHour(message.data)
        break,
      case 'energy_updates':
        this.updateEnergy(message.data)
        break,
      case 'celestial_events':
        this.updateCelestial(message.data)
        break,
      default:
        break,
    }
  }

  // Placeholder handlers; wire to stores/contexts as needed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updatePlanetaryHour(_data: PlanetaryHourUpdate): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateEnergy(_data: EnergyUpdate): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateCelestial(_data: CelestialEvent): void {}
}

export const alchmWs = new AlchmWebSocket()
