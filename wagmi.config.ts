import { defineConfig } from '@wagmi/cli'
import { erc, react } from '@wagmi/cli/plugins'
import { sepolia } from 'wagmi/chains'
import { mockerc20_abi } from './abi/MockERC20'
import { zkerc20_abi } from './abi/zkERC20'

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      abi: zkerc20_abi,
      name: 'zkERC20',
      address: {
        [sepolia.id]: "0x6335e0683545c4342A61d60d7c88776c90E3F95b"
      }
    },
    {
      abi: mockerc20_abi,
      name: 'mockERC20',
      address: {
        [sepolia.id]: "0x8825aDeD4cd69290Aa6E730FD0E9F9747054E84F"
      }
    }
  ],
  plugins: [
    erc({
      20: true,
      721: false,
      4626: false
    }),
    react()
  ]
})
