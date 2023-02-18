import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

import { Account, Commitment } from '../components'
import { Header } from '../components/Header'
import { callMintTokens } from '../components/MockToken/Mint'

function Page() {
  const { isConnected } = useAccount()
  return (
    <>
      {Header()}
      
      {isConnected && <Account />}
      <div>Separator</div>
      {Commitment()}
      {callMintTokens(10000000000n)}
    </>
  )
}

export default Page

// Remember, NextJS has to render the site before sending. Therefore we need to correctly load
// the data, so we can't just call await in the function