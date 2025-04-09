# Decentralized Air Quality Monitoring System - Project IDX Simulation Documentation

## 1. Introduction

This document provides a comprehensive guide to building a simulated Decentralized Air Quality Monitoring and Data Sharing System within Google's Project IDX. It covers setting up the development environment, deploying a smart contract, simulating IoT data submission, and creating a web dashboard for data visualization.

## 2. Project Goals

-   Establish a working development environment in Project IDX.
-   Develop, compile, and deploy a Solidity smart contract (`AirQualityData.sol`) to a simulated Ethereum blockchain.
-   Simulate IoT sensor data submission to the deployed smart contract.
-   Build a dynamic web dashboard, using Express.js and Web3.js, to visualize the blockchain-stored sensor data.
-   Implement testing and verification procedures to ensure the system's functionality and data integrity.

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
        npm install -D parcel
        ```
        -g: means global install.  
4.  **Verify Dependency Installations:**
    -   Confirm successful installations by running:
        ```bash
        truffle version
        node -v
        npm -v
        ganache --version
        ```

### 3.2. Creating and Deploying the Smart Contract (with Ganache Workaround)

1. **Modify the `truffle-config.js`:**
    ```js
    module.exports = {
        networks: {
            development: {
                host: "127.0.0.1",
                port: 8545,
                network_id: "*",
            },
        },
        compilers: {
            solc: {
                version: "^0.8.0",
            },
        },
    };
    ```
2. **Initialize a Truffle Project:**
    -   Navigate to the project root directory in the terminal and execute:
        ```bash
        truffle init
        ```
2.  **Create `AirQualityData.sol`:**
    -   Navigate to the `contracts` directory and create a new file named `AirQualityData.sol`.
    -   Paste the following smart contract code into the file:
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
        
        // Function to get the latest reading by accessing the last element of the readings array
        function getReading(uint index) public view returns (uint, uint, uint, uint, uint) {
            Reading memory r = readings[index];
            return (r.timestamp, r.co2, r.no2, r.pm25, r.pm10);
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
    -   Paste the following deployment script into the file:
    ```js
    const AirQualityData = artifacts.require("AirQualityData");

    module.exports = function(deployer) {
        deployer.deploy(AirQualityData);
    };
    ```
5.  **Modify `package.json` Scripts:**
    -   Open the `package.json` file in the project root and add the `scripts` section:
        ```json
        {
            "dependencies": {
                "express": "^4.21.2",
                "web3": "^4.16.0"
            },
            "devDependencies": {
                "parcel": "^2.14.4"
            },
            "scripts": {
                "migrate": "npx truffle migrate",
                "start": "node server.js",
                "build": "parcel build public/index.html --dist-dir public/dist",
                "dev": "parcel public/index.html --dist-dir public/dist"
            }
            }
        ```
6.  **Start Ganache:**
    -   In a new terminal you can run `ganache emulator` by the following command:
        ```bash
        ganache
        ```
    -   This starts a local Ganache instance, which will be used for deployment.
7.  **Deploy the Smart Contract:**
    -   In the original terminal you can deploy the smart contract by the following command:
        ```bash
        npm run migrate
        ```
        - The command npm run migrate deploys the smart contract to the Ganache instance, which is a local blockchain.

### 3.3. Simulating IoT Data Submission

1.  **Create `simulateData.js`:**
    -   Create a new file named `simulateData.js` in the project root.
    -   Paste the following simulation script into the file:
        ```javascript
        const Web3 = require("web3").default;
        const path = require("path");

        // Connect to Ganache local blockchain
        const web3 = new Web3("http://127.0.0.1:8545");

        // Read compiled contract JSON (adjust the path as needed)
        const contractJson = require(path.join(__dirname, "build", "contracts", "AirQualityData.json"));

        // Create contract instance
        const contractABI = contractJson.abi;
        // Use the correct network ID
        const contractAddress = contractJson.networks["<YOUR_NETWORK_ID>"].address;

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
        - Replace `<YOUR_NETWORK_ID>` with the correct network ID. You will find this in the terminal where you ran the command `npm run migrate`. The Network ID get generated after running the command `npm run migrate`.
        - After every run a new network id will get added to `AirQualityData.json` present at `/home/user/test/build/contracts/AirQualityData.json`, which cannot be used later, so you can delete it time to time to keep the file clean.
