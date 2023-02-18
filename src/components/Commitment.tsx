import { useZkErc20Owner } from "../generated";


export function Commitment(): JSX.Element {
  const { data, isError, isLoading } = useZkErc20Owner();
  if (isLoading) {
    return <div>Loading owner...</div>
  }

  if (isError) {
    return <div>ERROR GETTING OWNER</div>
  }

  return <div>{data}</div>;
}