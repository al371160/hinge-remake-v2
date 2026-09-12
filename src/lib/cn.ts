export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export const typeTitle = 'type-title'
export const typeChrome = 'type-chrome'
export const typeUser = 'type-user'
