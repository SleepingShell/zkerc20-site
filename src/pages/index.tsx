import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { fetchBlockNumber, getContract, watchContractEvent } from "@wagmi/core";

import { Commitment } from "../components";
import { Header } from "../components/Header";
import { callMintTokens } from "../components/MockToken/Mint";
import { PoolInfo } from "../components/Pool/PoolInfo";
import { AccountStatusMessage, PoolAccountBox } from "../components/PoolAccount";
import { DepositBox } from "../components/Transact/Deposit";
import { erc20ABI, useZkErc20CommitmentEvent, zkErc20ABI, zkErc20Address } from "../generated";
import { client } from "../wagmi";
import { addTokenToMap } from "../web3/utxo";
import { zkAccount } from "../web3/zkAccount";
import { buildMerkleTree, MerkleTree } from "../web3/merkleTree";
import "../web3/utils";

const NUM_TOKENS = 1; //TODO: Don't constant this

// TODO: NOT GOOD
const provider = client.getProvider({ chainId: sepolia.id });

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
      treeDepth: 20,
    },
  };
}

export type AddressName = {
  address: `0x${string}`;
  name: string;
};

async function initializeMerkleTree(depth: number): Promise<MerkleTree> {
  const tree = buildMerkleTree(depth);

  const contract = await getContract({
    address: zkErc20Address[11155111],
    abi: zkErc20ABI,
    signerOrProvider: provider,
  });

  const iface = new ethers.utils.Interface(zkErc20ABI);

  const events = await contract.queryFilter("Commitment", 0, "latest");
  const leaves = events.map((e) => {
    const dec = iface.decodeEventLog("Commitment", e.data);
    return { index: BigNumber.from(dec.index).toNumber(), commit: BigNumber.from(dec.commitment).toBigInt() };
  });

  const toAdd = leaves
    .sort((a, b) => a.index - b.index)
    .filter((val, index, self) => index === self.findIndex((v) => v.commit === val.commit))
    .map((a) => a.commit);
  tree.addLeaves(toAdd);
  return tree;
}

type CommitmentCallback = (commitment: bigint, index: bigint, data: `0x${string}`) => void;

class Observer {
  tree: MerkleTree;
  iface: ethers.utils.Interface;
  callback: CommitmentCallback;
  commitToAdd: { commitment: bigint; index: bigint }[] = [];

  constructor(depth: number, callback: CommitmentCallback) {
    this.tree = buildMerkleTree(depth);
    this.iface = new ethers.utils.Interface(zkErc20ABI);
    this.callback = callback;
  }

  private parseCommitmentEvent(e: ethers.Event): { index: number; commit: bigint } {
    const dec = this.iface.decodeEventLog("Commitment", e.data);
    return { index: BigNumber.from(dec.index).toNumber(), commit: BigNumber.from(dec.commitment).toBigInt() };
  }

  private internalCallback(commitment: BigNumber, index: BigNumber, data: `0x${string}`) {
    console.log(`Observed new commitment event ${index.toString()}`);
    // Add to the merkle tree
    if (!index.eq(this.tree.numLeaves)) {
      if (index.lt(this.tree.numLeaves)) return;
      this.commitToAdd.push({ commitment: commitment.toBigInt(), index: index.toBigInt() });
      this.commitToAdd = this.commitToAdd.sort((a, b) => Number(a.index - b.index));
    } else {
      this.tree.addLeaves([commitment.toBigInt()]);

      // Attempt to add events we've received in incorrect order
      if (this.commitToAdd.length > 0) {
        while (this.commitToAdd[0].index == BigInt(this.tree.numLeaves)) {
          const t = this.commitToAdd.splice(0, 1)[0];
          this.tree.addLeaves([t.commitment]);
        }
      }
    }

    // Callback
    this.callback(commitment.toBigInt(), index.toBigInt(), data);
  }

  async initialize() {
    const contract = getContract({
      address: zkErc20Address[11155111],
      abi: zkErc20ABI,
      signerOrProvider: provider,
    });

    const events = await contract.queryFilter("Commitment", 0, "latest");
    const toAdd = events
      .map((e) => this.parseCommitmentEvent(e))
      .sort((a, b) => a.index - b.index)
      .filter((val, index, self) => index === self.findIndex((v) => v.commit === val.commit))
      .map((a) => a.commit);

    this.tree.addLeaves(toAdd);

    /*
    useZkErc20CommitmentEvent({
      listener: this.internalCallback
    });
    */
    watchContractEvent(
      {
        address: zkErc20Address[11155111],
        abi: zkErc20ABI,
        eventName: "Commitment",
      },
      (c, i, d) => this.internalCallback(c, i, d)
    );
  }
}

function Page({ numTokens, tokens, treeDepth }: { numTokens: number; tokens: AddressName[]; treeDepth: number }) {
  const { isConnected } = useAccount();
  const [poolAccounts, setPoolAccounts] = useState<zkAccount[]>([]); //TODO: Change to context
  const [importStatus, setImportStatus] = useState<AccountStatusMessage>(AccountStatusMessage.Empty);
  const [observer, setObserver] = useState<Observer>();

  const handleCommitmentEvent = (commitment: bigint, index: bigint, data: `0x${string}`) => {
    poolAccounts.forEach((acc) => acc.attemptDecryptAndAdd(commitment, data, index));
  };

  useEffect(() => {
    if (isConnected) {
      const obs = observer === undefined ? new Observer(treeDepth, handleCommitmentEvent) : Object.assign({}, observer);

      obs.initialize().then(() => setObserver(obs));
    }
  }, [isConnected]);

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
      console.log("addKey", e);
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
