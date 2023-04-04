import { BigNumber } from "ethers";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getContract } from "@wagmi/core";

import { Header } from "../components/Common/Header";
import { MintButton } from "../components/MintButton";
import { erc20ABI, zkErc20ABI, zkErc20Address } from "../generated";
import { client } from "../wagmi";
import { addTokenToMap } from "../web3/utxo";

import "../web3/utils";
import { Application } from "../components/Pool/Application";

const NUM_TOKENS = 1; //TODO: Don't constant this

// TODO: NOT GOOD
export const provider = client.getProvider({ chainId: sepolia.id });

export type AddressName = {
  address: `0x${string}`;
  name: string;
};

export type IndexAddress = {
  address: `0x${string}`;
  index: number;
};

export async function getStaticProps() {
  const contract = getContract({
    address: zkErc20Address[11155111],
    abi: zkErc20ABI,
    signerOrProvider: provider,
  });

  type AddressNameIndex = AddressName & IndexAddress;
  const promises: Promise<AddressNameIndex>[] = [];
  for (let i = 0; i < NUM_TOKENS; i++) {
    const fn = async () => {
      const addr = await contract.tokens(BigNumber.from(i));
      return {
        address: addr,
        name: await getContract({
          address: addr,
          abi: erc20ABI,
          signerOrProvider: provider,
        }).name(),
        index: i,
      };
    };

    promises.push(fn());
  }

  const vals = await Promise.all(promises); //.filter(o => o.address != null);

  return {
    props: {
      numTokens: 1,
      tokens: vals.map((o) => [o.address, o.name]),
      tokenIndexes: vals.map((o) => ({ index: o.index, address: o.address })),
      treeDepth: 20,
    },
  };
}

function Page({
  tokens,
  tokenIndexes,
  treeDepth,
}: {
  tokens: [`0x${string}`, string][];
  tokenIndexes: IndexAddress[];
  treeDepth: number;
}) {
  const { isConnected } = useAccount();

  const tokenMap: Map<`0x${string}`, string> = new Map(tokens);
  tokenIndexes.forEach((i) => addTokenToMap(i.address, i.index));

  return (
    <>
      {Header()}

      {MintButton(1000n * 10n ** 18n)}
      <Application tokens={tokenMap} treeDepth={treeDepth} />
    </>
  );
}

export default Page;
