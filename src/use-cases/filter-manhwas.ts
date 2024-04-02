import { ManhwasRepository } from '@/repositories/manhwas-repository'
import { ResourceNotFoundError } from './errors/resource-not-found'
import { Page, Pageable } from '@/lib/pageable'

interface FilterManhwasUseCaseRequest {
  nameToFilter: string
  params: Page
}

interface manhwaListResponse {
  manhwaId: string
  manhwaName: string
  lastEpisodeReleased: number
}

interface FilterManhwaByNameUseCaseReponse {
  previousPage: number | null
  currentPage: number
  nextPage: number | null
  lastPage: boolean
  totalPages: number
  totalItems: number
  maxItemsPerPage: number
  totalItemsPage: number
  items: manhwaListResponse[]
}

export class FilterManhwaByNameUseCase extends Pageable<manhwaListResponse> {
  constructor(private manhwasRepository: ManhwasRepository) {
    super()
  }

  async execute({
    nameToFilter,
    params,
  }: FilterManhwasUseCaseRequest): Promise<FilterManhwaByNameUseCaseReponse> {
    const manhwaFilteredByName = await this.manhwasRepository.filterByName(
      nameToFilter,
    )

    if (!manhwaFilteredByName || manhwaFilteredByName.length === 0) {
      throw new ResourceNotFoundError()
    }

    const items = manhwaFilteredByName.map((manhwa) => {
      return {
        manhwaId: manhwa.id,
        manhwaName: manhwa.name,
        lastEpisodeReleased: manhwa.last_episode_released,
      }
    })

    const manhwa = this.buildPagination(items, this.buildPage(params))

    return {
      previousPage: manhwa.previousPage,
      currentPage: manhwa.currentPage,
      nextPage: manhwa.nextPage,
      lastPage: manhwa.lastPage,
      totalPages: manhwa.totalPages,
      totalItems: manhwa.totalItems,
      maxItemsPerPage: manhwa.maxItemsPerPage,
      totalItemsPage: manhwa.totalItemsPage,
      items: manhwa.items,
    }
  }
}
