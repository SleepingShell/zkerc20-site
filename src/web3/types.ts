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

export type DepositArgsStruct = Mutable<GetArgs<typeof zkErc20ABI, "deposit">["args"][0]>;
export type DepositArgsStructEthers = bigintToBigNumber<DepositArgsStruct>;
export type AmountsArray = DepositArgsStruct["depositAmount"];

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
  return {
    depositAmount: amounts,
    outCommitments: [BigNumber.from(args["outCommitments"][0]), BigNumber.from(args["outCommitments"][1])],
    ...strings,
  };
}
