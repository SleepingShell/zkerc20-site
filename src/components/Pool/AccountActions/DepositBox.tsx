import React, { useRef } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { AddressName } from "../../../pages";
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

export function DepositBox({ tokens }: { tokens: Map<`0x${string}`, string> }): JSX.Element {
  const { isConnected, address } = useAccount();

  const [token, setToken] = React.useState("");
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [backdropText, setBackdropText] = React.useState("");
  const [depositArgs, setDepositArgs] = React.useState<DepositArgsStructEthers>();

  const to = useRef<HTMLInputElement>();
  const amount = useRef<HTMLInputElement>();

  //TODO: Don't hardcode token
  const tokenA = "0x8825aDeD4cd69290Aa6E730FD0E9F9747054E84F";
  const { config: depositConfig } = usePrepareZkErc20Deposit({ args: [depositArgs as DepositArgsStructEthers] });
  const { write } = useZkErc20Deposit(depositConfig);
  const { config: approvalConfig } = usePrepareErc20Approve({
    address: tokenA,
    args: [zkErc20Address[11155111], BigNumber.from(2).pow(256).sub(1)],
  });
  const { write: writeApproval } = useErc20Approve(approvalConfig);

  const { data: approvalAmount } = useErc20Allowance({
    address: tokenA,
    args: [address != null ? address : "0x0", zkErc20Address[11155111]],
  });

  const handleChange = (event: SelectChangeEvent) => {
    setToken(event.target.value);
  };

  const onProofGenerated = (args: DepositArgsStruct) => {
    console.log("Generated proof");
    console.log(args);

    setDepositArgs(depositArgsToEthers(args));
    write?.();
    setBackdropOpen(false);
  };

  const checkApproval = (amount: bigint) => {
    // TODO: Make a UI popup\
    if (approvalAmount == null || approvalAmount!.toBigInt() < amount) {
      writeApproval?.();
    }
  };

  const doDeposit = () => {
    //TODO: Error handling
    const receiver = zkAccount.fromAddress(to.current!.value);
    const value = BigInt(amount.current!.value);

    checkApproval(value);
    const output1 = receiver.pay({ token: tokenA, amount: value });
    const output2 = zeroOutput();

    depositProof(output1.amounts, [output1, output2]).then((args) => onProofGenerated(args));

    setBackdropText("Generating proof...");
    setBackdropOpen(true);
  };

  const handleBackdropClose = () => {
    setBackdropOpen(false);
  };

  const menuItems: JSX.Element[] = [];
  tokens.forEach((name, addr) => {
    menuItems.push(
      <MenuItem value={addr} key={name}>
        {" "}
        {name}{" "}
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
    </Box>
  );
}
