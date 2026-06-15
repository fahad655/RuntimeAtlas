import { generateText, Output } from 'ai'
import { z } from 'zod'
import type { ScrapedDoc } from './scraper'

const CapabilitySchema = z.object({
  // Gate field — checked before writing to DB
  isNewOrChangedInIOS27: z.boolean().describe(
    'TRUE if and only if this capability was introduced, significantly updated, or deprecated specifically in iOS 27 / WWDC 2026. ' +
    'FALSE if this is a pre-existing API with no meaningful changes in iOS 27 (e.g. UIKit basics, Core Data, old SwiftUI APIs). ' +
    'When FALSE, set rejectionReason to a short explanation.'
  ),
  rejectionReason: z.string().optional().describe(
    'Required when isNewOrChangedInIOS27 is FALSE. Short sentence explaining why this topic is not iOS 27-specific (e.g. "UITableView has existed since iOS 2 and has no new iOS 27 APIs").'
  ),

  name: z.string().describe('Clear capability name (e.g., "Foundation Models Framework")'),
  slug: z.string().describe('URL-friendly kebab-case slug, all lowercase, no special chars'),
  summary: z.string().describe('1-2 sentence plain-English summary of what this is'),
  whyItMatters: z.string().describe('2-3 bullet points (one per line, starting with "•") on why developers should care'),
  category: z.enum(['AI', 'UI', 'Performance', 'Safety', 'Store', 'System']),
  frameworks: z.array(z.string()).describe('Apple frameworks involved, e.g. ["FoundationModels", "SwiftUI"]'),
  availability: z.string().describe('Min OS requirement, e.g. "iOS 27+" or "iOS 27+ (Apple Intelligence device required)"'),
  hardwareConstraints: z.string().optional().describe('Hardware, region, or device model limitations if any'),
  gotchas: z.string().optional().describe('Common pitfalls, API quirks, beta limitations, private vs public status'),
  impactScore: z.number().int().min(1).max(5).describe('1=niche edge case, 3=solid addition, 5=every app developer must know this'),
  changeType: z.enum(['new', 'updated', 'deprecated']).describe('"new" if this API/feature did not exist before iOS 27; "updated" if it existed before but has significant changes in iOS 27; "deprecated" if it was removed or deprecated in iOS 27'),
  changesSince: z.string().optional().describe('Only if changeType is "updated" or "deprecated": 2-4 bullet points (starting with "•") describing what concretely changed vs the previous iOS version'),
  demo: z.object({
    title: z.string().describe('Demo project name, e.g. "On-Device Text Summarizer"'),
    description: z.string().describe('1-2 sentence description of what the demo app shows'),
    complexity: z.enum(['Simple', 'Medium', 'Advanced']),
    codeSnippet: z.string().describe('Real, compilable Swift/SwiftUI code demonstrating the core iOS 27 API. Include imports. ~30-60 lines. No pseudocode.'),
    previousCodeSnippet: z.string().optional().describe('Only when changeType is "updated": the equivalent compilable Swift code using the OLD pre-iOS-27 approach, covering the same use-case as codeSnippet. Must be real code with imports — not pseudocode. This is the "before" side of the diff shown to developers.'),
    keyApis: z.array(z.string()).describe('Key Apple API names used in the demo'),
  }),
})

export type ClassifiedCapability = z.infer<typeof CapabilitySchema>

export async function classifyAndBrief(
  topicInput: string,
  docsContent: ScrapedDoc[],
  wwdcTranscript: string,
  wwdcSessionTitle?: string,
): Promise<ClassifiedCapability> {
  const docsSection = docsContent.length
    ? docsContent.map(d => `### ${d.title}\nURL: ${d.url}\n\n${d.bodyText}`).join('\n\n---\n\n')
    : 'No documentation scraped. Use your knowledge of this iOS 27 capability.'

  const transcriptSection = wwdcTranscript
    ? `\n\n## WWDC Session Transcript\n${wwdcSessionTitle ? `Session: "${wwdcSessionTitle}"\n` : ''}${wwdcTranscript.slice(0, 12000)}`
    : ''

  const { output } = await generateText({
    model: 'anthropic/claude-sonnet-4.6',
    output: Output.object({ schema: CapabilitySchema }),
    prompt: `You are an expert iOS engineer and technical writer creating content for RuntimeAtlas — a reference site that makes new iOS SDK capabilities immediately scannable and usable.

CRITICAL GATE: This site ONLY covers APIs and features introduced, significantly updated, or deprecated in iOS 27 / WWDC 2026. Before filling in any other field, you MUST decide whether this topic qualifies:
- Set isNewOrChangedInIOS27 = true ONLY if this capability is genuinely new, meaningfully changed, or deprecated in iOS 27.
- Set isNewOrChangedInIOS27 = false if this is a pre-existing API with no meaningful iOS 27 changes (e.g. UITableView, Core Data basics, old UIKit patterns). In that case set rejectionReason to a short sentence and you can leave all other fields as minimal placeholders — they will be discarded.

Topic: "${topicInput}"

## Apple Documentation
${docsSection}
${transcriptSection}

Create a capability card. Rules:
- The code snippet MUST be real, compilable Swift/SwiftUI using actual Apple APIs — not pseudocode, no <#placeholder#> syntax
- Focus the demo on one core concept a developer can understand in 60 seconds
- Use current Swift syntax targeting iOS 27+ / Xcode 16+
- Include proper imports at the top
- For the slug: all lowercase, hyphens between words, no symbols
- impactScore: be honest — most things are 2-3, reserve 5 for genuinely high-impact APIs every developer will encounter`,
  })

  return output!
}
