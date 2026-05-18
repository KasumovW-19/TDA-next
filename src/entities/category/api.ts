export type Category = {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    sort_order: number
    is_active: boolean
    created_at: string
  }
  
  export const getCategories = async (): Promise<Category[]> => {
    const response = await fetch('/api/categories', {
      cache: 'no-store',
    })
  
    const result = (await response.json()) as {
      categories?: Category[]
      message?: string
    }
  
    if (!response.ok || !result.categories) {
      throw new Error(result.message || 'Не удалось загрузить категории')
    }
  
    return result.categories
  }