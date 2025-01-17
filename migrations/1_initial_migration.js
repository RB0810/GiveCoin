const Migrations = artifacts.require("Migrations");

module.exports = async function(deployer) {
  try {
    console.log("Starting deployment...");
    await deployer.deploy(Migrations);
    console.log("Deployment successful.");
  } catch (error) {
    console.error("Deployment failed:", error);
  }
};
