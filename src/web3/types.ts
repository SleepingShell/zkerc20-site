import { Abi, AbiFunction, AbiParametersToPrimitiveTypes, ExtractAbiFunction } from "abitype";
import { BigNumber } from "ethers";
import { zkErc20ABI } from "../generated";

// https://github.com/wagmi-dev/wagmi/blob/main/packages/core/src/types/contracts.ts#L53
export type GetArgs<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAbiFunction extends AbiFunction & { type: "function" } = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction & { type: "function" },
  TArgs = AbiParametersToPrimitiveTypes<TAbiFunction["inputs"]>,
  FailedToParseArgs = ([TArgs] extends [never] ? true : false) | (readonly unknown[] extends TArgs ? true : false)
> = true extends FailedToParseArgs
  ? {
      /**
       * Arguments to pass contract method
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on {@link abi} for type inference.
       */
      args?: readonly unknown[];
    }
  : TArgs extends readonly []
  ? { args?: never }
  : {
      /** Arguments to pass contract method */ args: TArgs;
    };

type Mutable<T> = { -readonly [K in keyof T]: T[K] extends readonly unknown[] ? Mutable<T[K]> : T[K] };
type bigintToBigNumber<T> = {
  [K in keyof T]: T[K] extends bigint ? BigNumber : T[K] extends unknown[] ? bigintToBigNumber<T[K]> : T[K];
};

type forceString<T> = {
  [K in keyof T]: T[K] extends Uint8Array | `0x${string}`
    ? `0x${string}`
    : T[K] extends unknown[]
    ? forceString<T[K]>
    : T[K];
};

export type DepositArgsStruct = Mutable<GetArgs<typeof zkErc20ABI, "deposit">["args"][0]>;
export type DepositArgsStructEthers = forceString<bigintToBigNumber<DepositArgsStruct>>;
export type AmountsArray = DepositArgsStruct["depositAmount"];

export type TransactionArgsStruct = Mutable<GetArgs<typeof zkErc20ABI, "transact">["args"][0]>;
export type TransactionArgsStructEthers = forceString<bigintToBigNumber<TransactionArgsStruct>>;

// I hate this
export function depositArgsToEthers(args: Mutable<DepositArgsStruct>): DepositArgsStructEthers {
  // I hate this even more
  let amounts: DepositArgsStructEthers["depositAmount"] = [
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
  ];
  args["depositAmount"].map((v, i) => (amounts[i] = BigNumber.from(v)));

  const { depositAmount, outCommitments, ...strings } = args;

  const handleStringUnion = (x: `0x${string}` | Uint8Array): `0x${string}` => {
    if (typeof x === "string") {
      return x;
    } else {
      //return x.toString();
      return ("0x" +
        Array.from(x)
          .map((i) => i.toString(16).padStart(2, "0"))
          .join("")) as `0x${string}`;
    }
  };

  return {
    depositAmount: amounts,
    outCommitments: [BigNumber.from(args["outCommitments"][0]), BigNumber.from(args["outCommitments"][1])],
    encryptedOutputs: [handleStringUnion(args["encryptedOutputs"][0]), handleStringUnion(args["encryptedOutputs"][1])],
    proof: handleStringUnion(args["proof"]),
  };
}
