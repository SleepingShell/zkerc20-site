import React, { useRef } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { AddressName } from "../../../pages";
import { zeroAmounts, zeroOutput } from "../../../web3/utxo";
import { zkAccount } from "../../../web3/zkAccount";
import { depositProof } from "../../../web3/proof";
import { TransactionProgress } from "./TransactionProgress";
import { DepositArgsStruct, DepositArgsStructEthers, depositArgsToEthers } from "../../../web3/types";
import { usePrepareZkErc20Deposit, useZkErc20Deposit } from "../../../generated";

export function DepositBox({ tokens }: { tokens: Map<`0x${string}`, string> }): JSX.Element {
  const [token, setToken] = React.useState("");
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [backdropText, setBackdropText] = React.useState("");
  const [depositArgs, setDepositArgs] = React.useState<DepositArgsStructEthers>();

  const to = useRef<HTMLInputElement>();
  const amount = useRef<HTMLInputElement>();

  const { config: depositConfig } = usePrepareZkErc20Deposit({ args: [depositArgs as DepositArgsStructEthers] });
  const { write } = useZkErc20Deposit(depositConfig);

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

  const doDeposit = () => {
    //TODO: Error handling
    const receiver = zkAccount.fromAddress(to.current!.value);
    const amounts = zeroAmounts();

    const output1 = receiver.payRaw(amounts);
    const output2 = zeroOutput();

    depositProof(amounts, [output1, output2]).then((args) => onProofGenerated(args));

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
