import { ManhwaUserManhwa, Prisma, UserManhwa } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { UserManhwaRepository } from '../user-manhwa-repository'

export class PrismaUserManhwaRepository implements UserManhwaRepository {
  async create(data: Prisma.UserManhwaCreateInput): Promise<UserManhwa> {
    const userManhwa = await prisma.userManhwa.create({
      data,
    })

    return userManhwa
  }

  async addManhwa(
    userID: string,
    data: Prisma.ManhwaUserManhwaCreateInput,
  ): Promise<UserManhwa | null> {
    const manhwa = await prisma.userManhwa.findFirst({
      where: {
        user_id: userID,
      },
    })

    const updatedUser = await prisma.userManhwa.update({
      where: { id: manhwa?.id },
      data: {
        manhwas: { push: data },
      },
      include: { manhwas: true },
    })

    if (!updatedUser) {
      return null
    }

    return updatedUser
  }

  async removeManhwa(
    userID: string,
    manhwasID: string[],
  ): Promise<UserManhwa | null> {
    const userManhwa = await prisma.userManhwa.findFirst({
      where: { user_id: userID },
    })

    if (!userManhwa) {
      return null
    }

    const manhwasToRemove = userManhwa.manhwas.filter((manhwa) =>
      manhwasID.includes(manhwa.manhwa_id),
    )

    if (
      manhwasToRemove.length === 0 ||
      manhwasToRemove.length !== manhwasID.length
    ) {
      return null
    }

    userManhwa.manhwas = userManhwa.manhwas.filter(
      (manhwa) => !manhwasID.includes(manhwa.manhwa_id),
    )

    await prisma.userManhwa.update({
      where: { id: userManhwa.id },
      data: {
        manhwas: {
          set: userManhwa.manhwas,
        },
      },
    })

    return userManhwa
  }

  async getAllManhwas(userID: string): Promise<ManhwaUserManhwa[] | null> {
    const userManhwa = await prisma.userManhwa.findFirst({
      where: { user_id: userID },
    })

    if (!userManhwa) {
      return null
    }

    if (userManhwa.manhwas.length === 0) {
      return null
    }

    return userManhwa.manhwas
  }

  async getManhwasByProfile(
    userID: string,
    page?: number,
  ): Promise<UserManhwa | null> {
    const userManhwa = await prisma.userManhwa.findFirst({
      where: { user_id: userID },
    })

    if (!userManhwa) {
      return null
    }

    return userManhwa
  }

  async getTelegramUser(userID: string): Promise<{
    telegramID: string | null
    telegramActive: boolean | null
  } | null> {
    const userManhwa = await prisma.userManhwa.findFirst({
      where: { user_id: userID },
    })

    if (!userManhwa) {
      return null
    }

    const telegramUser = {
      telegramID: userManhwa.telegram_id,
      telegramActive: userManhwa.telegram_active,
    }

    return telegramUser
  }

  async updateTelegramUser(
    userID: string,
    telegramID: string,
    telegramActive: boolean,
  ): Promise<{ telegramID: string; telegramActive: boolean }> {
    const user = await prisma.userManhwa.findFirst({
      where: {
        user_id: userID,
      },
    })

    await prisma.userManhwa.update({
      where: {
        id: user?.id,
      },
      data: {
        telegram_id: telegramID,
        telegram_active: telegramActive,
      },
    })

    return {
      telegramID,
      telegramActive,
    }
  }

  updateManhwaOrder(
    userID: string,
    order: { manhwa_id: string; manhwa_position: number }[],
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }

  async findByManhwaID(
    userID: string,
    manhwaID: string,
  ): Promise<UserManhwa | null> {
    const manhwa = await prisma.userManhwa.findFirst({
      where: {
        user_id: userID,
        manhwas: {
          some: {
            manhwa_id: manhwaID,
          },
        },
      },
    })

    return manhwa
  }

  async getQtyManhwas(userID: string): Promise<number | null> {
    const userManhwa = await prisma.userManhwa.findFirst({
      where: {
        user_id: userID,
      },
    })

    const user = await prisma.userManhwa.findUnique({
      where: {
        id: userManhwa?.id,
      },
      select: {
        manhwas: true,
      },
    })

    if (!user) {
      return null
    }

    return user.manhwas.length
  }
}
