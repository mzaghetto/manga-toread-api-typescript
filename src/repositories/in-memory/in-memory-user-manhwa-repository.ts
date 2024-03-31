import { ManhwaUserManhwa, UserManhwa } from '@prisma/client'
import { randomUUID } from 'crypto'
import { UserManhwaRepository } from '../user-manhwa-repository'

export class InMemoryUserManhwaRepository implements UserManhwaRepository {
  public items: UserManhwa[] = []

  async create(data: UserManhwa): Promise<UserManhwa> {
    const userManhwa = {
      user_id: data.user_id,
      id: data.id ?? randomUUID(),
      manhwas: [],
      telegram_active: false,
      telegram_id: null,
    }

    this.items.push(userManhwa)

    return Promise.resolve(userManhwa)
  }

  async addManhwa(
    userID: string,
    data: ManhwaUserManhwa,
  ): Promise<UserManhwa | null> {
    const userIDManhwa = this.items.find((item) => item.user_id === userID)

    if (!userIDManhwa) {
      return Promise.resolve(null)
    }

    userIDManhwa.manhwas.push(data)

    return Promise.resolve(userIDManhwa)
  }

  async removeManhwa(
    userID: string,
    manhwaID: string,
  ): Promise<UserManhwa | null> {
    const userIDManhwa = this.items.find((item) => item.user_id === userID)

    if (userIDManhwa?.manhwas) {
      const manhwaIDIndex = userIDManhwa.manhwas.findIndex(
        (item) => item.manhwa_id === manhwaID,
      )

      if (manhwaIDIndex === -1) {
        return Promise.resolve(null)
      }

      userIDManhwa.manhwas.splice(manhwaIDIndex, 1)

      return Promise.resolve(userIDManhwa)
    }

    return Promise.resolve(null)
  }

  async getAllManhwas(userID: string): Promise<ManhwaUserManhwa[] | null> {
    const userIDManhwa = this.items.find((item) => item.user_id === userID)

    if (!userIDManhwa) {
      return Promise.resolve(null)
    }

    return Promise.resolve(userIDManhwa.manhwas)
  }

  async getManhwasByProfile(
    userID: string,
    page: number,
  ): Promise<UserManhwa | null> {
    const userIDManhwa = this.items.find((item) => item.user_id === userID)

    if (!userIDManhwa) {
      return Promise.resolve(null)
    }

    userIDManhwa.manhwas = userIDManhwa.manhwas.slice(
      (page - 1) * 20,
      page * 20,
    )

    return Promise.resolve(userIDManhwa)
  }

  async updateManhwaOrder(
    userID: string,
    order: { manhwa_id: string; manhwa_position: number }[],
  ): Promise<string> {
    const userIDManhwa = this.items.filter((item) => item.user_id === userID)

    userIDManhwa.map((user) => {
      const manhwaList = user.manhwas
      const updatedManhwas = order
        .map((manhwa) => {
          const matchingManhwas = manhwaList.filter(
            (item) => item.manhwa_id === manhwa.manhwa_id,
          )
          matchingManhwas.forEach((matchingManhwa) => {
            matchingManhwa.manhwa_position = manhwa.manhwa_position
          })
          return matchingManhwas
        })
        .flat()

      user.manhwas = updatedManhwas
      return user
    })

    return Promise.resolve('Atualizado com sucesso!')
  }

  async findByManhwaID(
    userID: string,
    manhwaID: string,
  ): Promise<UserManhwa | null> {
    const userIDManhwa = this.items.find((item) => item.user_id === userID)

    if (!userIDManhwa) {
      return Promise.resolve(null)
    }

    const manhwaById = userIDManhwa.manhwas.find(
      (manhwa) => manhwa.manhwa_id === manhwaID,
    )

    if (!manhwaById) {
      return Promise.resolve(null)
    }

    return Promise.resolve(userIDManhwa)
  }

  async getQtyManhwas(userID: string): Promise<number | null> {
    const userIDManhwa = this.items.find((item) => item.user_id === userID)

    if (!userIDManhwa) {
      return Promise.resolve(null)
    }

    return Promise.resolve(userIDManhwa.manhwas.length)
  }
}
