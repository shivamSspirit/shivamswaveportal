// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed; // using this private state variable to generate random number
    event NewWave(address indexed from, uint256 timestamp, string message); // the event for new wave
    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }
    Wave[] waves; // for holding all waves

    mapping(address => uint256) public lastWavedAt; // storing the address when user last time waved us

    constructor() payable {
        console.log("I AM SMART CONTRACT. POG.");
        seed = (block.timestamp + block.difficulty) % 100; // setting the intial seed
    }

    // for wave with a message
    function wave(string memory _message) public {
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30s"
        );
        lastWavedAt[msg.sender] = block.timestamp;
        totalWaves += 1;
        console.log("%s has waved!", msg.sender);
        waves.push(Wave(msg.sender, _message, block.timestamp));
        seed = (block.difficulty + block.timestamp + seed) % 100; // Generate a new seed for the next user that sends a wave
        console.log("Random # generated: %d", seed);
        /*
         * Give a 50% chance that the user wins the prize.
         */
        if (seed <= 50) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }
        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getAllWaves() public view returns (Wave[] memory) {
        // for getting all waves
        return waves;
    }

  

    function getTotalWaves() public view returns (uint256) {
        // for getting total waves count
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }
}
