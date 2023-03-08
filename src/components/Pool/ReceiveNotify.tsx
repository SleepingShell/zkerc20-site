import { Alert, AlertTitle, Snackbar } from "@mui/material";
import { useState } from "react";
import { NameValue } from "./Application";

export function ReceiveNotify({ value, handleClose }: { value: NameValue; handleClose: () => void }): JSX.Element {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="success">
        <AlertTitle>Received UTXO</AlertTitle>
        {value.value} <strong>{value.name}</strong>
      </Alert>
    </Snackbar>
  );
}
