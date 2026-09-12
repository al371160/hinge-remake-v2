const SHARED = [
  'Say that again, slower.',
  'Okay I like you.',
  'When.',
  'That is a dangerous text.',
  'Come here and say it.',
  'I was about to send the same thing.',
  'Wait I smiled.',
  'Friday.',
  'Do not go to sleep yet.',
  'Your move.',
]

const NAMED: Record<string, string[]> = {
  maya: [
    'I will feed you first.',
    'Museum Sunday still stands.',
    'Pleated. I already told you.',
    'Play Word Hunt if you get shy.',
    'Greenpoint. Come hungry.',
  ],
  jordan: [
    'Lisbon is living in my head now.',
    'I run at 9. You can be late.',
    'Finish the board.',
    'Astoria. I will pick a corner.',
    'Maps later. Text now.',
  ],
}

const QUESTIONS = ['Yes.', 'Depends who is asking.', 'Tomorrow if you mean it.', 'Only if you show up.']
const GAMES = ['Sending it back.', 'Do not let me win.', 'Okay but I talk during.']
const LAUGHS = ['I heard that.', 'Noted.', 'Okay you are funny.']
const PLANS = ['Tell me when.', 'I can do after 8.', 'Pick a corner. I will walk.']
const ACKS = ['wait', 'okay.', 'hold on']

function bank(profileId: string) {
  return [...(NAMED[profileId] ?? []), ...SHARED]
}

function pick(list: string[], n: number) {
  return list[n % list.length]!
}

export function pickChatReply(profileId: string, userText: string, inboundCount: number): string[] {
  const text = userText.toLowerCase()
  const n = inboundCount
  let line: string
  if (/\b(word hunt|four in a row|cup pong|8 ?ball|pool|game)\b/.test(text)) {
    line = pick(GAMES, n)
  } else if (/\?/.test(userText)) {
    line = pick(QUESTIONS, n)
  } else if (/\b(haha|hahaha|lol|lmao|hehe)\b/.test(text)) {
    line = pick(LAUGHS, n)
  } else if (/\b(dinner|drink|coffee|date|tonight|tomorrow|free|hang)\b/.test(text)) {
    line = pick(PLANS, n)
  } else {
    line = pick(bank(profileId), n)
  }
  if (n % 4 === 2) return [pick(ACKS, n), line]
  return [line]
}
