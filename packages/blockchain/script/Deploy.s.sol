// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SnapthenticRegistry} from "../src/SnapthenticRegistry.sol";

contract Deploy is Script {
    SnapthenticRegistry public registry;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        registry = new SnapthenticRegistry();

        vm.stopBroadcast();
    }
}
