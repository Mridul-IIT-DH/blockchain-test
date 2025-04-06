module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",  // Localhost (default: none)
      port: 8545,         // Ganache default port
      network_id: "*",    // Match any network id
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0",  // Specify the Solidity version
    },
  },
};
