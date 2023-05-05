import { UserManhwaRepository } from '@/repositories/user-manhwa-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { ManhwaUserManhwa, UserManhwa } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { ManhwasRepository } from '@/repositories/manhwas-repository'
import { ManhwaAlreadyExistsError } from './errors/manhwa-already-exists-error'

interface AddManhwaToUserManhwaUseCaseRequest {
  user_id: string
  manhwas: ManhwaUserManhwa
}

interface AddManhwaToUserManhwaUseCaseReponse {
  userManhwa: UserManhwa
}

export class AddManhwaToUserManhwaUseCase {
  constructor(
    private userManhwaRepository: UserManhwaRepository,
    private usersRepository: UsersRepository,
    private manhwaRepository: ManhwasRepository,
  ) {}

  async execute({
    user_id,
    manhwas,
  }: AddManhwaToUserManhwaUseCaseRequest): Promise<AddManhwaToUserManhwaUseCaseReponse> {
    const userExists = await this.usersRepository.findByID(user_id)

    if (!userExists) {
      throw new ResourceNotFoundError()
    }

    const manhwaExists = await this.manhwaRepository.findByID(manhwas.manhwa_id)

    if (!manhwaExists) {
      throw new ResourceNotFoundError()
    }

    const manhwaAlreadyRegistered =
      await this.userManhwaRepository.findByManhwaID(user_id, manhwas.manhwa_id)

    if (manhwaAlreadyRegistered) {
      throw new ManhwaAlreadyExistsError()
    }

    const getQtyManhwas = await this.userManhwaRepository.getQtyManhwas(user_id)

    if (getQtyManhwas === null) {
      throw new ResourceNotFoundError()
    }

    manhwas.manhwa_position = getQtyManhwas

    const userManhwa = await this.userManhwaRepository.addManhwa(
      user_id,
      manhwas,
    )

    if (!userManhwa) {
      throw new ResourceNotFoundError()
    }

    return {
      userManhwa,
    }
  }
}
