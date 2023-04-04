import { HashFunction, IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";

import { hash } from "./utils";

export function buildMerkleTree(levels: number): IncrementalMerkleTree {
  return new IncrementalMerkleTree(hash, levels, 0, 2);
}

export function getMerkleProof(tree: IncrementalMerkleTree, index: number) {
  const proof = tree.createProof(index);
  let pathIndices = BigInt(0);
  for (let i = 0; i < proof.pathIndices.length; i++) {
    pathIndices |= BigInt(proof.pathIndices[i]) << BigInt(i);
  }

  const proof2: MerkleProof = {
    root: proof.root,
    leaf: proof.leaf,
    siblings: proof.siblings.map((o: bigint[]) => o[0]),
    pathIndices: pathIndices,
  };
  return proof2;
}

export type MerkleProof = {
  root: bigint;
  leaf: bigint;
  siblings: bigint[];
  pathIndices: bigint;
};
