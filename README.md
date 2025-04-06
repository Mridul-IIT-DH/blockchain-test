# Decentralized Air Quality Monitoring System - Project IDX Simulation Documentation

## 1. Introduction

This document provides a comprehensive guide to building a simulated Decentralized Air Quality Monitoring and Data Sharing System within Google's Project IDX. It covers setting up the development environment, addressing emulator issues, deploying a smart contract, simulating IoT data submission, and creating a web dashboard for data visualization.

**Important Note:** Due to issues with Project IDX's built-in emulator functionality, this guide includes a workaround using locally installed Ganache. Users are strongly encouraged to report the emulator problem to the Project IDX feedback channels.

## 2. Project Goals

-   Establish a working development environment in Project IDX.
-   Develop, compile, and deploy a Solidity smart contract (`AirQualityData.sol`) to a simulated Ethereum blockchain (using locally installed Ganache).
-   Simulate IoT sensor data submission to the deployed smart contract.
-   Build a dynamic web dashboard, using Express.js and Web3.js, to visualize the blockchain-stored sensor data.
-   Implement testing and verification procedures to ensure the system's functionality and data integrity.
-   Address emulator issues and implement a workaround using locally installed Ganache.

## 3. Step-by-Step Implementation

### 3.1. Setting Up the Project IDX Workspace

1.  **Create a New Project:**
    -   Open Project IDX in your preferred web browser.
    -   Initiate a new project. Select either a "Blank" template or a "Node.js" template.
2.  **Access the Integrated Terminal:**
    -   Locate and open the integrated terminal within the IDX workspace.
3.  **Install Essential Dependencies:**
    -   Execute the following commands in the terminal:
        ```bash
        npm install -g truffle
        npm install web3 express
        npm install -g ganache
        ```
4.  **Verify Dependency Installations:**
    -   Confirm successful installations by running:
        ```bash
        truffle version
        node -v
        npm -v
        ganache --version
        ```

### 3.2. Creating and Deploying the Smart Contract (with Ganache Workaround)

1.  **Initialize a Truffle Project:**
    -   Navigate to the project root directory in the terminal and execute:
        ```bash
        truffle init
        ```
2.  **Create `AirQualityData.sol`:**
    -   Navigate to the `contracts` directory and create a new file named `AirQualityData.sol`.
    -   Paste the smart contract code into the file.
```sol
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
```
3.  **Compile the Smart Contract:**
    -   In the terminal, run:
        ```bash
            truffle compile
        ```
4.  **Create `2_deploy_contracts.js`:**
    -   Navigate to the `migrations` directory and create a file named `2_deploy_contracts.js`.
    -   Paste the deployment script into the file.
5.  **Modify `package.json` Scripts:**
    -   Open the `package.json` file in the project root and add the `scripts` section:
        ```json
        {
          "dependencies": {
            "express": "^5.1.0",
            "web3": "^4.16.0"
          },
          "scripts": {
            "migrate": "truffle migrate",
            "start": "node server.js"
          }
        }
        ```
6.  **Start Ganache:**
    -   In a *new* terminal window within IDX, run:
        ```bash
        ganache
        ```
    -   This starts a local Ganache instance, which will be used for deployment.
7.  **Deploy the Smart Contract:**
    -   In the *original* terminal, run:
        ```bash
        npm run migrate
        ```
    -   **Copy the deployed contract address and ABI from `build/contracts/AirQualityData.json`.**

### 3.3. Simulating IoT Data Submission

1.  **Create `simulateData.js`:**
    -   Create a new file named `simulateData.js` in the project root.
    -   Paste the following simulation script into the file:
        ```javascript
        const Web3 = require("web3").default;
        const path = require("path");

        // Connect to Ganache local blockchain
        const web3 = new Web3("http://127.0.0.1:7545");

        // Read compiled contract JSON (adjust the path as needed)
        const contractJson = require(path.join(__dirname, "build", "contracts", "AirQualityData.json"));

        // Create contract instance
        const contractABI = contractJson.abi;
        const contractAddress = contractJson.networks["5777"].address; // Use the correct network ID

        const airQualityContract = new web3.eth.Contract(contractABI, contractAddress);

        // Get the first account from Ganache
        async function getOwnerAddress() {
            const accounts = await web3.eth.getAccounts();
            return accounts[0];
        }

        async function simulateSensorData() {
            try {
                const ownerAddress = await getOwnerAddress();

                // Simulate sensor data
                const co2 = Math.floor(Math.random() * 1000);
                const no2 = Math.floor(Math.random() * 500);
                const pm25 = Math.floor(Math.random() * 300);
                const pm10 = Math.floor(Math.random() * 300);

                console.log(`Submitting data: CO2=${co2}, NO2=${no2}, PM2.5=${pm25}, PM10=${pm10}`);

                await airQualityContract.methods.addReading(co2, no2, pm25, pm10).send({ from: ownerAddress, gas: '1000000' });
                console.log("Data submitted to blockchain.");
            } catch (error) {
                console.error("Error submitting data:", error);
            }
        }

        // Run simulation every 10 seconds
        setInterval(simulateSensorData, 10000);
        ```
2.  **Run the Simulation Script:**
    -   In the terminal, execute:
        ```bash
        node simulateData.js
        ```

### 3.4. Building the Web Dashboard

1.  **Create `server.js`:**
    -   Create a file named `server.js` in the project root.
    -   Paste the Express.js server code into the file.
2.  **Create `public` Folder:**
    -   Create a directory named `public` in the project root to serve static files.
3.  **Create Front-End Files:**
    -   In the `public` folder, create `index.html`, `styles.css`, and `app.js` with the front-end code.
    -   **Replace `"YOUR_CONTRACT_ADDRESS"` in `app.js` with the deployed contract address.**
    -   **Paste the ABI from `build/contracts/AirQualityData.json` into the `contractABI` array in `app.js`.**
4.  **Run the Web Server:**
    -   In the terminal, run:
        ```bash
        npm run start
        ```
    -   Click the preview URL to open the web dashboard in your browser.

### 3.5. Testing and Verification

1.  **Verify Simulation:**
    -   Monitor the terminal output of `simulateData.js` to ensure data submission.
    -   Check the Ganache terminal for transactions.
2.  **Check the Dashboard:**
    -   Ensure the dashboard displays the simulated sensor data.
    -   Verify that the data displayed matches the data stored on the blockchain.

### 3.6. Troubleshooting

1.  **"CONNECTION ERROR: Couldn't connect to node [http://127.0.0.1:7545](http://127.0.0.1:7545)" (Original IDX Emulator Issue):**
    -   This error occurred because the built-in IDX emulators were not accessible.
    -   **Workaround:** Install and run Ganache locally.
2.  **No Migration Selection in Run and Debug:**
    -   Project IDX's Run and Debug panel does not directly offer "migration" or similar script selection for Truffle.
    -   **Solution:** Use the terminal to run `npm run migrate`.
3.  **Web dashboard not displaying data:**
    -   Ensure that the contract address and ABI are correctly copied into the app.js file.
    -   Verify that the `simulateData.js` file is running.
    -   Check the browsers developer console for javascript errors.
4.  **Truffle commands failing:**
    -   Ensure that truffle is installed globally.
    -   Verify that the truffle project is initialized correctly.
    -   Ensure that the solidity contract has compiled without errors.

## 4. Conclusion

This guide provides a comprehensive approach to simulating a decentralized air quality monitoring system in Project IDX. Due to issues with the built-in IDX emulators, a workaround using locally installed Ganache is implemented. Users are strongly encouraged to report the emulator problems to the Project IDX feedback channels.