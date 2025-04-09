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
        const contractAddress = contractJson.networks["<YOUR_NETOWRK_ID>"].address; 

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
    const Web3 = require("web3").default; // Import Web3
    const fs = require('fs'); // To read the contract JSON

    const app = express();
    const PORT = process.env.PORT || 3000;

    // --- Web3 and Contract Setup START ---
    let web3;
    let airQualityContract;
    let contractAddress;
    let contractABI;

    async function initWeb3() {
        try {
            web3 = new Web3("http://127.0.0.1:8545"); // Connect to Ganache inside the workspace

            // Read compiled contract JSON dynamically
            const contractJsonPath = path.join(__dirname, "build", "contracts", "AirQualityData.json");
            const contractJsonContent = fs.readFileSync(contractJsonPath, 'utf8');
            const contractJson = JSON.parse(contractJsonContent);

            contractABI = contractJson.abi;

            // Get the network ID Ganache is running on
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = contractJson.networks[networkId.toString()]; // Use toString() for safety

            if (!deployedNetwork) {
                console.error(`Contract not deployed on network ID ${networkId}. Make sure Ganache is running and you have migrated.`);
                return; // Stop initialization if contract not found on this network
            }

            contractAddress = deployedNetwork.address;
            console.log(`Contract Address: ${contractAddress} on Network ID: ${networkId}`);

            airQualityContract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Web3 and contract initialized successfully.");

        } catch (error) {
            console.error("Failed to initialize Web3 or contract:", error);
        }
    }

    initWeb3(); // Initialize on server start
    // --- Web3 and Contract Setup END ---

    // Serve static files from the "public/dist" directory (Parcel output)
    app.use(express.static(path.join(__dirname, "public", "dist")));

    // --- API Endpoint START ---
    app.get("/api/data", async (req, res) => {
        if (!airQualityContract) {
            // Attempt to re-initialize if failed before
            await initWeb3();
            if (!airQualityContract) {
                return res.status(500).json({ error: "Contract not initialized. Check server logs." });
            }
        }
        try {
            // readingCount will be a BigInt
            const readingCount = await airQualityContract.methods.getReadingCount().call();
            // console.log("Reading Count:", readingCount, typeof readingCount); // Debug log

            if (readingCount > 0n) {
                const latestReadingIndex = readingCount - 1n;
                // console.log("Fetching index:", latestReadingIndex); // Debug log

                // latestReading will contain BigInts
                const latestReading = await airQualityContract.methods.getReading(latestReadingIndex).call();
                // console.log("Latest Reading Raw:", latestReading); // Debug log
                res.json({
                    timestamp: latestReading[0].toString(),
                    co2: latestReading[1].toString(),
                    no2: latestReading[2].toString(),
                    pm25: latestReading[3].toString(),
                    pm10: latestReading[4].toString(),
                });
            } else {
                res.json({ message: "No readings available yet." });
            }
        } catch (error) {
            console.error("Error fetching data from contract:", error);
            res.status(500).json({ error: "Failed to fetch data from blockchain." });
        }
    });
    // --- API Endpoint END ---

    // Serve the main HTML file for any other GET request (helps with SPA routing if needed)
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Access the dashboard at: https://<span class="math-inline">\{PORT\}\-</span>{process.env.GOOGLE_CLOUD_WORKSTATIONS_CLUSTER_ID || 'your-idx-preview-url'}`); // Helper log
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
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    </head>
    <body>

        <div class="molecule-container">
            <div class="molecule co2">CO₂</div>
            <div class="molecule no2">NO₂</div>
            <div class="molecule pm25">PM₂.₅</div>
            <div class="molecule pm10">PM₁₀</div>
            <div class="molecule co2" style="top: 70%; left: 80%; animation-delay: 2s;">CO₂</div>
            <div class="molecule no2" style="top: 15%; left: 65%; animation-delay: 4s;">NO₂</div>
            <div class="molecule pm25" style="top: 85%; left: 10%; animation-delay: 1s;">PM₂.₅</div>
            <div class="molecule pm10" style="top: 5%; left: 20%; animation-delay: 3s;">PM₁₀</div>
        </div>

        <div class="dashboard-container">
            <h1>Air Quality Dashboard</h1>
            <div id="data-cards">
                <div class="data-card">
                    <h2>CO₂</h2>
                    <p><span id="co2">Loading...</span> ppm</p>
                </div>
                <div class="data-card">
                    <h2>NO₂</h2>
                    <p><span id="no2">Loading...</span> µg/m³</p>
                </div>
                <div class="data-card">
                    <h2>PM₂.₅</h2>
                    <p><span id="pm25">Loading...</span> µg/m³</p>
                </div>
                <div class="data-card">
                    <h2>PM₁₀</h2>
                    <p><span id="pm10">Loading...</span> µg/m³</p>
                </div>
            </div>
        </div>

        <script type="module" src="app.js"></script>
    </body>
    </html>
    ```
    **CSS code**
    ```css
    /* General Styles & Theme */
    body {
        font-family: 'Poppins', sans-serif; /* Using Google Font */
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%); /* Light blue gradient background */
        color: #333;
        min-height: 100vh; /* Ensure body takes full height */
        overflow: hidden; /* Hide overflow to prevent scrollbars from molecule animation */
        position: relative; /* Needed for absolute positioning of molecules */
    }

    h1 {
        text-align: center;
        color: #004d40; /* Dark teal color */
        margin-top: 40px;
        margin-bottom: 30px;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    .dashboard-container {
        position: relative; /* Ensure cards stay above molecules */
        z-index: 1;
        padding: 20px;
    }

    /* Data Card Grid Layout */
    #data-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Responsive grid */
        gap: 25px; /* Spacing between cards */
        max-width: 1000px; /* Max width of the card container */
        margin: 20px auto; /* Center the container */
        padding: 0 20px; /* Padding on the sides */
    }

    /* Glass/Ice Card Styling */
    .data-card {
        background: rgba(255, 255, 255, 0.25); /* Semi-transparent white background */
        backdrop-filter: blur(10px); /* Frosted glass effect */
        -webkit-backdrop-filter: blur(10px); /* Safari support */
        border-radius: 15px; /* Rounded corners */
        border: 1px solid rgba(255, 255, 255, 0.35); /* Subtle border */
        padding: 25px;
        text-align: center;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15); /* Soft shadow */
        transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth hover effect */
    }

    .data-card:hover {
        transform: translateY(-5px); /* Slight lift on hover */
        box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.2);
    }

    .data-card h2 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #00695c; /* Slightly darker teal for headings */
        font-size: 1.3em;
        font-weight: 600;
    }

    .data-card p {
        font-size: 1.1em;
        margin-bottom: 0;
        color: #004d40; /* Dark teal text */
        font-weight: 400;
    }

    .data-card span {
        font-size: 1.8em; /* Larger font for the value */
        font-weight: 600;
        display: block; /* Make span take full width */
        margin-bottom: 5px;
        color: #00796b; /* Main teal color */
    }


    /* Floating Molecules */
    .molecule-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0; /* Behind the main content */
        pointer-events: none; /* Allow clicks to pass through */
    }

    .molecule {
        position: absolute;
        border-radius: 50%; /* Make them circular initially */
        color: rgba(0, 77, 64, 0.5); /* Semi-transparent dark teal */
        font-weight: bold;
        font-size: 1.5em; /* Adjust size as needed */
        width: 60px; /* Size of the molecule */
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.6; /* Make them slightly faded */
        animation: float 15s infinite linear; /* Base animation */
    }

    /* Unique starting positions and delays (examples) */
    .molecule.co2 { top: 20%; left: 10%; animation-duration: 18s; }
    .molecule.no2 { top: 40%; left: 85%; animation-duration: 14s; font-size: 1.6em; width: 65px; height: 65px; }
    .molecule.pm25 { top: 60%; left: 30%; animation-duration: 20s; font-size: 1.2em; width: 50px; height: 50px;}
    .molecule.pm10 { top: 80%; left: 70%; animation-duration: 16s; font-size: 1.8em; width: 70px; height: 70px;}

    /* Add variations for the extra molecules */
    /* (Example: Use inline styles in HTML or add more specific CSS rules) */

    /* Floating Animation */
    @keyframes float {
        0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        25% { transform: translateY(-20px) translateX(15px) rotate(15deg); }
        50% { transform: translateY(10px) translateX(-10px) rotate(-5deg); }
        75% { transform: translateY(-15px) translateX(-15px) rotate(10deg); }
        100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    }

    /* Optional: Simple media query for smaller screens */
    @media (max-width: 768px) {
        #data-cards {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
        }
        h1 {
            font-size: 1.8em;
        }
        .data-card {
            padding: 20px;
        }
        .molecule {
            font-size: 1.2em;
            width: 50px;
            height: 50px;
        }
    }
    @media (max-width: 480px) {
        #data-cards {
            grid-template-columns: 1fr; /* Stack cards vertically */
            gap: 15px;
        }
        .molecule {
            opacity: 0.3; /* Reduce molecule visibility on small screens */
        }
    }
    ```

    **JS code**
    ```js
    async function fetchData() {
        try {
            // Fetch data from your backend API endpoint
            const response = await fetch('/api/data'); // Request to your Express server

            if (!response.ok) {
                // Handle HTTP errors (like 500 Internal Server Error from the backend)
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check if data or a message was received
            if (data.message) {
                console.log(data.message);
                document.getElementById("co2").textContent = 'N/A';
                document.getElementById("no2").textContent = 'N/A';
                document.getElementById("pm25").textContent = 'N/A';
                document.getElementById("pm10").textContent = 'N/A';
            } else if (data.co2 !== undefined) { // Check if actual data fields exist
                // Update the HTML elements with data received from the backend
                document.getElementById("co2").textContent = data.co2;
                document.getElementById("no2").textContent = data.no2;
                document.getElementById("pm25").textContent = data.pm25;
                document.getElementById("pm10").textContent = data.pm10;
            } else {
                console.warn("Received unexpected data format:", data);
            }

        } catch (error) {
            console.error("Error fetching data from backend API:", error);
            // Display error to the user
            document.getElementById("co2").textContent = 'Error';
            document.getElementById("no2").textContent = 'Error';
            document.getElementById("pm25").textContent = 'Error';
            document.getElementById("pm10").textContent = 'Error';
        }
    }

    // Fetch data immediately and then every 5 seconds
    fetchData();
    setInterval(fetchData, 5000); // Increased interval slightly
    ```
4. **Building the website:**
    - Build the website using `npm run dev`.
5.  **Run the Parcel:**
    -   In the new terminal you can run Parcel to bundle your front-end code before starting the Express server by the following command:
        ```bash
        npm run dev
        ```
6.  **Run the Web Server:**
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