const Web3 = require("web3").default;

async function fetchData() {
    try {
        const web3 = new Web3("http://127.0.0.1:8545");
        const contractABI = [
            // Paste your CORRECT ABI here, which includes getLatestReading
            {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "co2",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "no2",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "pm25",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "pm10",
                        "type": "uint256"
                    }
                ],
                "name": "NewReading",
                "type": "event"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [
                    {
                        "internalType": "address",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "readings",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
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
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_co2",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_no2",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_pm25",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_pm10",
                        "type": "uint256"
                    }
                ],
                "name": "addReading",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getReadingCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "index",
                        "type": "uint256"
                    }
                ],
                "name": "getReading",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function",
                "constant": true
            }
        ];
        const contractAddress = "0x558cf67fBADE259abAB21DBd41424271C39d954d";

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