import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { BigNumber } from "ethers";
import { useAccount } from "wagmi";
import { useErc20BalanceOf, useErc20Name, useErc20Symbol, useErc20TotalSupply, zkErc20Address } from "../../generated";

type TokenInfo = {
  address: `0x${string}`
  name: string
  poolBalance: bigint
  totalSuppy: bigint
}

function getTokenData(tokenAddress: `0x${string}`): TokenInfo {
  const addr = zkErc20Address[11155111];
  let { data: balance } = useErc20BalanceOf({ address: tokenAddress, args: [addr]});
  let { data: name } = useErc20Name({ address: tokenAddress });
  let { data: totalSupply } = useErc20TotalSupply({ address: tokenAddress});

  return {
    address: tokenAddress,
    name: name ??= "",
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
            <TableCell>{info.poolBalance.toString()}</TableCell>
            <TableCell>{info.totalSuppy.toString()}</TableCell>
          </TableRow>
      ))}
      </TableBody>
    </Table>
  </TableContainer>

  return table
}