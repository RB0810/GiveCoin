pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2;

import "./GiveCoin.sol";
import "./Escrow.sol";

contract Campaign {
    address public owner;
    string public name;
    string public description;
    uint256 public totalAmountNeeded;
    uint256 public totalAmountReceived = 0;
    uint8 public Milestones = 0;
    uint8 private currentMilestoneIndex = 0;

    GiveCoin public givecoin;

    Escrow public escrow;

    struct Milestone {
        uint256 amount;
        bool approved;
        string transactionDescription;
    }

    mapping(uint8 => Milestone) public milestones;
    mapping(address => uint256) public donations;

    event MilestoneReached(uint8 milestoneIndex, Milestone m);

    constructor(
        address creator,
        string memory campaignName,
        string memory campaignDescription,
        uint256 amountNeeded,
        GiveCoin _givecoin,
        Escrow _escrow
    ) public {
        owner = creator;
        name = campaignName;
        description = campaignDescription;
        totalAmountNeeded = amountNeeded;
        givecoin = _givecoin;
        escrow = _escrow;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the campaign owner can call this function"
        );
        _;
    }

    function setMilestone(uint256 amount) public onlyOwner {
        require(
            amount < totalAmountNeeded,
            "Can not set milestone above or equal to amount needed"
        );
        milestones[Milestones] = Milestone({
            amount: amount,
            approved: false,
            transactionDescription: "Not reached"
        });
        Milestones++;

        escrow.issueCoin();
    }

    function approveMilestone(string memory parameter) public onlyOwner {
        require(
            totalAmountReceived == milestones[currentMilestoneIndex].amount,
            "Current Milestone has not been reached."
        );
        milestones[currentMilestoneIndex].approved = true;
        milestones[currentMilestoneIndex].transactionDescription = parameter; //set the transactionDescription

        currentMilestoneIndex++;

        escrow.issueCoin();

        emit MilestoneReached(
            currentMilestoneIndex - 1,
            milestones[currentMilestoneIndex - 1]
        );
    }

    function donated(address donor, uint256 donation) public {
        donations[donor] += donation;
        totalAmountReceived += donation;
    }

    // function withdraw() public onlyOwner {
    //     require(
    //         totalAmountReceived >= totalAmountNeeded,
    //         "Campaign goal not reached"
    //     );

    //     // Transfer all collected givecoins to the campaign owner
    //     require(
    //         givecoin.transfer(owner, totalAmountReceived),
    //         "Withdrawal failed"
    //     );
    // }
    //

    function getOwner() public view returns (address) {
        return owner;
    }

    function getDescription() public view returns (string memory) {
        return description;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function getTotalAmountNeeded() public view returns (uint256) {
        return totalAmountNeeded;
    }

    function getTotalAmountReceived() public view returns (uint256) {
        return totalAmountReceived;
    }

    function getMilestones() public view returns (uint8) {
        return Milestones;
    }

    function getMilestoneApprovedAt(uint8 index) public view returns (bool) {
        if (index > Milestones || index < 0) {
            return false;
        } else if (index == Milestones) {
            return false;
        } else {
            return milestones[index].approved;
        }
    }

    function getMilestoneAmountAt(uint8 index) public view returns (uint256) {
        if (index > Milestones || index < 0) {
            return 0;
        } else if (index == Milestones) {
            return totalAmountNeeded;
        } else {
            return milestones[index].amount;
        }
    }

    function getCurrentMilestoneApproved() public view returns (bool) {
        if (currentMilestoneIndex > Milestones || currentMilestoneIndex < 0) {
            return false;
        } else if (currentMilestoneIndex == Milestones) {
            return false;
        } else {
            return milestones[currentMilestoneIndex].approved;
        }
    }

    function getCurrentMilestoneAmount() public view returns (uint256) {
        if (currentMilestoneIndex > Milestones || currentMilestoneIndex < 0) {
            return 0;
        } else if (currentMilestoneIndex == Milestones) {
            return totalAmountNeeded;
        } else {
            return milestones[currentMilestoneIndex].amount;
        }
    }

    function getDonatedAmount() public view returns (uint256) {
        return donations[msg.sender];
    }

    function getMileStoneTransactionDescription(
        uint8 index
    ) public view returns (string memory) {
        return milestones[index].transactionDescription;
    } //Getting transactionDescription
}
