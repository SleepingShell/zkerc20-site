import Grid2 from "@mui/material/Unstable_Grid2";
import { BigNumber } from "ethers";
import { useZkErc20Tokens, useZkErc20Tree } from "../../generated";
import { TokenInfoTable } from "./TokenInfo";

function totalCommitments(): JSX.Element {
  const { data } = useZkErc20Tree();
  const commitments = (data !== undefined ? data.numberOfLeaves : BigNumber.from(0)).toBigInt();

  return <div>Total anonymous set size: {commitments.toString()}</div>;
}

export function PoolInfo(numTokens: number): JSX.Element {
  const tokens: `0x${string}`[] = []
  for (let i = 0; i < numTokens; i++) {
    const { data } = useZkErc20Tokens({args: [BigNumber.from(i)]});
    if (data !== undefined) {
      tokens.push(data);
    } else {
      console.log(`Got undefined token ${i}`);
    }
  }

  return <Grid2 container>
    <Grid2 xs={12}>
      {totalCommitments()}
    </Grid2>
    <Grid2 xs={12}>
      {TokenInfoTable(tokens)}
    </Grid2>
  </Grid2>
}