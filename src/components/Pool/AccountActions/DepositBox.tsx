import React, { useRef } from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { AddressName } from "../../../pages";

export function DepositBox({ tokens }: { tokens: Map<`0x${string}`, string> }): JSX.Element {
  const [token, setToken] = React.useState("");
  const to = useRef<HTMLInputElement>();
  const amount = useRef<HTMLInputElement>();

  const handleChange = (event: SelectChangeEvent) => {
    setToken(event.target.value);
  };

  const doDeposit = () => {
    console.log(to.current!.value);
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
    </Box>
  );
}
