export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT'

export interface PromptCategory {
  id: number
  code: string
  name: string
}

export interface PromptLabel {
  code: string
  name: string
}

export interface PromptFile {
  id: string
  uuid: string
  category: string
  file_type: string
  position: number
  url: string
  thumbnail_url: string | null
  created_at: string | null
}

export interface Prompt {
  id: string
  uuid: string
  name: string
  description: string | null
  media_type: MediaType
  category: PromptCategory
  price: number
  bonus_credit: number
  enabled: boolean
  created_at: string | null
  updated_at: string | null
  cover: PromptFile
  pdf: PromptFile
  files: PromptFile[]
  labels: PromptLabel[]
}

export interface GetPromptsParams {
  page?: number
  page_size?: number
  [key: string]: unknown
}
