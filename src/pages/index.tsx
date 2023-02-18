import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

import { Account, Commitment } from '../components'
import { callMintTokens } from '../components/MockToken/Mint'

function Page() {
  const { isConnected } = useAccount()
  return (
    <>
      {Header()}

      <ConnectButton />
      {isConnected && <Account />}
      <div>Separator</div>
      {Commitment()}
      {callMintTokens(10000000000n)}
    </>
  )
}

export default Page


function Header(): JSX.Element {
  return <h1>zkERC20 Header</h1>
}

// Remember, NextJS has to render the site before sending. Therefore we need to correctly load
// the data, so we can't just call await in the function