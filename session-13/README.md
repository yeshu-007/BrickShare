# Session 13 — BrickShare Final Project

**Name:** TODO: add full name  
**Enrolment ID:** TODO: add enrolment ID  
**Date submitted:** 2026-10-07

## 1. What this contract does

BrickShare creates ERC-20 tokens representing fractional shares of one real-world property. The factory deploys one `PropertyToken` per property, converts a USD price using Chainlink ETH/USD data, and stores the created token address. A property owner can verify investors, pause or resume sales, and withdraw collected ETH.

## 2. Design decisions

- Each property has its own token contract with an immutable price and supply cap.
- Verification is an owner-managed boolean mapping; real KYC integration is outside this student project.
- OpenZeppelin ERC-20 and Ownable contracts provide standard token behavior and access control.
- Chainlink's 8-decimal answer is normalized to 18 decimals before price conversion.
- The ERC-20 `_update` hook blocks minting and transfers to unverified recipients.

## 3. Deployment

- Network: Sepolia
- Factory: `0x13EBf963016d613ee3472Ce1F2431Accd12ddcAf`
- [Factory on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x13EBf963016d613ee3472Ce1F2431Accd12ddcAf)
- PropertyToken: `0xA98cd765BBaA44Deb1671A15C76a8473709EE961`
- [PropertyToken on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xA98cd765BBaA44Deb1671A15C76a8473709EE961)
- Deployment transaction hash: TODO: add if required.

## 4. How to test it

```text
npm install
npx hardhat test
```

Tests use a local `MockV3Aggregator` and cover property creation, registry insertion, verified buying, verified transfers, owner controls, withdrawal, and failures for unverified users, unauthorized callers, supply limits, incorrect payment, and inactive sales. The verified local result is **11 passing**. An unverified `buy` call is expected to revert with `NotVerified(address)`.

## 5. What I found difficult

The main difficulty was handling the difference between Chainlink's 8-decimal price and the project's 18-decimal USD values. The factory normalizes the feed result before calculating the fixed wei price. TODO: add one personal debugging lesson before submission.

## 6. Acknowledgements

OpenZeppelin Contracts, Chainlink's `AggregatorV3Interface`, Hardhat, and ethers were used. AI assistance was used for scaffolding, debugging, documentation, and test planning; the student should review and explain the submitted code during the viva.
