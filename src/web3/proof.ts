//import { plonk } from "snarkjs";
const { plonk } = require("snarkjs");
import { DepositArgsStruct, AmountsArray } from "./utils";
import { UtxoOutput } from "./utxo";

const depositCircuitPath = "/zkproof/Deposit.wasm";
const depositCircuitKeyPath = "/zkproof/Deposit.zkey";

export async function depositProof(depositAmount: AmountsArray, outputs: UtxoOutput[]): Promise<DepositArgsStruct> {
  //useZkErc20Deposit({args: })

  const input: DepositProofInput = {
    outAmounts: [outputs[0].amounts, outputs[1].amounts],
    outPubkeys: [outputs[0].publicKey, outputs[1].publicKey],
    outBlindings: [outputs[0].blinding, outputs[1].blinding],
    outCommitments: [outputs[0].commitment, outputs[1].commitment],
    depositAmount: depositAmount,
  };

  const { proof, publicSignals } = await plonk.fullProve(input, depositCircuitPath, depositCircuitKeyPath);
  const calldata: string = await plonk.exportSolidityCallData(proof, publicSignals);
  const proofCalldata = calldata.split(",")[0];

  /*
  const args: DepositArgsStruct = {
    depositAmount: depositAmount,
    outCommitments: [outputs[0].commitment, outputs[1].commitment],
    encryptedOutputs: ["0x" + outputs[0].encryptedData, "0x" + outputs[1].encryptedData],
    proof: proofCalldata,
  };
  */

  const args: DepositArgsStruct = [
    depositAmount,
    [outputs[0].commitment, outputs[1].commitment],
    [("0x" + outputs[0].encryptedData) as `0x{string}`, ("0x" + outputs[1].encryptedData) as `0x{string}`],
    proofCalldata as `0x{string}`,
  ];

  return args;
}

type DepositProofInput = {
  outAmounts: bigint[][];
  outPubkeys: bigint[];
  outBlindings: bigint[];

  outCommitments: bigint[];
  depositAmount: AmountsArray;
};
