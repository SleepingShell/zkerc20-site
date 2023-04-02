This is a [wagmi](https://wagmi.sh) + [RainbowKit](https://rainbowkit.com) + [Next.js](https://nextjs.org) project bootstrapped with [`create-wagmi`](https://github.com/wagmi-dev/wagmi/tree/main/packages/create-wagmi)

# zkERC20-site

# TODOs

- Fix notifications
  - Queueing multiple notifications overwrites the current showing one

## Notes

Typescript/wagmi cannot read json as a constant for type-safety. Therefore follow these simple steps:

1. Copy abi json files to the abi/ folder
2. Rename them from `.json` to `.ts`
3. Add `export const abi_name =` to the beginning and `as const` after the final `]`
