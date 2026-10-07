# BrickShare

**Name:** TODO: add full name  
**Enrolment ID:** TODO: add enrolment ID  
**University:** Atria University  
**Testnet wallet address:** `0x09b6EB1FbdfBea3a2f2247af1603dFe36cF46e8D`

## What it does

BrickShare is a Hardhat and Solidity project for compliant fractional real-estate tokens. `BrickShareFactory` creates one ERC-20 `PropertyToken` for each property. Every property token has a fixed ETH price, a maximum supply, and an owner-managed verification whitelist. Verified investors can buy and transfer shares only to other verified addresses.

## Project structure

```text
contracts/BrickShareFactory.sol  Factory and Chainlink price conversion
contracts/PropertyToken.sol       Fixed-price compliant ERC-20 property token
contracts/MockV3Aggregator.sol    Local Chainlink-compatible test mock
test/                             Hardhat tests
scripts/deploy.js                 Sepolia deployment script
scripts/demo.js                   Local end-to-end demonstration
remix/                            Three-file Remix demo copy
```

## Design decisions

- Each property gets a separate `PropertyToken` contract.
- `pricePerToken` and `totalSupplyCap` are immutable after deployment.
- The factory reads Chainlink ETH/USD once when a property is created and stores the resulting fixed wei price in the new token.
- Chainlink's 8-decimal answer is normalized to 18 decimals before the USD-to-ETH calculation.
- OpenZeppelin `ERC20` and `Ownable` provide standard token behavior and access control.
- The token's `_update` hook prevents minting or transferring tokens to unverified addresses; burns to the zero address remain possible.

## Security considerations

- All privileged actions use OpenZeppelin `Ownable`.
- Purchases require an active sale, a verified buyer, exact ETH payment, and available supply.
- ETH withdrawal uses a checks-effects-interactions-compatible balance snapshot and sends the full balance only to the owner.
- Custom errors are used for application-specific failures.
- This is an educational project and has not received an independent production security audit.

## How to run it

Requirements: Node.js and npm.

```text
npm install
npx hardhat test
npx hardhat run scripts/demo.js
```

For Sepolia, copy `.env.example` to `.env`, add your own credentials, and run:

```text
npx hardhat run scripts/deploy.js --network sepolia
```

Never commit `.env`, private keys, or seed phrases. `.gitignore` excludes secrets, dependencies, build output, and cache files.

## Test output

The test suite uses `MockV3Aggregator`, so local tests do not depend on a live Chainlink feed. It covers successful property creation and registry insertion, verified purchases, verified transfers, owner controls, withdrawal, and the required failure paths for verification, access control, supply cap, payment, and sale status.

Run `npx hardhat test` to reproduce the result locally. TODO: paste the final terminal output before submission if the evaluator requires a captured count.

## Deployment

Sepolia deployment completed for demonstration:

- Factory: `0x13EBf963016d613ee3472Ce1F2431Accd12ddcAf` — [view on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x13EBf963016d613ee3472Ce1F2431Accd12ddcAf)
- PropertyToken: `0xA98cd765BBaA44Deb1671A15C76a8473709EE961` — [view on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xA98cd765BBaA44Deb1671A15C76a8473709EE961)
- Chainlink ETH/USD feed: `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- Deployment transaction hash: TODO: add if required by the evaluator.

## What's out of scope

There is no frontend, backend, real KYC integration, secondary marketplace, yield distribution, dynamic pricing, or support for non-real-estate asset types.

## Acknowledgements

This project uses OpenZeppelin Contracts, Chainlink's `AggregatorV3Interface`, Hardhat, and ethers. AI assistance was used for scaffolding, debugging, documentation, and test planning; the student should review and explain every implementation choice during the viva.
