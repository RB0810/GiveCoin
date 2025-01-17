const Escrow = artifacts.require("Escrow");

module.exports = async function issueRewards() {
  let escrow = await Escrow.deployed();
  await escrow.issueCoin();

  console.log("GiveCoin has been issued successfully");
  process.exit(0);
};
