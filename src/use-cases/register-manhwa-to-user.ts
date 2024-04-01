import { UserManhwaRepository } from '@/repositories/user-manhwa-repository'
import { ManhwaUserManhwa, UserManhwa } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { ManhwasRepository } from '@/repositories/manhwas-repository'
import { ManhwaAlreadyExistsError } from './errors/manhwa-already-exists-error'

interface AddManhwaToUserManhwaUseCaseRequest {
  user_id: string
  manhwa: ManhwaUserManhwa
}

interface AddManhwaToUserManhwaUseCaseReponse {
  userManhwa: UserManhwa
}

export class AddManhwaToUserManhwaUseCase {
  constructor(
    private userManhwaRepository: UserManhwaRepository,
    private manhwaRepository: ManhwasRepository,
  ) {}

  async execute({
    user_id,
    manhwa,
  }: AddManhwaToUserManhwaUseCaseRequest): Promise<AddManhwaToUserManhwaUseCaseReponse> {
    const manhwaExists = await this.manhwaRepository.findByID(manhwa.manhwa_id)

    if (!manhwaExists) {
      throw new ResourceNotFoundError()
    }

    const manhwaAlreadyRegistered =
      await this.userManhwaRepository.findByManhwaID(user_id, manhwa.manhwa_id)

    if (manhwaAlreadyRegistered) {
      throw new ManhwaAlreadyExistsError()
    }

    const getQtyManhwas = await this.userManhwaRepository.getQtyManhwas(user_id)

    manhwa.manhwa_position = getQtyManhwas !== null ? getQtyManhwas : 0

    const userManhwa = await this.userManhwaRepository.addManhwa(
      user_id,
      manhwa,
    )

    if (!userManhwa) {
      throw new ResourceNotFoundError()
    }

    return {
      userManhwa,
    }
  }
}
