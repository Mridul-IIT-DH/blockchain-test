// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AirQualityData {
    struct Reading {
        uint256 timestamp;
        uint256 co2;
        uint256 no2;
        uint256 pm25;
        uint256 pm10;
    }

    Reading[] public readings;
    address public owner;

    event NewReading(uint256 timestamp, uint256 co2, uint256 no2, uint256 pm25, uint256 pm10);

    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict function access
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Function to add a new reading (simulated IoT sensor data)
    function addReading(uint256 _co2, uint256 _no2, uint256 _pm25, uint256 _pm10) public onlyOwner {
        uint256 currentTime = block.timestamp;
        readings.push(Reading(currentTime, _co2, _no2, _pm25, _pm10));
        emit NewReading(currentTime, _co2, _no2, _pm25, _pm10);
    }

    // Function to get total number of readings
    function getReadingCount() public view returns (uint256) {
        return readings.length;
    }
}
