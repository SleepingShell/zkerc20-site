import { Alert, Box, Button, List, ListItem, ListItemText, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { zkAccount } from "../../../web3/zkAccount";

export enum AccountStatusMessage {
  Empty,
  SuccessImport,
  ErrorImport,
  CopyFailed,
}

// TODO: Add properties to an account object that contains balance totals
export function PoolAccountBox({
  accounts,
  onKeyImport,
  status,
}: {
  accounts: zkAccount[];
  onKeyImport: (key: string) => void;
  status: AccountStatusMessage;
}): JSX.Element {
  const GEN_ACCOUNT_TEXT = "Generate Account";
  const IMPORT_ACCOUNT_TEXT = "Import Account";
  const privateKeyRef = useRef<HTMLInputElement>();
  const [buttonText, setButtonText] = useState("Generate Account");

  const copyTextToClipboard = async (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {},
      () => {}
    );
  };

  const doImport = () => {
    const val = privateKeyRef.current!.value;
    onKeyImport(val);
    privateKeyRef.current!.value = "";
    onImportChange();
  };

  const onImportChange = () => {
    const val = privateKeyRef.current!.value;
    val === "" ? setButtonText(GEN_ACCOUNT_TEXT) : setButtonText(IMPORT_ACCOUNT_TEXT);
  };

  const alertBox = (): JSX.Element => {
    if (status === AccountStatusMessage.SuccessImport) {
      return <Alert severity="success">Successfully Imported Account</Alert>;
    } else if (status === AccountStatusMessage.ErrorImport) {
      return <Alert severity="error">Error importing account</Alert>;
    } else if (status === AccountStatusMessage.CopyFailed) {
      return <Alert severity="error">Error copying to clipboard</Alert>;
    }

    return <></>;
  };

  return (
    <Box>
      <TextField
        id="account-import-field"
        label="Import Account"
        variant="outlined"
        inputRef={privateKeyRef}
        onChange={onImportChange}
      />
      <Button id="account-button" variant="contained" onClick={doImport}>
        {buttonText}
      </Button>
      {alertBox()}
      <List>
        {accounts.map((account) => (
          <ListItem sx={{ maxWidth: 400 }}>
            <ListItemText
              primary={account.getAddress()}
              primaryTypographyProps={{
                variant: "body1",
                style: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
            <Button variant="outlined" onClick={() => copyTextToClipboard(account.getAddress())}>
              ???
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
