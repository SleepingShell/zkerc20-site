import { BigNumber, ethers } from "ethers";
import { getContract } from "@wagmi/core";
import { useZkErc20CommitmentEvent, zkErc20ABI, zkErc20Address } from "../../generated";
import { buildMerkleTree, MerkleTree } from "../../web3/merkleTree";
import { client } from "../../wagmi";
import { sepolia } from "@wagmi/chains";
import { AddressName } from "../../pages";
import { useEffect, useRef, useState } from "react";
import { zkAccount } from "../../web3/zkAccount";
import { AccountStatusMessage, PoolAccountBox } from "./AccountActions/PoolAccountBox";
import { PoolInfo } from "./PoolInfo/PoolInfo";
import { DepositBox } from "./AccountActions/DepositBox";
import { useAccount } from "wagmi";

import { hashIsReady } from "../../web3/utils";
import { AlertColor } from "@mui/material";
import { GenericNotify } from "./GenericNotify";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";

export type NameValue = { name: string; value: string };

const commitmentIface = new ethers.utils.Interface(zkErc20ABI);

function updateTreeOnEvent(
  tree: IncrementalMerkleTree,
  commitToAdd: { commitment: bigint; index: bigint }[],
  commitment: bigint,
  index: bigint,
  data: `0x${string}`
) {
  console.log(`Observed new commitment event ${index.toString()}`);
  // Add to the merkle tree
  if (index != BigInt(tree.leaves.length)) {
    if (index < BigInt(tree.leaves.length)) return;
    commitToAdd.push({ commitment: commitment, index: index });
    commitToAdd = commitToAdd.sort((a, b) => Number(a.index - b.index));
  } else {
    tree.insert(commitment);

    // Attempt to add events we've received in incorrect order
    if (commitToAdd.length > 0) {
      while (commitToAdd[0].index == BigInt(tree.leaves.length)) {
        const t = commitToAdd.splice(0, 1)[0];
        tree.insert(t.commitment);
      }
    }
  }
}

async function initializeCommitmentTree(tree: IncrementalMerkleTree) {
  // TODO: NOT GOOD
  const provider = client.getProvider({ chainId: sepolia.id });
  const contract = getContract({
    address: zkErc20Address[11155111],
    abi: zkErc20ABI,
    signerOrProvider: provider,
  });

  const events = await contract.queryFilter("Commitment", 0, "latest");
  const toAdd = events
    .map((e) => {
      const dec = commitmentIface.decodeEventLog("Commitment", e.data);
      return { index: BigNumber.from(dec.index).toNumber(), commit: BigNumber.from(dec.commitment).toBigInt() };
    })
    .sort((a, b) => a.index - b.index)
    .filter((val, index, self) => index === self.findIndex((v) => v.commit === val.commit))
    .map((a) => tree.insert(a.commit));

  console.log(`Initialized commitment tree with ${tree.leaves.length} leaves`);
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

  const addToNotifyQueue = (title: string, body: JSX.Element, serverity: AlertColor) => {
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
      addToNotifyQueue("Account Import", <strong>{account.getShortAddress()}</strong>, "success");
      setPoolAccounts(poolAccounts.concat(account));
    } catch (e) {
      addToNotifyQueue("Account Import", <strong>Error Importing Account</strong>, "error");
      console.log("addKey", e);
    }
  };

  //const [observer, setObserver] = useState<Observer>();
  let commitmentTree = useRef<IncrementalMerkleTree>();
  let treeInitialized = useRef(false);
  let commitToAdd = useRef<{ commitment: bigint; index: bigint }[]>([]);

  const handleCommitmentEvent = (commitment: bigint, index: bigint, data: `0x${string}`) => {
    updateTreeOnEvent(commitmentTree.current!, commitToAdd.current, commitment, index, data);
    poolAccounts.forEach((acc) => acc.attemptDecryptAndAdd(commitment, data, index));
  };

  useEffect(() => {
    if (hashIsReady) {
      console.log("Building commitment tree");

      commitmentTree.current ??= buildMerkleTree(20);

      if (isConnected && !treeInitialized.current) {
        initializeCommitmentTree(commitmentTree.current);
        treeInitialized.current = true;
      }
    }
  }, [isConnected, hashIsReady]);

  useZkErc20CommitmentEvent({
    listener: (c, i, d) => {
      handleCommitmentEvent(c.toBigInt(), i.toBigInt(), d);

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
            addToNotifyQueue(
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
