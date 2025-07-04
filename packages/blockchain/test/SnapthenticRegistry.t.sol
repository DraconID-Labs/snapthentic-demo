// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {SnapthenticRegistry} from "../src/SnapthenticRegistry.sol";

contract SnapthenticRegistryTest is Test {
    SnapthenticRegistry public registry;
    
    address public owner;
    address public alice;
    address public bob;
    address public charlie;
    
    // Test data
    bytes public testSignature = hex"1234567890abcdef";
    bytes public testHash = hex"abcdef1234567890";
    bytes public testSignature2 = hex"fedcba0987654321";
    bytes public testHash2 = hex"0987654321fedcba";

    event CallerAdded(address caller);
    event CallerRemoved(address caller);
    event Snap(address indexed caller, bytes indexed signature, bytes indexed hash);

    function setUp() public {
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");
        
        registry = new SnapthenticRegistry();
    }

    // Constructor and initial state tests
    function test_Constructor() public {
        assertEq(registry.owner(), owner);
        assertTrue(registry.callers(owner));
        assertTrue(registry.isCaller(owner));
    }

    // Owner management tests
    function test_SetOwner() public {
        registry.setOwner(alice);
        assertEq(registry.owner(), alice);
    }

    function test_SetOwnerRevertNonOwner() public {
        vm.prank(alice);
        vm.expectRevert("Only owner can call this function");
        registry.setOwner(alice);
    }

    function test_SetOwnerToZeroAddress() public {
        registry.setOwner(address(0));
        assertEq(registry.owner(), address(0));
    }

    // Caller management tests
    function test_AddCaller() public {
        vm.expectEmit(true, false, false, false);
        emit CallerAdded(alice);
        
        registry.addCaller(alice);
        assertTrue(registry.callers(alice));
        assertTrue(registry.isCaller(alice));
    }

    function test_AddCallerRevertNonOwner() public {
        vm.prank(alice);
        vm.expectRevert("Only owner can call this function");
        registry.addCaller(bob);
    }

    function test_AddCallerAlreadyExists() public {
        registry.addCaller(alice);
        // Should not revert when adding existing caller
        registry.addCaller(alice);
        assertTrue(registry.isCaller(alice));
    }

    function test_RemoveCaller() public {
        registry.addCaller(alice);
        assertTrue(registry.isCaller(alice));
        
        vm.expectEmit(true, false, false, false);
        emit CallerRemoved(alice);
        
        registry.removeCaller(alice);
        assertFalse(registry.callers(alice));
        assertFalse(registry.isCaller(alice));
    }

    function test_RemoveCallerRevertNonOwner() public {
        registry.addCaller(alice);
        
        vm.prank(alice);
        vm.expectRevert("Only owner can call this function");
        registry.removeCaller(alice);
    }

    function test_RemoveNonExistentCaller() public {
        // Should not revert when removing non-existent caller
        registry.removeCaller(alice);
        assertFalse(registry.isCaller(alice));
    }

    function test_RemoveOwnerAsCaller() public {
        assertTrue(registry.isCaller(owner));
        registry.removeCaller(owner);
        assertFalse(registry.isCaller(owner));
    }

    // Snap registration tests
    function test_RegisterSnap() public {
        vm.expectEmit(true, true, true, false);
        emit Snap(alice, testSignature, testHash);
        
        registry.registerSnap(alice, testSignature, testHash);
    }

    function test_RegisterSnapWithAddedCaller() public {
        registry.addCaller(alice);
        
        vm.prank(alice);
        vm.expectEmit(true, true, true, false);
        emit Snap(bob, testSignature, testHash);
        
        registry.registerSnap(bob, testSignature, testHash);
    }

    function test_RegisterSnapRevertNonCaller() public {
        vm.prank(alice);
        vm.expectRevert("Only callers can call this function");
        registry.registerSnap(bob, testSignature, testHash);
    }

    function test_RegisterSnapEmptyData() public {
        bytes memory emptySignature = "";
        bytes memory emptyHash = "";
        
        vm.expectEmit(true, true, true, false);
        emit Snap(alice, emptySignature, emptyHash);
        
        registry.registerSnap(alice, emptySignature, emptyHash);
    }

    function test_RegisterMultipleSnaps() public {
        vm.expectEmit(true, true, true, false);
        emit Snap(alice, testSignature, testHash);
        registry.registerSnap(alice, testSignature, testHash);
        
        vm.expectEmit(true, true, true, false);
        emit Snap(bob, testSignature2, testHash2);
        registry.registerSnap(bob, testSignature2, testHash2);
    }

    // Access control integration tests
    function test_OwnershipTransferFlow() public {
        // Initial state
        assertEq(registry.owner(), owner);
        assertTrue(registry.isCaller(owner));
        
        // Transfer ownership
        registry.setOwner(alice);
        assertEq(registry.owner(), alice);
        
        // Old owner can't add callers anymore
        vm.expectRevert("Only owner can call this function");
        registry.addCaller(bob);
        
        // New owner can add callers
        vm.prank(alice);
        registry.addCaller(bob);
        assertTrue(registry.isCaller(bob));
        
        // New owner can manage callers
        vm.prank(alice);
        registry.removeCaller(owner);
        assertFalse(registry.isCaller(owner));
    }

    function test_CallerLifecycle() public {
        // Add caller
        registry.addCaller(alice);
        assertTrue(registry.isCaller(alice));
        
        // Caller can register snaps
        vm.prank(alice);
        registry.registerSnap(bob, testSignature, testHash);
        
        // Remove caller
        registry.removeCaller(alice);
        assertFalse(registry.isCaller(alice));
        
        // Ex-caller can't register snaps
        vm.prank(alice);
        vm.expectRevert("Only callers can call this function");
        registry.registerSnap(bob, testSignature, testHash);
    }

    // Fuzz tests
    function testFuzz_AddAndRemoveCaller(address caller) public {
        vm.assume(caller != address(0));
        
        registry.addCaller(caller);
        assertTrue(registry.isCaller(caller));
        
        registry.removeCaller(caller);
        assertFalse(registry.isCaller(caller));
    }

    function testFuzz_RegisterSnap(address caller, bytes memory signature, bytes memory hash) public {
        vm.assume(caller != address(0));
        
        vm.expectEmit(true, true, true, false);
        emit Snap(caller, signature, hash);
        
        registry.registerSnap(caller, signature, hash);
    }

    function testFuzz_SetOwner(address newOwner) public {
        vm.assume(newOwner != address(0));
        
        registry.setOwner(newOwner);
        assertEq(registry.owner(), newOwner);
    }

    // Gas optimization tests
    function test_IsCallerGasOptimization() public {
        // Test that isCaller is more gas efficient than accessing mapping directly
        registry.addCaller(alice);
        
        uint256 gasBefore = gasleft();
        bool result1 = registry.isCaller(alice);
        uint256 gasAfter1 = gasleft();
        
        uint256 gasBefore2 = gasleft();
        bool result2 = registry.callers(alice);
        uint256 gasAfter2 = gasleft();
        
        assertEq(result1, result2);
        assertTrue(result1);
        
        // Both should use similar gas (function call overhead vs direct mapping access)
        uint256 functionGas = gasBefore - gasAfter1;
        uint256 directGas = gasBefore2 - gasAfter2;
        
        // Function call should not be significantly more expensive
        assertTrue(functionGas <= directGas + 500); // Allow some overhead for function call
    }
}
