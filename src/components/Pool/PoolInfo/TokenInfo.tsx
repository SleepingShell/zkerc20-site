import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BigNumber } from "ethers";
import { useContext } from "react";
import { useAccount } from "wagmi";
import {
  useErc20BalanceOf,
  useErc20Decimals,
  useErc20Name,
  useErc20Symbol,
  useErc20TotalSupply,
  zkErc20Address,
} from "../../../generated";
import { bigintToDecimalNumber } from "../../../utils";
import { TokenInfo, TokensContext } from "../../TokensContext";

type infoWithPoolBalance = TokenInfo & { poolBalance: bigint };

export function TokenInfoTable(): JSX.Element {
  const tokens = useContext(TokensContext);
  const { isConnected, address } = useAccount();
  const tokenInfos: infoWithPoolBalance[] = [];
  const accountBalances: Map<`0x${string}`, bigint> = new Map();

  tokens.forEach((token) => {
    const a = address ?? "0x0";
    let { data: accBalance } = useErc20BalanceOf({ address: token.address, args: [a] });
    let { data: poolBalance } = useErc20BalanceOf({ address: token.address, args: [zkErc20Address[11155111]] });
    //token.poolBalance = (poolBalance ??= BigNumber.from(0)).toBigInt();

    accountBalances.set(token.address, (accBalance ??= BigNumber.from(0)).toBigInt());
    tokenInfos.push({ ...token, ...{ poolBalance: (poolBalance ??= BigNumber.from(0)).toBigInt() } });
  });

  // ERROR: Rendered more hooks than during the previous render.
  const tokeInfoToRow = (info: infoWithPoolBalance): JSX.Element => {
    const accountBalance = accountBalances.get(info.address) as bigint;

    return (
      <TableRow key="{info.address}">
        <TableCell>{info.name}</TableCell>
        <TableCell>{bigintToDecimalNumber(info.poolBalance, info.decimals)}</TableCell>
        <TableCell>{bigintToDecimalNumber((info.poolBalance * 100n) / info.totalSupply, info.decimals)}%</TableCell>
        <TableCell>{bigintToDecimalNumber(accountBalance, info.decimals)}</TableCell>
      </TableRow>
    );
  };

  const table = (
    <TableContainer>
      <Table aria-label="token-info-tabel">
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell>Pool Balance</TableCell>
            <TableCell>% of token in pool</TableCell>
            <TableCell>Wallet balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{isConnected && tokenInfos.map((info) => tokeInfoToRow(info))}</TableBody>
      </Table>
    </TableContainer>
  );

  return table;
}
