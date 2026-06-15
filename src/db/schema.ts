import {
  pgTable, serial, varchar, text, integer, boolean,
  timestamp, jsonb, real, pgEnum,
} from 'drizzle-orm/pg-core'

export const categoryEnum = pgEnum('category', ['AI', 'UI', 'Performance', 'Safety', 'Store', 'System'])
export const capabilityStatusEnum = pgEnum('capability_status', ['draft', 'needs_review', 'ready', 'deprecated'])
export const complexityEnum = pgEnum('complexity', ['Simple', 'Medium', 'Advanced'])
export const demoStatusEnum = pgEnum('demo_status', ['planned', 'implemented', 'deprecated'])
export const sourceTypeEnum = pgEnum('source_type', ['what_new_page', 'doc_page', 'sample_code', 'wwdc_session', 'news_post', 'third_party'])
export const ingestionStatusEnum = pgEnum('ingestion_status', ['pending', 'running', 'parsed', 'classified', 'failed'])

export const capabilities = pgTable('capabilities', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  whyItMatters: text('why_it_matters'),
  category: categoryEnum('category').notNull(),
  frameworks: text('frameworks').array().notNull().default([]),
  availability: varchar('availability', { length: 100 }).default('iOS 27+'),
  hardwareConstraints: text('hardware_constraints'),
  gotchas: text('gotchas'),
  impactScore: integer('impact_score').default(3).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  rankScore: real('rank_score').default(0).notNull(),
  status: capabilityStatusEnum('status').default('needs_review').notNull(),
  changeType: varchar('change_type', { length: 20 }).notNull().default('new'),
  changesSince: text('changes_since'),
  verifiedOnBeta: varchar('verified_on_beta', { length: 50 }),
  demoId: integer('demo_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  capabilityId: integer('capability_id').references(() => capabilities.id, { onDelete: 'cascade' }),
  type: sourceTypeEnum('type').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  summary: text('summary'),
  official: boolean('official').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const demos = pgTable('demos', {
  id: serial('id').primaryKey(),
  capabilityId: integer('capability_id').references(() => capabilities.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  complexity: complexityEnum('complexity').notNull(),
  codeSnippet: text('code_snippet'),
  previousCodeSnippet: text('previous_code_snippet'),
  repoUrl: varchar('repo_url', { length: 1000 }),
  previewMediaUrl: varchar('preview_media_url', { length: 1000 }),
  status: demoStatusEnum('status').default('planned').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const ingestionEvents = pgTable('ingestion_events', {
  id: serial('id').primaryKey(),
  topicInput: varchar('topic_input', { length: 500 }).notNull(),
  sourceUrl: varchar('source_url', { length: 1000 }),
  status: ingestionStatusEnum('status').default('pending').notNull(),
  parsedPayload: jsonb('parsed_payload'),
  errorMessage: text('error_message'),
  capabilityId: integer('capability_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── User ingestion requests ──────────────────────────────────────────────────

export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected', 'ingested'])

export const userRequests = pgTable('user_requests', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  topicInput: varchar('topic_input', { length: 500 }).notNull(),
  sourceUrl: varchar('source_url', { length: 1000 }),
  status: requestStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  voteCount: integer('vote_count').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── User auth / progress tables ─────────────────────────────────────────────

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  subscribedFrameworks: text('subscribed_frameworks').array().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull(),
  capabilityId: integer('capability_id').references(() => capabilities.id, { onDelete: 'cascade' }).notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
})

export const emailSignups = pgTable('email_signups', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  source: varchar('source', { length: 50 }).default('landing').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userStreaks = pgTable('user_streaks', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActivityDate: varchar('last_activity_date', { length: 10 }), // legacy, unused
  lastActivityAt: timestamp('last_activity_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
