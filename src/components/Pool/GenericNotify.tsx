// This is an opinionated Notification
import { Alert, AlertColor, AlertTitle, Snackbar } from "@mui/material";

export function GenericNotify({
  open,
  title,
  value,
  severity,
  handleClose,
}: {
  open: boolean;
  title: string;
  value: JSX.Element;
  severity: AlertColor;
  handleClose: () => void;
}): JSX.Element {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={handleClose} severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {value}
      </Alert>
    </Snackbar>
  );
}

/*
1. There is only every one Notify that exists at a time. The caller has a useState with the value of open, and its default is false
2. When an event occurs, it triggers it opening such as:
- Account import
- Receive amount

3. There should be an array of events, that will be iterated upon when an event occurs.
- on the handleClose function, it will close the notification, remove the event from the array, and then check if there is
  another event to trigger a notification for

*/
