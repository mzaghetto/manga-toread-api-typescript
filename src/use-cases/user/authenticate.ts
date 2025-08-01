import { UsersRepository } from '@/repositories/users-repository'
import { compare } from 'bcryptjs'
import { Users } from '@prisma/client'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: Users
}

export class AuthenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (!user.password_hash) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await compare(password, user.password_hash)

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    await this.usersRepository.findByIDAndUpdate(user.id, {
      lastLogin: new Date(),
    })

    return {
      user,
    }
  }
}
