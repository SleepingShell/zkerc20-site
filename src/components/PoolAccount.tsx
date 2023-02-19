import { Box, Button, List, ListItem, ListItemText, TextField } from "@mui/material";
import { useEffect, useRef } from "react";

// TODO: Add properties to an account object that contains balance totals
export function PoolAccountBox({accounts, onKeyImport} : { accounts: string[], onKeyImport: (key: string) => void}): JSX.Element {
  const privateKeyRef = useRef<HTMLInputElement>();

  const doImport = () => {
    const val = privateKeyRef.current!.value;
    val != '' && onKeyImport(val);
  }

  return <Box>
    <TextField id="account-import-field" label="Import Account" variant="outlined" inputRef={privateKeyRef} />
    <Button variant="contained" onClick={doImport}>Import Account</Button>
    <List>
      {accounts.map((account) => <ListItem><ListItemText primary={account}/></ListItem>)}
    </List>
  </Box>
}