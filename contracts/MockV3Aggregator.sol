// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockV3Aggregator is AggregatorV3Interface {
    uint8 public immutable override decimals;
    int256 private answer;
    uint80 private roundId;
    uint256 private updatedAt;

    constructor(uint8 decimals_, int256 answer_) {
        decimals = decimals_;
        answer = answer_;
        roundId = 1;
        updatedAt = block.timestamp;
    }

    function description() external pure override returns (string memory) {
        return "Mock ETH / USD";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(uint80 requestedRoundId)
        external
        view
        override
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (requestedRoundId, answer, updatedAt, updatedAt, requestedRoundId);
    }

    function latestRoundData()
        external
        view
        override
        returns (uint80, int256, uint256, uint256, uint80)
    {
        return (roundId, answer, updatedAt, updatedAt, roundId);
    }
}
