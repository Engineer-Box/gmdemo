// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./IERC20.sol";
import "hardhat/console.sol";

contract Gamerly is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    IERC20 private USDC;

    enum TransactionType { Deposit, Withdraw }

    struct Transaction {
        uint64 id;
        uint256 amount;
        address profileAddress;
        TransactionType transactionType;
    }

    mapping(uint64 => Transaction) private transactions;
    uint64[] private transactionIds;

    error TransactionIdAlreadyExists();
    error InsufficientBalance();
    error InsufficientAllowance();
    error TransferFailed();

    modifier validateTransaction(uint64 transactionId, address profileAddress, uint256 amount) {
        bool exists = transactions[transactionId].id == transactionId;
        if (exists) revert TransactionIdAlreadyExists();
        _;
    }

    modifier hasSufficientBalance(address account, uint256 amount) {
        if (USDC.balanceOf(account) < amount) revert InsufficientBalance();
        _;
    }

    modifier hasSufficientAllowance(address account, uint256 amount) {
        if (USDC.allowance(account, address(this)) < amount) revert InsufficientAllowance();
        _;
    }

    function initialize(address _usdcAddress) initializer public {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        USDC = IERC20(_usdcAddress);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function deposit(uint64 transactionId, uint256 amount, address profileAddress)
        external nonReentrant onlyOwner validateTransaction(transactionId, profileAddress, amount)
        hasSufficientBalance(profileAddress, amount) hasSufficientAllowance(profileAddress, amount)
    {
        if (!USDC.transferFrom(profileAddress, address(this), amount)) revert TransferFailed();
        _recordTransaction(transactionId, amount, profileAddress, TransactionType.Deposit);
    }

    function withdraw(uint64 transactionId, uint256 amount, address profileAddress)
        external nonReentrant onlyOwner validateTransaction(transactionId, profileAddress, amount)
        hasSufficientBalance(address(this), amount)
    {
        if (!USDC.transfer(profileAddress, amount)) revert TransferFailed();
        _recordTransaction(transactionId, amount, profileAddress, TransactionType.Withdraw);
    }

    function withdrawToOwner(uint256 amount) external nonReentrant onlyOwner hasSufficientBalance(address(this), amount) {
        if (!USDC.transfer(owner(), amount)) revert TransferFailed();
    }

    function getTransaction(uint64 transactionId) external onlyOwner view returns (Transaction memory transaction) {
        return transactions[transactionId];
    }

    function getTransactionIds() external onlyOwner view returns (uint64[] memory) {
        return transactionIds;
    }

    function _recordTransaction(uint64 transactionId, uint256 amount, address profileAddress, TransactionType transactionType) internal {
        Transaction memory newTransaction = Transaction(transactionId, amount, profileAddress, transactionType);
        transactions[transactionId] = newTransaction;
        transactionIds.push(transactionId);
    }
}
