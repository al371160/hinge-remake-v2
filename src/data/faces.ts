/** Same-person shot lists. Extra IDs are other frames from the same shoot. */
const SHOTS: Record<string, string[]> = {
  alex: ['1504257432389-52343af06ae3'],
  maya: [
    '1571513722275-4b41940f54b8',
    '1571513800374-df1bbe650e56',
    '1571513721963-d855fd8df4c2',
  ],
  jordan: ['1506794778202-cad84cf45f1d'],
  priya: ['1536587941320-eab2c7ce294d', '1536588086516-cf8b058a7aa0'],
  elena: ['1531746020798-e6953c6e8e04'],
  nico: ['1500648767791-00dcc994a43e'],
  sam: ['1521119989659-a83eee488004'],
  theo: ['1472099645785-5658abf4ff4e'],
  aisha: ['1543654916-8071f17ee466', '1543654916-24cb93a9e817', '1543654916-52cb2192d8c2'],
  riley: ['1584646835188-0e0bac62df29', '1584646835133-9c3e5e1a9523'],
  camille: ['1553782376-b2e8256ab838', '1553782376-b3c480f5fea7'],
  jade: ['1580489944761-15a19d654956'],
  kimmy: ['1614289371518-722f2615943d'],
  vivian: ['1619895862022-09114b41f16f'],
  angel: ['1607746882042-944635dfe10e'],
  bree: ['1544717305-2782549b5136'],
  lina: ['1594744803329-e58b31de8bf5'],
  tiff: ['1525134479668-1dee7abaaccd'],
  nikki: ['1609505848912-b7c3b8b4beda'],
}

const CROPS = [
  'crop=faces',
  'crop=entropy',
  'crop=focalpoint&fp-x=0.42&fp-y=0.28',
] as const

function unsplash(id: string, crop: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=1000&q=70&${crop}`
}

export function faceUrls(who: keyof typeof SHOTS): string[] {
  const ids = SHOTS[who]
  const urls = ids.map((id, i) => unsplash(id, CROPS[Math.min(i, CROPS.length - 1)]))
  if (urls.length >= 3) return urls.slice(0, 4)
  const hero = ids[0]
  const fills = CROPS.slice(urls.length).map((crop) => unsplash(hero, crop))
  return [...urls, ...fills].slice(0, 3)
}

export function facePoster(who: keyof typeof SHOTS) {
  return faceUrls(who)[0]
}
