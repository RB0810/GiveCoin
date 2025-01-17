const GiveCoin = artifacts.require("GiveCoin");
const Escrow = artifacts.require("Escrow");
const Campaign = artifacts.require("Campaign");

module.exports = async function (deployer, network, accounts) {
  // Deploy GiveCoin contract
  await deployer.deploy(GiveCoin);
  const givecoin = await GiveCoin.deployed();

  // Deploy CampaignManager contract with the address of GiveCoin
  await deployer.deploy(Escrow, givecoin.address);
  const escrow = await Escrow.deployed();

  // await deployer.deploy(Campaign, givecoin.address);
  // const campaign = await Campaign.deployed();

  await givecoin.transfer(escrow.address, "1000000000000000000000000"); // 1 million

  await givecoin.transfer(accounts[1], "200000000000000000000"); // 200 coins

  await givecoin.transfer(accounts[2], "500000000000000000000"); // 500 coins

  await givecoin.transfer(accounts[3], "1000000000000000000000"); // 1000 coins

  await givecoin.transfer(accounts[4], "1000000000000000000000"); // 1000 coins

  await escrow.createCampaign("Homeless Fund", "I need money to help the homeless", "1000000000000000000000", { from: accounts[2] }); // 1000

  await escrow.createCampaign("College Fund", "I need money to help in college", "500000000000000000000", { from: accounts[1] }); // 500

  const campaignAddress2 = await escrow.campaigns(1);

  campaign2 = await Campaign.at(campaignAddress2)

  await campaign2.setMilestone("150000000000000000000", {from: accounts[1]})

  await campaign2.setMilestone("300000000000000000000", {from: accounts[1]})

  await campaign2.setMilestone("400000000000000000000", {from: accounts[1]})

  const campaignAddress1 = await escrow.campaigns(0);

  campaign1 = await Campaign.at(campaignAddress1)

  await givecoin.approve(escrow.address, "10000000000000000000", { from: accounts[1] });

  await escrow.donateCoin("10000000000000000000",campaign1.address, {from: accounts[1]})

  await givecoin.approve(escrow.address, "200000000000000000000", { from: accounts[2] });

  await escrow.donateCoin("200000000000000000000",campaign2.address, {from: accounts[2]})
};
