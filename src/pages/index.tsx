import { BigNumber } from "ethers";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getContract } from "@wagmi/core";

import { Header } from "../components/Common/Header";
import { MintButton } from "../components/MintButton";
import { TokenInfo, TokensContext } from "../components/TokensContext";

import { erc20ABI, zkErc20ABI, zkErc20Address } from "../generated";
import { client } from "../wagmi";
import { addTokenToMap } from "../web3/utxo";

import "../web3/utils";
import { Application } from "../components/Pool/Application";
import { T } from "abitype/dist/config-79fabb4e";

const NUM_TOKENS = 1; //TODO: Don't constant this

// TODO: NOT GOOD
export const provider = client.getProvider({ chainId: sepolia.id });

declare interface BigInt {
  toJSON(): string;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

type Replace<T, K extends keyof T, TNew> = Omit<T, K> & {
  [P in K]: TNew;
};

type parsableTokenInfo = Replace<TokenInfo, "totalSupply", string>;

export async function getStaticProps() {
  const contract = getContract({
    address: zkErc20Address[11155111],
    abi: zkErc20ABI,
    signerOrProvider: provider,
  });

  const promises: Promise<parsableTokenInfo>[] = [];
  for (let i = 0; i < NUM_TOKENS; i++) {
    const fn = async () => {
      const addr = await contract.tokens(BigNumber.from(i));
      const info = getContract({
        address: addr,
        abi: erc20ABI,
        signerOrProvider: provider,
      });
      return {
        address: addr,
        name: await info.name(),
        decimals: await info.decimals(),
        index: i,
        totalSupply: (await info.totalSupply()).toBigInt().toString(),
      };
    };

    promises.push(fn());
  }

  return {
    props: {
      numTokens: 1,
      tokens: await Promise.all(promises),
      treeDepth: 20,
    },
  };
}

function Page({ tokens, treeDepth }: { tokens: parsableTokenInfo[]; treeDepth: number }) {
  const { isConnected } = useAccount();

  const tokensMap: Map<`0x${string}`, TokenInfo> = new Map();
  tokens.forEach((ptoken) => {
    const token: TokenInfo = Object.assign(ptoken, { totalSupply: BigInt(ptoken.totalSupply) });
    tokensMap.set(ptoken.address, token);
    addTokenToMap(token.address, token.index);
  });

  console.log(tokensMap);

  return (
    <TokensContext.Provider value={tokensMap}>
      {Header()}

      {MintButton(1000n * 10n ** 18n)}
      <Application treeDepth={treeDepth} />
    </TokensContext.Provider>
  );
}

export default Page;
