export const zkerc20_abi = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_depth",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_zero",
        "type": "uint256"
      },
      {
        "internalType": "contract IVerifier",
        "name": "_depositVerifier",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "DoubleSpend",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MaxTokensAdded",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "commitment",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "encryptedData",
        "type": "bytes"
      }
    ],
    "name": "Commitment",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "addToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "numInputs",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numOutputs",
        "type": "uint256"
      },
      {
        "internalType": "contract IVerifier",
        "name": "verifier",
        "type": "address"
      }
    ],
    "name": "addVerifier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256[10]",
            "name": "depositAmount",
            "type": "uint256[10]"
          },
          {
            "internalType": "uint256[2]",
            "name": "outCommitments",
            "type": "uint256[2]"
          },
          {
            "internalType": "bytes[2]",
            "name": "encryptedOutputs",
            "type": "bytes[2]"
          },
          {
            "internalType": "bytes",
            "name": "proof",
            "type": "bytes"
          }
        ],
        "internalType": "struct zkERC20.DepositArgs",
        "name": "args",
        "type": "tuple"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "isValidCommitmentRoot",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tokens",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "root",
            "type": "uint256"
          },
          {
            "internalType": "uint256[10]",
            "name": "withdrawAmount",
            "type": "uint256[10]"
          },
          {
            "internalType": "uint256[]",
            "name": "inNullifiers",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "outCommitments",
            "type": "uint256[]"
          },
          {
            "internalType": "bytes[]",
            "name": "encryptedOutputs",
            "type": "bytes[]"
          },
          {
            "internalType": "bytes",
            "name": "proof",
            "type": "bytes"
          }
        ],
        "internalType": "struct zkERC20.TransactionArgs",
        "name": "args",
        "type": "tuple"
      }
    ],
    "name": "transact",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tree",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "depth",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "root",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "numberOfLeaves",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "verifiers",
    "outputs": [
      {
        "internalType": "contract IVerifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;