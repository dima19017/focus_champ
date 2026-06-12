const PALETTE = ["#7C4DFF", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#14B8A6", "#F97316"]

export function randomOutfit() {
  return { color: PALETTE[Math.floor(Math.random() * PALETTE.length)] }
}

export function parseOutfit(raw: string | object): { color: string } {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
  return { color: parsed?.color || "#7C4DFF" }
}
