import Grid2 from "@mui/material/Unstable_Grid2";
import { BigNumber } from "ethers";
import { useZkErc20Tree } from "../../../generated";
import { AddressName } from "../../../pages";
import { TokenInfoTable } from "./TokenInfo";

function totalCommitments(): JSX.Element {
  const { data } = useZkErc20Tree();
  const commitments = (data !== undefined ? data.numberOfLeaves : BigNumber.from(0)).toBigInt();

  return <div>Total anonymous set size: {commitments.toString()}</div>;
}

export function PoolInfo(tokens: AddressName[]): JSX.Element {
  return (
    <Grid2 container>
      <Grid2 xs={12}>{totalCommitments()}</Grid2>
      <Grid2 xs={12}>{TokenInfoTable(tokens)}</Grid2>
    </Grid2>
  );
}
