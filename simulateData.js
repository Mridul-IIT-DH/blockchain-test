const Web3 = require("web3").default;
const path = require("path");

// Connect to Ganache local blockchain
const web3 = new Web3("http://127.0.0.1:8545");

// Read compiled contract JSON (adjust the path as needed)
const contractJson = require(path.join(__dirname, "build", "contracts", "AirQualityData.json"));

// Create contract instance
const contractABI = contractJson.abi;
const contractAddress = contractJson.networks["1743957503920"].address; // Use the correct network ID

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