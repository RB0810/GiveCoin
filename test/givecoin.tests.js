const { assert } = require('chai');
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545'); 

const GiveCoin = artifacts.require("GiveCoin");
const Escrow = artifacts.require("Escrow");
const Campaign = artifacts.require("Campaign");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("GiveCoin and Escrow", ([owner, customer, donor]) => {
  let givecoin, escrow, campaign;

  function tokens(number) {
    return web3.utils.toWei(number, "ether");
  }

  before(async () => {
    givecoin = await GiveCoin.new();
    escrow = await Escrow.new(givecoin.address);

    await givecoin.transfer(donor, tokens("300"), { from: owner });
    await escrow.createCampaign("Campaign 1", "Description of campaign", tokens("1000"), { from: customer });

    const campaignAddress = await escrow.campaigns(0);
    campaign = await Campaign.at(campaignAddress);
  });

  describe("GiveCoin Contract", () => {
    it("should correctly deploy with initial values", async () => {
      const name = await givecoin.name();
      assert.equal(name, "GiveCoin");

      const symbol = await givecoin.symbol();
      assert.equal(symbol, "GC");

      const totalSupply = await givecoin.totalSupply();
      assert.equal(totalSupply.toString(), tokens("1000000000"));
    });

    it("should handle token transfers correctly", async () => {
      const tx = await givecoin.transfer(customer, tokens("50"), { from: donor });
      assert.isNotNull(tx.receipt.status, "Transaction failed");

      const donorBalance = await givecoin.balanceOf(donor);
      const customerBalance = await givecoin.balanceOf(customer);

      assert.equal(donorBalance.toString(), tokens("250"));
      assert.equal(customerBalance.toString(), tokens("50"));
    });

    it("should prevent transfers exceeding balance", async () => {
      await givecoin.transfer(customer, tokens("500"), { from: donor }).should.be.rejected;
    });

    it("should correctly manage allowances", async () => {
      await givecoin.approve(escrow.address, tokens("100"), { from: donor });
      const allowance = await givecoin.allowance(donor, escrow.address);
      assert.equal(allowance.toString(), tokens("100"));
    });
  });

  describe("Escrow Contract", () => {
    it("should create campaigns with correct details", async () => {
      const name = await campaign.name();
      const description = await campaign.description();
      const amountNeeded = await campaign.totalAmountNeeded();
      const campaignOwner = await campaign.owner();

      assert.equal(name, "Campaign 1");
      assert.equal(description, "Description of campaign");
      assert.equal(amountNeeded.toString(), tokens("1000"));
      assert.equal(campaignOwner, customer);
    });

    it("should prevent donations exceeding campaign requirements", async () => {
      await givecoin.approve(escrow.address, tokens("1200"), { from: donor });
      await escrow.donateCoin(tokens("1200"), campaign.address, { from: donor }).should.be.rejected;
    });

    it("should handle donations and milestones correctly", async () => {
      await givecoin.approve(escrow.address, tokens("200"), { from: donor });
      await escrow.donateCoin(tokens("200"), campaign.address, { from: donor });

      const donatedAmount = await campaign.getDonatedAmount({ from: donor });
      assert.equal(donatedAmount.toString(), tokens("200"));

      const totalReceived = await campaign.totalAmountReceived();
      assert.equal(totalReceived.toString(), tokens("200"));
    });
  });
});