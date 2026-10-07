// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {PropertyToken} from "./PropertyToken.sol";

contract BrickShareFactory is Ownable {
    AggregatorV3Interface public immutable priceFeed;
    address[] private deployedProperties;
    mapping(address => bool) public isPropertyToken;

    error StalePrice();

    event PropertyCreated(
        address indexed token,
        string name,
        uint256 priceInEth,
        uint256 supplyCap
    );

    constructor(address priceFeedAddress) Ownable(msg.sender) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function createProperty(
        string memory name,
        string memory symbol,
        uint256 usdPricePerToken,
        uint256 totalSupplyCap
    ) external onlyOwner returns (address) {
        uint256 ethUsdPrice = getLatestEthUsdPrice();

        // USD price (18 decimals) * wei per ETH / ETH/USD price (18 decimals)
        uint256 ethPricePerToken = (usdPricePerToken * 1e18) / ethUsdPrice;

        PropertyToken token = new PropertyToken(
            name,
            symbol,
            msg.sender,
            ethPricePerToken,
            totalSupplyCap
        );

        address tokenAddress = address(token);
        deployedProperties.push(tokenAddress);
        isPropertyToken[tokenAddress] = true;

        emit PropertyCreated(tokenAddress, name, ethPricePerToken, totalSupplyCap);
        return tokenAddress;
    }

    function getDeployedProperties() external view returns (address[] memory) {
        return deployedProperties;
    }

    function getLatestEthUsdPrice() public view returns (uint256) {
        (, int256 answer, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        if (answer <= 0 || updatedAt == 0) revert StalePrice();

        // Chainlink answers use 8 decimals; normalize to 18 decimals.
        return uint256(answer) * 1e10;
    }
}
