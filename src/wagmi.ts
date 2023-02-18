import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createClient } from 'wagmi'
import { goerli, mainnet, sepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { mockerc20_abi } from '../abi/MockERC20'
import { zkerc20_abi } from '../abi/zkERC20'
import { useZkErc20, useZkErc20Owner } from './generated'

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, ...(process.env.NODE_ENV === 'development' ? [goerli, sepolia] : [])],
  [
    publicProvider(),
  ],
)

const { connectors } = getDefaultWallets({
  appName: 'zkERC20',
  chains,
})

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
})

export { chains }