export function bigintToDecimalNumber(amount: bigint, decimals: number): number {
  return Number((amount * 1000n) / 10n ** BigInt(decimals) / 1000n);
}
