import { Manhwas } from '@prisma/client'
import { randomUUID } from 'crypto'
import { ManhwasRepository } from '../manhwas-repository'

export class InMemoryManhwasRepository implements ManhwasRepository {
  public items: Manhwas[] = []

  async create(data: Manhwas): Promise<Manhwas> {
    const manhwa = {
      id: data.id ?? randomUUID(),
      name: data.name,
      last_episode_released: data.last_episode_released,
      last_episode_notified: data.last_episode_notified,
      available_read_url: data.available_read_url,
      manhwa_thumb: data.manhwa_thumb,
      url_crawler: data.url_crawler,
      users_to_notify: [],
    }

    this.items.push(manhwa)

    return manhwa
  }

  async findByName(name: string): Promise<Manhwas | null> {
    const manhwa = this.items.find((item) => item.name === name)

    if (!manhwa) {
      return Promise.resolve(null)
    }

    return Promise.resolve(manhwa)
  }

  async filterByName(name: string): Promise<Manhwas[] | null> {
    const filteredItems = this.items.filter((item) => item.name.includes(name))

    if (filteredItems.length === 0 || !filteredItems) {
      return Promise.resolve(null)
    }

    return Promise.resolve(filteredItems)
  }

  async findByID(manhwaID: string): Promise<Manhwas | null> {
    const indexOfManhwa = this.items.findIndex((item) => item.id === manhwaID)

    if (indexOfManhwa === -1) {
      return Promise.resolve(null)
    }

    return Promise.resolve(this.items[indexOfManhwa])
  }

  async findByIDs(manhwasID: string[]): Promise<Manhwas[] | null> {
    const indexOfManhwas = manhwasID.map((manhwa) => {
      return this.items.findIndex((item) => item.id === manhwa)
    })

    if (indexOfManhwas.includes(-1)) {
      return Promise.resolve(null)
    }

    const filteredItems = indexOfManhwas.map((item) => {
      return this.items[item]
    })

    return Promise.resolve(filteredItems)
  }

  async findByIDAndUpdate(
    manhwaID: string,
    data: Manhwas,
  ): Promise<Manhwas | null> {
    const indexOfManhwa = this.items.findIndex((item) => item.id === manhwaID)

    if (indexOfManhwa === -1) {
      return Promise.resolve(null)
    }

    this.items[indexOfManhwa] = {
      ...this.items[indexOfManhwa],
      ...data,
    }

    return Promise.resolve(this.items[indexOfManhwa])
  }
}
