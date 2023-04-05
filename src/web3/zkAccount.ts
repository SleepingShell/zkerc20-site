import { decrypt, getEncryptionPublicKey } from "@metamask/eth-sig-util";

import { randomBytes32, hash } from "./utils";
import { AmountsArray } from "./types";

import { encodeAddress, decodeAddress, unpackEncryptedData, unpackCommitment } from "./encoding";

import { TokenAmount, UtxoInput, UtxoOutput, zeroAmounts } from "./utxo";
import { MAX_TOKENS } from "./constants";

export class zkAccount {
  privateKey: bigint;
  publicKey: bigint;
  encryptionKey: string;

  ownedUtxos: UtxoInput[];

  // Used to prevent double-adding to ownedUtxos. Pretty hacky
  addedIndexes: Map<bigint, boolean> = new Map();

  constructor(privateKey = randomBytes32()) {
    this.privateKey = privateKey;
    this.publicKey = hash([this.privateKey.toString()]);
    this.encryptionKey = getEncryptionPublicKey(this.privateKey.toString(16));
    this.ownedUtxos = [];
  }

  static fromAddress(address: string): zkAccount {
    if (address.length != 128) {
      throw "Invalid address";
    }

    const [pubkey, encryptkey] = decodeAddress(address);
    return Object.assign(new zkAccount(undefined), {
      privateKey: null,
      publicKey: pubkey,
      encryptionKey: encryptkey,
      ownedUtxos: null,
    });
  }

  getAddress(): string {
    return encodeAddress(this.publicKey, this.encryptionKey);
  }

  getShortAddress(): string {
    const addr = this.getAddress();
    return addr
      .slice(0, 8)
      .concat("...")
      .concat(addr.slice(addr.length - 8));
  }

  /**
   * Create a FINAZLIED output destined for this zkAccount
   *
   * @param amounts (token address, amount) tuples
   * @returns The output
   */
  pay(...amounts: TokenAmount[]): UtxoOutput {
    const output = new UtxoOutput(this.getAddress());
    amounts.map((amount) => output.setTokenAmount(amount.token, amount.amount));
    output.finalize();
    return output;
  }

  /**
   * Create a FINALIZED output using an array of amounts
   * @param amounts List of all token outputs including zero values
   * @returns The output
   */
  payRaw(amounts: AmountsArray): UtxoOutput {
    if (amounts.length != MAX_TOKENS) {
      throw Error("Invalid amounts length");
    }
    const output = new UtxoOutput(this.getAddress());
    output.amounts = amounts;
    output.finalize();
    return output;
  }

  /**
   * Attempt to decrypt an observed UtxoInput. If we can successfully decrypt it, add to our ownedUtxos
   * @param commitment The commitment of this input
   * @param data Encrypted data of this input
   * @param index The index of this input in the merkle tree
   */
  attemptDecryptAndAdd(commitment: bigint, data: string, index: bigint): boolean {
    try {
      const encryptedData = unpackEncryptedData(data);
      const packedDecrypted = decrypt({ encryptedData: encryptedData, privateKey: this.privateKey.toString(16) });
      const { amounts, blinding } = unpackCommitment(packedDecrypted);
      const utxo = new UtxoInput(commitment, amounts, blinding, index, this.privateKey);
      if (this.addedIndexes.get(utxo.index)) return false;
      this.ownedUtxos.push(utxo);
      this.addedIndexes.set(utxo.index, true);
      console.log(`Added new commitment to account: ${commitment}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  getInput(index: number): UtxoInput {
    return this.ownedUtxos[index];
  }

  getBalances(): AmountsArray {
    const totals: AmountsArray = zeroAmounts();
    this.ownedUtxos.map((input) => input.amounts.map((v, i) => (totals[i] += v)));
    return totals;
  }
}
