const AirQualityData = artifacts.require("AirQualityData");

module.exports = function(deployer) {
    deployer.deploy(AirQualityData);
};
