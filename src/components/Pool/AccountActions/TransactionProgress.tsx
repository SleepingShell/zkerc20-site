// https://mui.com/material-ui/react-backdrop/

import { Backdrop, CircularProgress, Dialog } from "@mui/material";

export function TransactionProgress({
  open,
  text,
  handleClose,
}: {
  open: boolean;
  text: string;
  handleClose: () => void;
}): JSX.Element {
  //TODO: Tailwind center progress
  return (
    <Dialog open={open} onClose={handleClose}>
      <CircularProgress color="inherit" />
      <br />
      {text}
    </Dialog>
  );
}
