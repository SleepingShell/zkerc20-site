import { ConnectButton } from '@rainbow-me/rainbowkit'
import { BigNumber } from 'ethers'
import { useState } from 'react'
import { useAccount } from 'wagmi'

import { Account, Commitment } from '../components'
import { Header } from '../components/Header'
import { callMintTokens } from '../components/MockToken/Mint'
import { PoolInfo } from '../components/Pool/PoolInfo'
import { TokenInfoTable } from '../components/Pool/TokenInfo'
import { PoolAccountBox } from '../components/PoolAccount'
import { DepositBox } from '../components/Transact/Deposit'
import { mockErc20Address, useErc20Name, useZkErc20Tokens } from '../generated'

// TODO: Call the network directly without a connected account
//      Since the number of tokens is static, we may as well also get the addresses staticly
export async function getStaticProps() {
  return {
    props: {
      numTokens: 1
    }
  }
}

export type AddressName = {
  address: `0x${string}`,
  name?: string
}

function getTokens(numTokens: number): AddressName[] {
  const tokens: AddressName[] = []
  for (let i = 0; i < numTokens; i++) {
    const { data } = useZkErc20Tokens({args: [BigNumber.from(i)]});
    if (data !== undefined) {
      const { data: name } = useErc20Name({ address: data});
      tokens.push({address: data, name: name});
    } else {
      console.log(`Got undefined token ${i}`);
    }
  }

  return tokens
}

function Page({ numTokens }: { numTokens: number }) {
  const { isConnected } = useAccount()
  const tokens = getTokens(numTokens);

  const [ poolAccounts, setPoolAccounts ] = useState<string[]>([]);
  const addKey = (key: string) => {
    setPoolAccounts(poolAccounts.concat(key));
  }

  return (
    <>
      {Header()}

      {Commitment()}
      {callMintTokens(1000n*10n**18n)}
      {PoolInfo(tokens)}
      {DepositBox(tokens)}
      <PoolAccountBox accounts={poolAccounts} onKeyImport={addKey} />
    </>
  )
}

//{TokenInfoTable([mockErc20Address[11155111]])}

export default Page