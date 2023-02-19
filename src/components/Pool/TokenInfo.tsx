import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BigNumber } from "ethers";
import { useAccount } from "wagmi";
import { useErc20BalanceOf, useErc20Decimals, useErc20Name, useErc20Symbol, useErc20TotalSupply, zkErc20Address } from "../../generated";
import { bigintToDecimalNumber } from "../../utils";

type TokenInfo = {
  address: `0x${string}`
  name: string
  decimals: number
  poolBalance: bigint
  totalSuppy: bigint
}

function getTokenData(tokenAddress: `0x${string}`): TokenInfo {
  const addr = zkErc20Address[11155111];
  let { data: balance } = useErc20BalanceOf({ address: tokenAddress, args: [addr]});
  let { data: name } = useErc20Name({ address: tokenAddress });
  let { data: decimals } = useErc20Decimals({ address: tokenAddress});
  let { data: totalSupply } = useErc20TotalSupply({ address: tokenAddress});

  return {
    address: tokenAddress,
    name: name ??= "",
    decimals: decimals ??= 1,
    poolBalance: (balance ??= BigNumber.from(0)).toBigInt(),
    totalSuppy: (totalSupply ??= BigNumber.from(0)).toBigInt()
  }
}

export function TokenInfoTable(tokens: `0x${string}`[]): JSX.Element {
  const tokenInfos = tokens.map((token) => getTokenData(token));
  const { isConnected } = useAccount();

  const table = 
  <TableContainer>
    <Table aria-label="token-info-tabel">
      <TableHead>
        <TableRow>
          <TableCell>Token</TableCell>
          <TableCell>Pool Balance</TableCell>
          <TableCell>% of token in pool</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
      { isConnected && tokenInfos.map((info) => (
          <TableRow key="{info.address}">
            <TableCell>{info.name}</TableCell>
            <TableCell>{bigintToDecimalNumber(info.poolBalance, info.decimals)}</TableCell>
            <TableCell>{bigintToDecimalNumber(info.poolBalance*100n/info.totalSuppy, info.decimals)}%</TableCell>
          </TableRow>
      ))}
      </TableBody>
    </Table>
  </TableContainer>

  return table
}