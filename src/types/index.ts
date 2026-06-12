export type Category = 'AI' | 'UI' | 'Performance' | 'Safety' | 'Store' | 'System'
export type CapabilityStatus = 'draft' | 'needs_review' | 'ready' | 'deprecated'
export type Complexity = 'Simple' | 'Medium' | 'Advanced'
export type DemoStatus = 'planned' | 'implemented' | 'deprecated'
export type SourceType = 'what_new_page' | 'doc_page' | 'sample_code' | 'wwdc_session' | 'news_post' | 'third_party'
export type IngestionStatus = 'pending' | 'running' | 'parsed' | 'classified' | 'failed'

export interface Capability {
  id: number
  slug: string
  name: string
  summary: string
  whyItMatters?: string | null
  category: Category
  frameworks: string[]
  availability: string
  hardwareConstraints?: string | null
  gotchas?: string | null
  impactScore: number
  viewCount: number
  rankScore: number
  status: CapabilityStatus
  demoId?: number | null
  createdAt: Date
  updatedAt: Date
}

export interface Source {
  id: number
  capabilityId: number
  type: SourceType
  title: string
  url: string
  summary?: string | null
  official: boolean
  createdAt: Date
}

export interface Demo {
  id: number
  capabilityId: number
  title: string
  description: string
  complexity: Complexity
  codeSnippet?: string | null
  repoUrl?: string | null
  previewMediaUrl?: string | null
  status: DemoStatus
  createdAt: Date
}

export interface IngestionEvent {
  id: number
  topicInput: string
  sourceUrl?: string | null
  status: IngestionStatus
  parsedPayload?: Record<string, unknown> | null
  errorMessage?: string | null
  capabilityId?: number | null
  createdAt: Date
}

export interface IngestTriggerInput {
  topic: string
  url?: string
}

export interface ClassifiedCapability {
  name: string
  slug: string
  summary: string
  whyItMatters: string
  category: Category
  frameworks: string[]
  availability: string
  hardwareConstraints?: string
  gotchas?: string
  impactScore: number
  demo: {
    title: string
    description: string
    complexity: Complexity
    codeSnippet: string
    keyApis: string[]
  }
}
