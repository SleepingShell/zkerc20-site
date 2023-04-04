import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BigNumber } from "ethers";
import { useAccount } from "wagmi";
import {
  useErc20BalanceOf,
  useErc20Decimals,
  useErc20Name,
  useErc20Symbol,
  useErc20TotalSupply,
  zkErc20Address,
} from "../../../generated";
import { AddressName } from "../../../pages";
import { bigintToDecimalNumber } from "../../../utils";

type TokenInfo = {
  address: `0x${string}`;
  name: string;
  decimals: number;
  poolBalance: bigint;
  totalSuppy: bigint;
};

function getTokenData({ address, name }: { address: `0x${string}`; name?: string }): TokenInfo {
  const addr = zkErc20Address[11155111];
  let { data: balance } = useErc20BalanceOf({ address: address, args: [addr] });
  let { data: decimals } = useErc20Decimals({ address });
  let { data: totalSupply } = useErc20TotalSupply({ address });

  return {
    address: address,
    name: (name ??= ""),
    decimals: (decimals ??= 1),
    poolBalance: (balance ??= BigNumber.from(0)).toBigInt(),
    totalSuppy: (totalSupply ??= BigNumber.from(1)).toBigInt(),
  };
}

function getTokenBalancesOfAccount(tokens: `0x${string}`[], accountAddress: `0x${string}`): Map<`0x${string}`, bigint> {
  const balances: Map<`0x${string}`, bigint> = new Map();

  for (const token of tokens) {
    let { data } = useErc20BalanceOf({ address: token, args: [accountAddress] });
    balances.set(token, (data ??= BigNumber.from(0)).toBigInt());
  }

  return balances;
}

export function TokenInfoTable(tokens: Map<`0x${string}`, string>): JSX.Element {
  const { isConnected, address } = useAccount();
  const tokenInfos: TokenInfo[] = [];
  const accountBalances: Map<`0x${string}`, bigint> = new Map();
  tokens.forEach((name, addr) => {
    tokenInfos.push(getTokenData({ address: addr, name: name }));

    const a = address ?? "0x0";
    let { data } = useErc20BalanceOf({ address: addr, args: [a] });
    accountBalances.set(addr, (data ??= BigNumber.from(0)).toBigInt());
  });

  // ERROR: Rendered more hooks than during the previous render.
  const tokeInfoToRow = (info: TokenInfo): JSX.Element => {
    const accountBalance = accountBalances.get(info.address) as bigint;

    return (
      <TableRow key="{info.address}">
        <TableCell>{info.name}</TableCell>
        <TableCell>{bigintToDecimalNumber(info.poolBalance, info.decimals)}</TableCell>
        <TableCell>{bigintToDecimalNumber((info.poolBalance * 100n) / info.totalSuppy, info.decimals)}%</TableCell>
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
