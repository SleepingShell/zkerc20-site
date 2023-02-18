export const zkerc20_abi_json = `
[
  "constructor(uint256,uint256,address)",
  "error DoubleSpend(uint256)",
  "error MaxTokensAdded()",
  "event Commitment(uint256,uint256,bytes)",
  "event Deposit(address indexed,uint256)",
  "event OwnershipTransferred(address indexed,address indexed)",
  "function addToken(address)",
  "function addVerifier(uint256,uint256,address)",
  "function deposit(tuple(uint256[10],uint256[2],bytes[2],bytes))",
  "function isValidCommitmentRoot(uint256) view returns (bool)",
  "function owner() view returns (address)",
  "function renounceOwnership()",
  "function tokens(uint256) view returns (address)",
  "function transact(tuple(uint256,uint256[10],uint256[],uint256[],bytes[],bytes))",
  "function transferOwnership(address)",
  "function tree() view returns (uint256, uint256, uint256)",
  "function verifiers(uint256) view returns (address)"
]
`

export const mockerc20_abi_json = `
[
  "constructor(string,string)",
  "event Approval(address indexed,address indexed,uint256)",
  "event Transfer(address indexed,address indexed,uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function decreaseAllowance(address,uint256) returns (bool)",
  "function increaseAllowance(address,uint256) returns (bool)",
  "function mint(address,uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function transferFrom(address,address,uint256) returns (bool)"
]
`