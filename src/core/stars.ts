// Stars for a question: 3 on the first try, 2 on the second, 1 after that or after any hint.
export function starsFor(attempts: number, hintsUsed: number): 1 | 2 | 3 {
  if (hintsUsed > 0) return 1;
  if (attempts <= 1) return 3;
  if (attempts === 2) return 2;
  return 1;
}
