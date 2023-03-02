import Grid2 from "@mui/material/Unstable_Grid2";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header(): JSX.Element {
  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={4}></Grid2>
      <Grid2 xs={4}>zkERC20 Header</Grid2>
      <Grid2 xs={4}>
        <ConnectButton />
      </Grid2>
    </Grid2>
  );
}
