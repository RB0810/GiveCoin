const { assert } = require('chai');
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545'); 

const GiveCoin = artifacts.require('GiveCoin');
const Escrow = artifacts.require('Escrow');
const Campaign = artifacts.require('Campaign');

contract('Campaign Contract', (accounts) => {
  let giveCoinInstance, escrowInstance, campaignInstance;

  const owner = accounts[0];
  const donor1 = accounts[1];
  const donor2 = accounts[2];
  const initialAmount = web3.utils.toWei('10', 'ether'); // Total amount needed for campaign
  const milestoneAmount = web3.utils.toWei('5', 'ether'); // Milestone amount

  beforeEach(async () => {
    // Deploy contracts before each test
    giveCoinInstance = await GiveCoin.new();
    escrowInstance = await Escrow.new(giveCoinInstance.address);
    campaignInstance = await Campaign.new(owner, 'Test Campaign', 'This is a test campaign.', initialAmount, giveCoinInstance.address, escrowInstance.address);
  });

  it('should allow setting milestones', async () => {
    await campaignInstance.setMilestone(milestoneAmount, { from: owner });
    const milestone = await campaignInstance.milestones(0);

    assert.equal(milestone.amount.toString(), milestoneAmount.toString(), 'Milestone amount is incorrect');
    assert.equal(milestone.approved, false, 'Milestone should not be approved yet');
    assert.equal(milestone.transactionDescription, 'Not reached', 'Transaction description should be "Not reached"');
  });

  it('should allow approving milestones when the donation goal is reached', async () => {
    await campaignInstance.setMilestone(milestoneAmount, { from: owner });

    // Donating to reach milestone
    await campaignInstance.donated(donor1, milestoneAmount, { from: donor1 });

    const milestone = await campaignInstance.milestones(0);
    assert.equal(milestone.approved, false, 'Milestone should not be approved initially');

    // Approve the milestone
    await campaignInstance.approveMilestone('Milestone reached and approved', { from: owner });

    const updatedMilestone = await campaignInstance.milestones(0);
    assert.equal(updatedMilestone.approved, true, 'Milestone should be approved');
    assert.equal(updatedMilestone.transactionDescription, 'Milestone reached and approved', 'Transaction description is incorrect');
  });

  it('should handle multiple donations and milestone approvals correctly', async () => {
    await campaignInstance.setMilestone(milestoneAmount, { from: owner });

    // Donating to reach milestone
    await campaignInstance.donated(donor1, milestoneAmount, { from: donor1 });
    const totalReceivedBeforeApproval = await campaignInstance.getTotalAmountReceived();
    assert.equal(totalReceivedBeforeApproval.toString(), milestoneAmount.toString(), 'Donation amount is incorrect');

    // Approve milestone
    await campaignInstance.approveMilestone('Milestone reached and approved', { from: owner });
    const milestone = await campaignInstance.milestones(0);
    assert.equal(milestone.approved, true, 'Milestone should be approved');

    // Add another donor
    const additionalDonation = web3.utils.toWei('3', 'ether');
    await campaignInstance.donated(donor2, additionalDonation, { from: donor2 });
    const totalReceivedAfterDonation = await campaignInstance.getTotalAmountReceived();
    assert.equal(totalReceivedAfterDonation.toString(), web3.utils.toWei('8', 'ether').toString(), 'Total donation amount is incorrect');
  });

  it('should not approve a milestone if the donation goal is not met', async () => {
    await campaignInstance.setMilestone(milestoneAmount, { from: owner });

    // Donating an amount less than the milestone
    await campaignInstance.donated(donor1, web3.utils.toWei('2', 'ether'), { from: donor1 });

    try {
      await campaignInstance.approveMilestone('Milestone reached and approved', { from: owner });
      assert.fail('Expected error not received');
    } catch (error) {
      assert.include(error.message, 'Current Milestone has not been reached', 'Error message is incorrect');
    }
  });
});