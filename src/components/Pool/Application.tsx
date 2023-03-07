import { BigNumber, ethers } from "ethers";
import { getContract } from "@wagmi/core";
import { useZkErc20CommitmentEvent, zkErc20ABI, zkErc20Address } from "../../generated";
import { buildMerkleTree, MerkleTree } from "../../web3/merkleTree";
import { client } from "../../wagmi";
import { sepolia } from "@wagmi/chains";
import { AddressName } from "../../pages";
import { useEffect, useState } from "react";
import { zkAccount } from "../../web3/zkAccount";
import { AccountStatusMessage, PoolAccountBox } from "./AccountActions/PoolAccountBox";
import { PoolInfo } from "./PoolInfo/PoolInfo";
import { DepositBox } from "./AccountActions/DepositBox";
import { useAccount } from "wagmi";

import { hashIsReady } from "../../web3/utils";

export type NameValue = { name: string; value: string };
type CommitmentCallback = (commitment: bigint, index: bigint, data: `0x${string}`) => void;
class Observer {
  tree: MerkleTree;
  iface: ethers.utils.Interface;
  callback: CommitmentCallback;
  commitToAdd: { commitment: bigint; index: bigint }[] = [];
  initialized: boolean = false;

  constructor(depth: number, callback: CommitmentCallback) {
    this.tree = buildMerkleTree(depth);
    this.iface = new ethers.utils.Interface(zkErc20ABI);
    this.callback = callback;
  }

  private parseCommitmentEvent(e: ethers.Event): { index: number; commit: bigint } {
    const dec = this.iface.decodeEventLog("Commitment", e.data);
    return { index: BigNumber.from(dec.index).toNumber(), commit: BigNumber.from(dec.commitment).toBigInt() };
  }

  globalCallback(commitment: BigNumber, index: BigNumber, data: `0x${string}`) {
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
    // TODO: NOT GOOD
    const provider = client.getProvider({ chainId: sepolia.id });
    if (this.initialized) return;
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

    console.log(`Initialized observer with ${this.tree.numLeaves} leaves`);
    this.initialized = true;
  }
}

export function Application({
  tokens,
  treeDepth,
}: {
  tokens: Map<`0x${string}`, string>;
  treeDepth: number;
}): JSX.Element {
  const { isConnected } = useAccount();
  const [poolAccounts, setPoolAccounts] = useState<zkAccount[]>([]);
  const [importStatus, setImportStatus] = useState<AccountStatusMessage>(AccountStatusMessage.Empty);
  const [receivedValues, setReceivedValues] = useState<NameValue[]>([]);

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

  const handleCommitmentEvent = (commitment: bigint, index: bigint, data: `0x${string}`) => {
    poolAccounts.forEach((acc) => acc.attemptDecryptAndAdd(commitment, data, index));
  };

  const [observer, setObserver] = useState<Observer>();
  useEffect(() => {
    if (hashIsReady) {
      const obs = observer == null ? new Observer(treeDepth, handleCommitmentEvent) : Object.assign({}, observer);

      if (isConnected) {
        obs.initialize().then(() => setObserver(obs));
      } else {
        setObserver(obs);
      }
    }
  }, [isConnected, hashIsReady]);

  useZkErc20CommitmentEvent({
    listener: (c, i, d) => {
      const obs = Object.assign({}, observer);
      obs.globalCallback(c, i, d);
      setObserver(obs);

      const cb = c.toBigInt();
      const ib = i.toBigInt();

      // TODO: Look at performance of this, we can stop iterating on accounts once we find a valid
      const newAccounts = poolAccounts.map((acc, i) => {
        const newAcc = Object.assign({}, acc);
        const valid = newAcc.attemptDecryptAndAdd(cb, d, ib);
        if (valid) {
          // Add to notify
          const utxo = newAcc.getInput(newAcc.ownedUtxos.length);
          //setReceivedValues(receivedValues.concat({}))
        }
        return newAcc;
      });

      setPoolAccounts(newAccounts);
    },
  });

  return (
    <>
      {PoolInfo(tokens)}
      <DepositBox tokens={tokens} />
      <PoolAccountBox accounts={poolAccounts} onKeyImport={addKey} status={importStatus} />
    </>
  );
}
