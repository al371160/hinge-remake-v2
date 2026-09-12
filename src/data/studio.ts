import type { Photo } from '../types'

function stock(id: string, url: string, alt: string): Photo {
  return {
    id,
    url: `${url}?auto=format&fit=crop&w=800&h=1000&q=70`,
    alt,
  }
}

export const STOCK_PHOTOS: Photo[] = [
  stock('stock-1', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3', 'Stoop'),
  stock('stock-2', 'https://images.unsplash.com/photo-1521119989659-a83eee488004', 'Cafe'),
  stock('stock-3', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce', 'Outdoors'),
  stock('stock-4', 'https://images.unsplash.com/photo-1488161628813-04466f872be2', 'Walking'),
  stock('stock-5', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', 'Portrait'),
  stock('stock-6', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1', 'Sunlight'),
  stock('stock-7', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', 'Close portrait'),
  stock('stock-8', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce', 'Soft light'),
  stock('stock-9', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7f', 'Field'),
  stock('stock-10', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'Smile'),
  stock('stock-11', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f', 'Looking aside'),
  stock('stock-12', 'https://images.unsplash.com/photo-1517841905240-472988babdf9', 'Warm portrait'),
]

export { PROMPTS_BY_CATEGORY, PROMPT_CATEGORY_META, VIDEO_PROMPTS } from './promptBank'

export const HEIGHTS = [
  `5'2"`,
  `5'4"`,
  `5'6"`,
  `5'7"`,
  `5'8"`,
  `5'9"`,
  `5'10"`,
  `5'11"`,
  `6'0"`,
  `6'1"`,
  `6'2"`,
]

export const INTENTIONS = ['Long-term', 'Life partner', 'Long-term, open to short', 'Open to short']
