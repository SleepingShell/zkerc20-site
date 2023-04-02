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

export async function getStaticProps() {
  const contract = getContract({
    address: zkErc20Address[11155111],
    abi: zkErc20ABI,
    signerOrProvider: provider,
  });

  const promises: Promise<AddressName>[] = [];
  for (let i = 0; i < NUM_TOKENS; i++) {
    const fn = async () => {
      const addr = await contract.tokens(BigNumber.from(i));
      addTokenToMap(addr, i);
      return {
        address: addr,
        name: await getContract({
          address: addr,
          abi: erc20ABI,
          signerOrProvider: provider,
        }).name(),
      };
    };

    promises.push(fn());
  }

  return {
    props: {
      numTokens: 1,
      tokens: (await Promise.all(promises)).map((o) => [o.address, o.name]),
      treeDepth: 20,
    },
  };
}

export type AddressName = {
  address: `0x${string}`;
  name: string;
};

function Page({ tokens, treeDepth }: { tokens: [`0x${string}`, string][]; treeDepth: number }) {
  const { isConnected } = useAccount();

  const tokenMap: Map<`0x${string}`, string> = new Map(tokens);
  return (
    <>
      <script id="snarkjs" src="snarkjs.min.js" />
      {Header()}

      {MintButton(1000n * 10n ** 18n)}
      <Application tokens={tokenMap} treeDepth={treeDepth} />
    </>
  );
}

export default Page;
