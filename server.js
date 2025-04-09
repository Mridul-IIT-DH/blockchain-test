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