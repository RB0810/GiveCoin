pragma solidity >=0.4.22 <0.9.0;

import "./Campaign.sol";
import "./GiveCoin.sol";

contract Escrow {
    Campaign[] public campaigns;
    GiveCoin public givecoin;
    address public owner;

    event CampaignCreated(
        address indexed creator,
        string name,
        uint256 amountNeeded
    );

    event DonationReceived(address donor, uint256 amount);
    event OverflowReturned(address donor, uint256 amount);
    event AwaitingApproval(Campaign campaign, uint8 milestone);

    constructor(GiveCoin _givecoin) public {
        givecoin = _givecoin;
        owner = msg.sender;
    }

    address[] public donators;

    // Donation info as mapping: donor => (campaign => donation amount)
    mapping(address => mapping(address => uint256)) public donationInfo;
    mapping(address => mapping(address => bool)) private donatedChecker;
    mapping(address => bool) public hasDonated;
    mapping(address => bool) public isDonating;

    function createCampaign(
        string memory name,
        string memory description,
        uint256 amountNeeded
    ) public {
        Campaign newCampaign = new Campaign(
            msg.sender,
            name,
            description,
            amountNeeded,
            givecoin,
            this
        );
        campaigns.push(newCampaign);

        emit CampaignCreated(msg.sender, name, amountNeeded);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }

    function getDonationInfo(
        address account,
        address campaign
    ) public view returns (uint256) {
        return donationInfo[account][campaign];
    }

    function getAllDonationsForAccount(
        address account
    ) public view returns (uint256[] memory, address[] memory) {
        uint256 length = campaigns.length;
        uint256[] memory donations = new uint256[](length);
        address[] memory campaignAddresses = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            Campaign campaign = campaigns[i];
            address campaignAddr = address(campaign);
            if (donatedChecker[account][campaignAddr]) {
                donations[i] = donationInfo[account][campaignAddr];
                campaignAddresses[i] = campaignAddr;
            }
        }
        return (donations, campaignAddresses);
    }

    function donateCoin(uint256 amount, Campaign campaign) public {
        require(amount > 0, "Amount cannot be 0");

        require(
            address(campaign) != address(0),
            "Campaign can not be a null value"
        );

        require(
            campaign.owner() != msg.sender,
            "Can not donate to your own campaign"
        );

        // Update the donation amount for this campaign
        donationInfo[msg.sender][address(campaign)] += amount;
        donatedChecker[msg.sender][address(campaign)] = true;

        // Transfer GiveCoin tokens from the donor to the contract
        givecoin.transferFrom(msg.sender, address(this), amount);

        // Track donors
        if (!hasDonated[msg.sender]) {
            donators.push(msg.sender);
            hasDonated[msg.sender] = true;
        }
        isDonating[msg.sender] = true;

        issueCoin();
    }

    function issueCoin() public {
        // require(msg.sender == owner, "caller must be the owner");

        for (uint i = 0; i < donators.length; i++) {
            address donator = donators[i];
            isDonating[donator] = false;

            // Iterate through each campaign for this donator
            for (uint j = 0; j < campaigns.length; j++) {
                Campaign campaign = campaigns[j];
                address campaignAddr = address(campaign);

                uint256 donation = donationInfo[donator][campaignAddr];

                if (donation > 0) {
                    address recipient = campaign.owner();

                    // Check if donation needs to be handled for overflow, completion, etc.
                    if (
                        campaign.totalAmountNeeded() ==
                        campaign.totalAmountReceived()
                    ) {
                        donationInfo[donator][campaignAddr] = 0;
                        givecoin.transfer(donator, donation);
                    } else if (
                        (campaign.totalAmountReceived() + donation) >
                        campaign.totalAmountNeeded()
                    ) {
                        uint256 overflow = campaign.totalAmountReceived() +
                            donation -
                            campaign.totalAmountNeeded();
                        donationInfo[donator][campaignAddr] = 0;
                        campaign.donated(donator, donation - overflow);
                        givecoin.transfer(recipient, donation - overflow);
                        givecoin.transfer(donator, overflow);

                        emit DonationReceived(donator, donation - overflow);
                        emit OverflowReturned(donator, overflow);
                    } else {
                        if (campaign.Milestones() == 0) {
                            donationInfo[donator][campaignAddr] = 0;
                            campaign.donated(donator, donation);
                            givecoin.transfer(recipient, donation);

                            emit DonationReceived(donator, donation);
                        } else {
                            require(
                                !campaign.getCurrentMilestoneApproved(),
                                "Current Milestone has been fulfilled but not approved. Please donate once organization has completed the milestone."
                            );

                            uint256 remainingForMilestone = campaign
                                .getCurrentMilestoneAmount() -
                                campaign.totalAmountReceived();
                            if (donation > remainingForMilestone) {
                                uint256 overflow = donation -
                                    remainingForMilestone;
                                donationInfo[donator][campaignAddr] = overflow;
                                campaign.donated(donator, donation - overflow);
                                givecoin.transfer(
                                    recipient,
                                    donation - overflow
                                );

                                emit DonationReceived(
                                    donator,
                                    donation - overflow
                                );
                                emit AwaitingApproval(
                                    campaign,
                                    campaign.Milestones()
                                );
                            } else {
                                donationInfo[donator][campaignAddr] = 0;
                                campaign.donated(donator, donation);
                                givecoin.transfer(recipient, donation);

                                emit DonationReceived(donator, donation);
                            }
                        }
                    }
                }
            }
        }
    }
}
