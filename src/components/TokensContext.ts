import { createContext } from "react";

export type TokenInfo = {
  address: `0x${string}`;
  name: string;
  decimals: number;
  index: number; // Index in the contract tokens array
  totalSupply: bigint;
  //poolBalance?: bigint;
};

export const TokensContext = createContext<Map<`0x${string}`, TokenInfo>>(new Map());
