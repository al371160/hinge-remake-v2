import type { PromptCategory } from '../types'

export const PROMPT_CATEGORY_META: { id: PromptCategory; label: string }[] = [
  { id: 'aboutMe', label: 'About Me' },
  { id: 'myType', label: 'My Type' },
  { id: 'letsChat', label: "Let's Chat About" },
  { id: 'dateVibes', label: 'Date Vibes' },
  { id: 'storytime', label: 'Storytime' },
  { id: 'selfCare', label: 'Self-Care' },
  { id: 'yourWorld', label: 'Your World' },
  { id: 'lgbtqia', label: 'LGBTQIA+' },
  { id: 'gettingPersonal', label: 'Getting Personal' },
  { id: 'voiceFirst', label: 'Voice-First' },
]

export const PROMPTS_BY_CATEGORY: Record<PromptCategory, string[]> = {
  aboutMe: [
    'Two truths and a lie',
    'Fact about me that surprises people',
    "I'm convinced that",
    'Dating me is like',
    'Unusual skills',
    'The dorkiest thing about me is',
    "I'm the type of texter who",
  ],
  myType: [
    'The way to win me over is',
    "I'm looking for",
    "I'll fall for you if",
    "We'll get along if",
    'Green flags I look for',
    'I go crazy for',
    'A boundary of mine is',
  ],
  letsChat: [
    'I geek out on',
    "I won't shut up about",
    'Change my mind about',
    "Let's debate about",
    'My most controversial opinion is',
    'Teach me something about',
  ],
  dateVibes: [
    'Together we could',
    'The best way to ask me out is by',
    "I'm a regular at",
    'First round is on me if',
    'The way to my table is',
    'On my bucket list',
  ],
  storytime: [
    'Best travel story',
    "Most spontaneous thing I've done",
    'Biggest risk I’ve taken',
    'Never have I ever',
    'I recently discovered that',
  ],
  selfCare: [
    'My simple pleasures',
    'I wind down by',
    'To me, relaxation is',
    'This week I’m grateful for',
    'My therapist would say I',
  ],
  yourWorld: [
    'Typical Sunday',
    'My love language is',
    "I'm in my element when",
    'The secret to getting to know me is',
    'How to pronounce my name',
  ],
  lgbtqia: [
    'You should not go out with me if',
    "I'm the same in real life as I am on here because",
    'Dating me is like',
    'Together, we could',
  ],
  gettingPersonal: [
    'My most irrational fear',
    'The hallmark of a good relationship is',
    'A boundary of mine is',
    'I feel most supported when',
    'What if I told you that',
  ],
  voiceFirst: [
    'How to pronounce my name',
    'My go-to karaoke song is',
    'Before we meet, you should listen to',
    'Two truths and a lie',
    'My best celebrity impression',
    'Proof I have musical talent',
  ],
}

const CATEGORY_BY_QUESTION = new Map<string, PromptCategory>(
  PROMPT_CATEGORY_META.flatMap(({ id }) =>
    PROMPTS_BY_CATEGORY[id].map((question) => [question, id] as const),
  ),
)

export function inferPromptCategory(question: string): PromptCategory {
  return CATEGORY_BY_QUESTION.get(question) ?? 'aboutMe'
}

export function categoryLabel(id: PromptCategory) {
  return PROMPT_CATEGORY_META.find((c) => c.id === id)?.label ?? 'About Me'
}

export const VIDEO_PROMPTS = [
  'Hi from me and my pet',
  "I'm a 10 but",
  'Can we talk about',
  'Something that’s special to me',
  'Rate my fit',
  'Quick story time',
  'Let me teach you how to',
]
