import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

import { Account, Commitment } from '../components'
import { Header } from '../components/Header'
import { callMintTokens } from '../components/MockToken/Mint'
import { PoolInfo } from '../components/Pool/PoolInfo'
import { TokenInfoTable } from '../components/Pool/TokenInfo'
import { mockErc20Address } from '../generated'

// TODO: Call the network directly without a connected account
//      Since the number of tokens is static, we may as well also get the addresses staticly
export async function getStaticProps() {
  return {
    props: {
      numTokens: 1
    }
  }
}

function Page({ numTokens }: { numTokens: number }) {
  const { isConnected } = useAccount()
  return (
    <>
      {Header()}
      
      {isConnected && <Account />}

      {Commitment()}
      {callMintTokens(1000n*10n**18n)}
      {PoolInfo(numTokens)}
    </>
  )
}

//{TokenInfoTable([mockErc20Address[11155111]])}

export default Page

// Remember, NextJS has to render the site before sending. Therefore we need to correctly load
// the data, so we can't just call await in the function