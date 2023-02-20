import { BigNumber } from "ethers";
import { useState } from "react";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { fetchBlockNumber, getContract } from "@wagmi/core";

import { Commitment } from "../components";
import { Header } from "../components/Header";
import { callMintTokens } from "../components/MockToken/Mint";
import { PoolInfo } from "../components/Pool/PoolInfo";
import { AccountStatusMessage, PoolAccountBox } from "../components/PoolAccount";
import { DepositBox } from "../components/Transact/Deposit";
import { erc20ABI, useErc20Name, useZkErc20Tokens, zkErc20ABI, zkErc20Address } from "../generated";
import { client } from "../wagmi";
import { addTokenToMap } from "../web3/utxo";
import { zkAccount } from "../web3/zkAccount";

const NUM_TOKENS = 1; //TODO: Don't constant this

export async function getStaticProps() {
  const provider = client.getProvider({ chainId: sepolia.id });
  const contract = getContract({
    address: zkErc20Address[11155111],
    abi: zkErc20ABI,
    signerOrProvider: provider,
  });

  const promises: Promise<AddressName>[] = [];
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
      };
    };

    promises.push(fn());
  }

  console.log(`Got all tokens ${NUM_TOKENS}`);
  return {
    props: {
      numTokens: 1,
      tokens: await Promise.all(promises),
    },
  };
}

export type AddressName = {
  address: `0x${string}`;
  name: string;
};

function Page({ numTokens, tokens }: { numTokens: number; tokens: AddressName[] }) {
  const { isConnected } = useAccount();
  const [poolAccounts, setPoolAccounts] = useState<zkAccount[]>([]);
  const [importStatus, setImportStatus] = useState<AccountStatusMessage>(AccountStatusMessage.Empty);

  const addKey = (key: string) => {
    let account: zkAccount;
    try {
      if (key) {
        account = new zkAccount(BigInt(key));
      } else {
        account = new zkAccount();
      }
      setImportStatus(AccountStatusMessage.SuccessImport);
      setPoolAccounts(poolAccounts.concat(account));
    } catch (e) {
      setImportStatus(AccountStatusMessage.ErrorImport);
    }
  };

  return (
    <>
      {Header()}

      {Commitment()}
      {callMintTokens(1000n * 10n ** 18n)}
      {PoolInfo(tokens)}
      {DepositBox(tokens)}
      <PoolAccountBox accounts={poolAccounts} onKeyImport={addKey} status={importStatus} />
    </>
  );
}

export default Page;