2.  **Run the Simulation Script:**
    -   In the terminal you can run `simulateData.js` by the following command:
        ```bash
        node simulateData.js
        ```

### 3.4. Building the Web Dashboard

1.  **Create `server.js`:**
    -   Create a file named `server.js` in the project root.
    -   Paste the following Express.js server code into the file:
    ```js
    const express = require("express");
    const path = require("path");
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Serve static files from the "public/dist" directory (Parcel output)
    app.use(express.static(path.join(__dirname, "public", "dist"))); // Changed this line

    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "dist", "index.html")); // And this line
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    ```
2.  **Create `public` Folder:**
    -   Create a directory named `public` in the project root to serve static files.
3.  **Create Front-End Files:**
    -   In the `public` folder, create `index.html`, `styles.css`, and `app.js` with the front-end code.

    **HTML code**
    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <title>Air Quality Dashboard</title>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        <h1>Air Quality Data</h1>
        <div id="data">
            <p>CO2: <span id="co2"></span></p>
            <p>NO2: <span id="no2"></span></p>
            <p>PM2.5: <span id="pm25"></span></p>
            <p>PM10: <span id="pm10"></span></p>
        </div>
        <script type="module" src="app.js"></script>
    </body>
    </html>
    ```
    **CSS code**
    ```css
    body {
        font-family: sans-serif;
        text-align: center;
        margin: 50px;
    }

    #data {
        margin-top: 20px;
        font-size: 1.2em;
    }
    ```

    **JS code**
    ```js
    import Web3 from "web3";

    const Web3 = require("web3").default;

    async function fetchData() {
        try {
            const web3 = new Web3("http://127.0.0.1:8545");
            const contractABI = [
                // Paste your CORRECT ABI here, which includes getLatestReading
                // Add any other functions from your contract
            ];
            const contractAddress = "<YOUR_CONTRACT_ADDRESS>";

            const airQualityContract = new web3.eth.Contract(contractABI, contractAddress);
            const readingCount = await airQualityContract.methods.getReadingCount().call();
            if (readingCount > 0) {
                const latestReading = await airQualityContract.methods.getReading(readingCount - 1).call();

                document.getElementById("co2").textContent = latestReading[1];
                document.getElementById("no2").textContent = latestReading[2];
                document.getElementById("pm25").textContent = latestReading[3];
                document.getElementById("pm10").textContent = latestReading[4];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // Fetch data every 5 seconds
    fetchData();
    setInterval(fetchData, 3000);
    ```
    -   **Replace `"YOUR_CONTRACT_ADDRESS"` in `app.js` with the deployed contract address.**
        - You will find this in the terminal where you ran the command `npm run migrate`. The contract ID get generated after running the command `npm run migrate`.
    -   **Paste the ABI from `build/contracts/AirQualityData.json` into the `contractABI` array in `app.js`.**
        - It will be present in "abi": [<ABI_IN_JSON_FORMATE>].
    - **Important:** After deploying your smart contract with npm run migrate, you must update the contractAddress in public/app.js with the new address provided in the terminal output. Also, replace the existing ABI in app.js with the entire ABI from build/contracts/AirQualityData.json, making sure the ABI includes the getReading function.
    - Build the website using `npm run dev`.
4.  **Run the Parcel:**
    -   In the new terminal you can run Parcel to bundle your front-end code before starting the Express server by the following command:
        ```bash
        npm run dev
        ```
5.  **Run the Web Server:**
    -   In the new terminal you can start the `server` by the following command:
        ```bash
        npm run start
        ```
    - Go to the address `https://3000-idx-test-1743944668049.cluster-a3grjzek65cxex762e4mwrzl46.cloudworkstations.dev/` to see the webpage.

### 3.5. Testing and Verification

1.  **Verify Simulation:**
    -   Monitor the terminal output of `simulateData.js` to ensure data submission.
    -   Check the Ganache terminal for transactions.
2.  **Check the Dashboard:**
    -   Ensure the dashboard displays the simulated sensor data.
    -   Verify that the data displayed matches the data stored on the blockchain.

## 4. Conclusion

This guide provides a comprehensive approach to simulating a decentralized air quality monitoring system in Project IDX. Due to issues with the built-in IDX emulators, a workaround using locally installed Ganache is implemented. Users are strongly encouraged to report the emulator problems to the Project IDX feedback channels.