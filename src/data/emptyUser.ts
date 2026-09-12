import type { Profile } from '../types'

export const emptyUser: Profile = {
  id: 'you',
  name: '',
  age: 25,
  verified: false,
  location: '',
  distance: '0 mi',
  photos: [],
  prompts: [],
  vitals: { location: '' },
  games: [],
  acceptChallenges: true,
}
