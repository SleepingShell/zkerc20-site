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
import { AlertColor } from "@mui/material";
import { GenericNotify } from "./GenericNotify";

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
  const [notifyQueue, setNotifyQueue] = useState<{ title: string; body: JSX.Element; serverity: AlertColor }[]>([]);
  const [notifyOpen, setNotifyOpen] = useState<boolean>(false);

  const addToQueue = (title: string, body: JSX.Element, serverity: AlertColor) => {
    setNotifyQueue(notifyQueue.concat({ title: title, body: body, serverity: serverity }));
    console.log(
      "q",
      notifyQueue.map((v) => v.body)
    );
    !notifyOpen && setNotifyOpen(true);
  };

  const onNotifyClose = () => {
    if (notifyQueue.length <= 1) {
      setNotifyOpen(false);
      setNotifyQueue([]);
    } else {
      setNotifyQueue(notifyQueue.slice(1));
    }
  };

  const notifyElement = (): JSX.Element => {
    if (notifyQueue.length == 0) {
      return <></>;
    } else {
      const e = notifyQueue[0];
      return (
        <GenericNotify
          open={notifyOpen}
          severity={e.serverity}
          title={e.title}
          value={e.body}
          handleClose={onNotifyClose}
        />
      );
    }
  };

  const addKey = (key: string) => {
    let account: zkAccount;
    try {
      if (key) {
        account = new zkAccount(BigInt(key));
      } else {
        account = new zkAccount();
      }
      addToQueue("Account Import", <strong>{account.getShortAddress()}</strong>, "success");
      setPoolAccounts(poolAccounts.concat(account));
    } catch (e) {
      addToQueue("Account Import", <strong>Error Importing Account</strong>, "error");
      console.log("addKey", e);
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
        const newAcc: zkAccount = Object.assign({}, acc);
        const valid = newAcc.attemptDecryptAndAdd(cb, d, ib);
        if (valid) {
          // Add to notify
          const utxo = newAcc.getInput(newAcc.ownedUtxos.length);
          for (const amount of utxo.getAmounts()) {
            addToQueue(
              "Received Value",
              <>
                mount.amount <strong>{amount.token}</strong>
              </>,
              "info"
            );
          }
        }
        return newAcc;
      });

      setPoolAccounts(newAccounts);
    },
  });

  return (
    <>
      {notifyElement()}
      {PoolInfo(tokens)}
      <DepositBox tokens={tokens} />
      <PoolAccountBox accounts={poolAccounts} onKeyImport={addKey} />
    </>
  );
}
