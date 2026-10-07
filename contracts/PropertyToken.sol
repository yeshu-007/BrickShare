// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyToken is ERC20, Ownable {
    uint256 public immutable pricePerToken;
    uint256 public immutable totalSupplyCap;
    bool public saleActive;
    mapping(address => bool) public isVerified;

    error NotVerified(address account);
    error SaleNotActive();
    error SupplyCapExceeded();
    error IncorrectPayment();

    event VerificationUpdated(address indexed investor, bool status);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 ethPaid);
    event SaleStatusChanged(bool active);
    event Withdrawn(address indexed to, uint256 amount);

    receive() external payable {}

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        uint256 pricePerToken_,
        uint256 totalSupplyCap_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        pricePerToken = pricePerToken_;
        totalSupplyCap = totalSupplyCap_;
        saleActive = true;
    }

    function setVerified(address investor, bool status) external onlyOwner {
        isVerified[investor] = status;
        emit VerificationUpdated(investor, status);
    }

    function buy(uint256 amount) external payable {
        if (!saleActive) revert SaleNotActive();
        if (!isVerified[msg.sender]) revert NotVerified(msg.sender);
        if (msg.value != amount * pricePerToken) revert IncorrectPayment();
        if (totalSupply() + amount > totalSupplyCap) revert SupplyCapExceeded();

        _mint(msg.sender, amount);
        emit TokensPurchased(msg.sender, amount, msg.value);
    }

    function setSaleActive(bool active) external onlyOwner {
        saleActive = active;
        emit SaleStatusChanged(active);
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        address payable recipient = payable(owner());

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert();

        emit Withdrawn(recipient, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (to != address(0) && !isVerified[to]) revert NotVerified(to);
        super._update(from, to, value);
    }
}
