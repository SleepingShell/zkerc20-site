import { randomBytes } from "crypto";
import { BigNumber } from "ethers";

import { HashFunction } from "@zk-kit/incremental-merkle-tree";
import { buildPoseidon } from "circomlibjs";
import { getCurveFromName } from "ffjavascript";

export const randomBytes32 = () => BigNumber.from(randomBytes(32)).or(BigNumber.from(1).shl(255)).toBigInt();

export async function getPoseidon(): Promise<HashFunction> {
  const bn128 = await getCurveFromName("bn128", true);
  const F = bn128.Fr;
  const t = await buildPoseidon();

  return (data: any) => F.toObject(t(data));
}

let _hash: HashFunction;
export let hashIsReady: boolean = false;

(async () => {
  _hash = await getPoseidon();
  hashIsReady = true;
})();
export const hash = (data: any): any => _hash(data);
