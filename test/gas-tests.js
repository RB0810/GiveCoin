const Campaign = artifacts.require("Campaign");
const Escrow = artifacts.require("Escrow");
const GiveCoin = artifacts.require("GiveCoin");

contract("GasUsage", (accounts) => {
    let giveCoinInstance, escrowInstance, campaignInstance;
    
    function tokens(number) {
        return web3.utils.toWei(number, "ether");
    }

    const owner = accounts[0];
    const donor1 = accounts[1];
    const donor2 = accounts[2];
    const initialAmount = tokens("50"); // Total amount needed for campaign
    const milestoneAmount = tokens("10"); // Milestone amount

    beforeEach(async () => {
        // Deploy contracts before each test
        // giveCoinInstance = await GiveCoin.new({ from: owner });
        // escrowInstance = await Escrow.new(giveCoinInstance.address, { from: owner });
        // campaignInstance = await Campaign.new(
        //     owner,
        //     "Test Campaign",
        //     "This is a test campaign.",
        //     initialAmount,
        //     giveCoinInstance.address,
        //     escrowInstance.address,
        //     { from: owner }
        // );
        giveCoinInstance = await GiveCoin.new();
        escrowInstance = await Escrow.new(giveCoinInstance.address);
        campaignInstance = await Campaign.new(owner, 'Test Campaign', 'This is a test campaign.', initialAmount, giveCoinInstance.address, escrowInstance.address);    
    });

    async function measureGasUsage(contractInstance, functionName, args = [], options = {}) {
        const method = contractInstance[functionName];
        if (!method) throw new Error(`Function ${functionName} not found in contract.`);
        
        // Estimate gas for the function call
        const tx = await method(...args, options);
        return tx.receipt.gasUsed;
    }

    it("Measures gas usage of all functions", async () => {
        const results = [];

        // Test GiveCoin contract
        results.push({
            contract: "GiveCoin",
            function: "transfer",
            gasUsed: await measureGasUsage(giveCoinInstance, "transfer", [donor1, tokens("100")], { from: owner }),
        });
        results.push({
            contract: "GiveCoin",
            function: "approve",
            gasUsed: await measureGasUsage(giveCoinInstance, "approve", [donor1, tokens("100")], { from: owner }),
        });
        
        await giveCoinInstance.approve(owner, tokens("50"), { from: donor1 });
        results.push({
            contract: "GiveCoin",
            function: "transferFrom",
            gasUsed: await measureGasUsage(giveCoinInstance, "transferFrom", [donor1, donor2, tokens("10")], { from: owner }),
        });

        // Test Escrow contract
        results.push({
            contract: "Escrow",
            function: "createCampaign",
            gasUsed: await measureGasUsage(escrowInstance, "createCampaign", ["Test Campaign", "Description", initialAmount], { from: owner }),
        });

        results.push({
            contract: "Escrow",
            function: "issueCoin",
            gasUsed: await measureGasUsage(escrowInstance, "issueCoin", [], { from: owner }), 
        });    

        await giveCoinInstance.approve(escrowInstance.address, tokens("10"), { from: donor1 });
        results.push({
            contract: "Escrow",
            function: "donateCoin",
            gasUsed: await measureGasUsage(escrowInstance, "donateCoin", [tokens("10"), campaignInstance.address], { from: donor1 }),
        });

        // Test Campaign contract
        results.push({
            contract: "Campaign",
            function: "setMilestone",
            gasUsed: await measureGasUsage(campaignInstance, "setMilestone", [milestoneAmount], { from: owner }),
        });

        results.push({
            contract: "Campaign",
            function: "donated",
            gasUsed: await measureGasUsage(campaignInstance, "donated", [donor1, tokens("10")], { from: owner }),
        });

        results.push({
            contract: "Campaign",
            function: "approveMilestone",
            gasUsed: await measureGasUsage(campaignInstance, "approveMilestone", ["Milestone reached and approved"], { from: owner }),
        }); 

        // Output results as a table
        console.table(results);
    });
});