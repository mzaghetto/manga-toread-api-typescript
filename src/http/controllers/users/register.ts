import { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import { EmailAlreadyExistsError } from '@/use-cases/errors/email-already-exists-error'
import { makeRegisterUserUseCase } from '@/use-cases/factories/make-register-use-case'
import { UsernameAlreadyExistsError } from '@/use-cases/errors/username-already-exists-error'
import { makeRegisterUserManhwaUseCase } from '@/use-cases/factories/make-register-user-manhwa-use-case'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
  })

  const { name, username, email, password } = registerBodySchema.parse(
    request.body,
  )

  try {
    const registerUserUseCase = makeRegisterUserUseCase()
    const registerUserManhwaUseCase = makeRegisterUserManhwaUseCase()

    const {
      user: { id },
    } = await registerUserUseCase.execute({
      name,
      username,
      email,
      password,
    })

    await registerUserManhwaUseCase.execute({
      user_id: id,
      manhwas: [],
      telegram_id: null,
    })
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    if (error instanceof UsernameAlreadyExistsError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }

  return reply.status(201).send()
}
