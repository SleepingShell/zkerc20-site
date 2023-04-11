import React, { useContext, useEffect, useRef } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { zeroAmounts, zeroOutput } from "../../../web3/utxo";
import { zkAccount } from "../../../web3/zkAccount";
import { depositProof } from "../../../web3/proof";
import { TransactionProgress } from "./TransactionProgress";
import { DepositArgsStruct, DepositArgsStructEthers, depositArgsToEthers } from "../../../web3/types";
import {
  useErc20Allowance,
  useErc20Approve,
  usePrepareErc20Approve,
  usePrepareZkErc20Deposit,
  useZkErc20Deposit,
  zkErc20Address,
} from "../../../generated";
import { useAccount } from "wagmi";
import { BigNumber } from "ethers";
import { TokensContext } from "../../TokensContext";

export function DepositBox(): JSX.Element {
  const tokens = useContext(TokensContext);
  const { isConnected, address } = useAccount();

  const [token, setToken] = React.useState<`0x${string}`>("0x0");
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [backdropText, setBackdropText] = React.useState("");
  const [depositArgs, setDepositArgs] = React.useState<DepositArgsStructEthers>();

  const to = useRef<HTMLInputElement>();
  const amount = useRef<HTMLInputElement>();

  //TODO: Don't hardcode token
  //const tokenA = "0x8825aDeD4cd69290Aa6E730FD0E9F9747054E84F";
  const { config: depositConfig } = usePrepareZkErc20Deposit({
    args: [depositArgs as DepositArgsStructEthers],
    enabled: depositArgs != null,
  });
  const { data, write, isError, error, status } = useZkErc20Deposit(depositConfig);
  const { config: approvalConfig } = usePrepareErc20Approve({
    address: token,
    args: [zkErc20Address[11155111], BigNumber.from(2).pow(256).sub(1)],
  });
  const { write: writeApproval } = useErc20Approve(approvalConfig);

  const { data: approvalAmount } = useErc20Allowance({
    address: token,
    args: [address != null ? address : "0x0", zkErc20Address[11155111]],
  });

  useEffect(() => {
    write?.();
    setDepositArgs(undefined);
    console.log(status);
    console.log(data);
  }, [write]);

  const handleChange = (event: SelectChangeEvent) => {
    setToken(event.target.value as `0x${string}`);
  };

  const onProofGenerated = (args: DepositArgsStruct) => {
    console.log("Generated proof");
    console.log(args);

    setDepositArgs(depositArgsToEthers(args));
    setBackdropOpen(false);
  };

  const checkApproval = (amount: bigint) => {
    // TODO: Make a UI popup
    if (approvalAmount == null || approvalAmount!.toBigInt() < amount) {
      writeApproval?.();
    }
  };

  const doDeposit = () => {
    // TODO: Notification
    if (token == "0x0") {
      return;
    }

    //TODO: Error handling
    const receiver = zkAccount.fromAddress(to.current!.value);
    const value = BigInt(Number(amount.current!.value) * 10 ** tokens.get(token)!.decimals);

    checkApproval(value);
    const output1 = receiver.pay({ token: token, amount: value });
    const output2 = zeroOutput();

    depositProof(output1.amounts, [output1, output2]).then((args) => onProofGenerated(args));

    setBackdropText("Generating proof...");
    setBackdropOpen(true);
  };

  const handleBackdropClose = () => {
    setBackdropOpen(false);
  };

  const menuItems: JSX.Element[] = [];
  tokens.forEach((token) => {
    menuItems.push(
      <MenuItem value={token.address} key={token.name}>
        {" "}
        {token.name}{" "}
      </MenuItem>
    );
  });

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="deposit-select-label">Token</InputLabel>
        <Select labelId="deposit-select-label" id="deposit-select" value={token} onChange={handleChange} label="Token">
          {menuItems}
        </Select>
      </FormControl>

      <TextField id="deposit-to" variant="standard" label="To" inputRef={to} />
      <br />
      <TextField id="deposit-amount" variant="standard" label="Amount" inputRef={amount} />
      <Button variant="contained" onClick={doDeposit}>
        Deposit
      </Button>

      <TransactionProgress open={backdropOpen} text={backdropText} handleClose={handleBackdropClose} />
      {isError && <div>Error: {error?.message}</div>}
    </Box>
  );
}
