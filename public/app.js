const Web3 = require("web3").default;

async function fetchData() {
    try {
        const web3 = new Web3("http://127.0.0.1:8545");
        const contractABI = [
            // Paste your CORRECT ABI here, which includes getLatestReading
            {
                "inputs": [],
                "name": "getLatestReading",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "co2",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "no2",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "pm25",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "pm10",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            // Add any other functions from your contract
        ];
        const contractAddress = "0xcdb655199cf533c18b1d78e2d36aba73f60b6309";

        const airQualityContract = new web3.eth.Contract(contractABI, contractAddress);
        const latestData = await airQualityContract.methods.getLatestReading().call();

        document.getElementById("co2").textContent = latestData.co2;
        document.getElementById("no2").textContent = latestData.no2;
        document.getElementById("pm25").textContent = latestData.pm25;
        document.getElementById("pm10").textContent = latestData.pm10;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Fetch data every 5 seconds
fetchData();
setInterval(fetchData, 3000);