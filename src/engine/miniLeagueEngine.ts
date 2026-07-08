export function rankLeague<T extends { score: number; nickname: string }>(rows: T[]) {
  return [...rows].sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname));
}
