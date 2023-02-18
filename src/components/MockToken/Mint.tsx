import { Button } from "@mui/material";
import { BigNumber } from "ethers";
import { useAccount } from "wagmi";
import { useMockErc20Mint, usePrepareMockErc20Mint } from "../../generated";

export function callMintTokens(amount: bigint): JSX.Element {
  const { address, isConnected } = useAccount();
  const { config } = usePrepareMockErc20Mint({
    args: [address!, BigNumber.from(amount)]
  });

  const { data, isLoading, isSuccess, write } = useMockErc20Mint(config)

  return (
    <div>
      {isConnected &&
        <Button variant="outlined" onClick={() => write?.()}>
            Mint Mock Tokens
          </Button>
      }
      {isSuccess 
        ? "Minted!"
        : ""
      }
    </div>
  )
}