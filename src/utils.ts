export function bigintToDecimalNumber(amount: bigint, decimals: number): number {
  return Number(((amount * 1000n) / BigInt(decimals)) / 1000n)
}