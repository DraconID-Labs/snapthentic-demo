// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract SnapthenticRegistry {
    address public owner;
    mapping(address => bool) public callers;

    event CallerAdded(address caller);
    event CallerRemoved(address caller);

    event Snap(address indexed caller, bytes indexed signature, bytes indexed hash);

    constructor() {
        owner = msg.sender;
        callers[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyCaller() {
        require(callers[msg.sender], "Only callers can call this function");
        _;
    }

    function setOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function addCaller(address caller) public onlyOwner {
        callers[caller] = true;
        emit CallerAdded(caller);
    }

    function removeCaller(address caller) public onlyOwner {
        callers[caller] = false;
        emit CallerRemoved(caller);
    }

    function isCaller(address caller) public view returns (bool) {
        return callers[caller];
    }

    function registerSnap(address caller, bytes memory signature, bytes memory hash) public onlyCaller {
        emit Snap(caller, signature, hash);
    }
}
