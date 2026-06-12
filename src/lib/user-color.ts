const PALETTE = ["#7C4DFF", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#14B8A6", "#F97316"]

export function userColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash |= 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}
