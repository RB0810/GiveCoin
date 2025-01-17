import React, { Component } from "react";
import { withNavigate } from "./withNavigate";
import Campaign from "./truffle_abis/Campaign.json";

class ManageCampaign extends Component {
  state = {
    milestonesData: [],
    currentMilestoneIndex: 0,
  };

  componentDidMount() {
    this.loadMilestonesData();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.allCampaigns !== this.props.allCampaigns ||
      prevProps.campaignOwner !== this.props.campaignOwner ||
      prevProps.campaignTotalAmountReceived !==
        this.props.campaignTotalAmountReceived
    ) {
      this.loadMilestonesData();
    }
  }

  loadMilestonesData = async () => {
    const { account, campaignMilestones } = this.props;
    const cindex = this.props.campaignOwner.findIndex(
      (owner) => owner === account,
    );

    if (cindex !== -1) {
      const campaignContract = new window.web3.eth.Contract(
        Campaign.abi,
        this.props.allCampaigns[cindex],
      );
      const milestonesCount = campaignMilestones[cindex];
      const milestonesData = [];

      let found = false;

      // Loop through each milestone and fetch its data
      for (let i = 0; i < milestonesCount; i++) {
        try {
          const amount = await campaignContract.methods
            .getMilestoneAmountAt(i)
            .call();
          const approved = await campaignContract.methods
            .getMilestoneApprovedAt(i)
            .call();
          const transactionDescription = await campaignContract.methods
            .getMileStoneTransactionDescription(i)
            .call();

          if (!approved && !found) {
            this.setState({ currentMilestoneIndex: i });
            found = true;
          }

          milestonesData.push({
            index: i,
            amount,
            approved,
            transactionDescription,
          });
        } catch (error) {
          console.error("Error fetching milestone data at index", i, error);
        }
      }

      if (!found) {
        this.setState({ currentMilestoneIndex: milestonesCount });
      }

      // Update state with all fetched milestones data
      this.setState({ milestonesData });
    }
  };

  handleCreateCampaignSubmit = async (event) => {
    event.preventDefault();
    try {
      await this.props.navigate("/create-campaign");
    } catch (error) {
      console.log("Navigation failed:", error);
    }
  };

  handleCreateMilestoneSubmit = async (event) => {
    event.preventDefault();
    try {
      const cindex = this.props.campaignOwner.findIndex(
        (owner) => owner === this.props.account,
      );

      const amountValue = parseFloat(this.amount.value);

      if (amountValue > 0) {
        if (
          amountValue <
          parseFloat(
            window.web3.utils.fromWei(
              this.props.campaignTotalAmountNeeded[cindex],
              "ether",
            ),
          )
        ) {
          if (cindex !== -1) {
            const campaignContract = new window.web3.eth.Contract(
              Campaign.abi,
              this.props.allCampaigns[cindex],
            );

            if (this.props.campaignMilestones[cindex] !== (0).toString()) {
              const prevAmount = await campaignContract.methods
                .getMilestoneAmountAt(this.props.campaignMilestones[cindex] - 1)
                .call();

              if (
                amountValue <=
                parseFloat(window.web3.utils.fromWei(prevAmount, "Ether"))
              ) {
                alert("Amount must be greater than previous Milestone");
                throw "Amount must be greater than previous Milestone";
              }
            }

            await campaignContract.methods
              .setMilestone(
                window.web3.utils.toWei(amountValue.toString(), "Ether"),
              )
              .send({ from: this.props.account });

            alert(
              "Milestone has successfully been created! Please refresh the page to view.",
            );
          }
        } else {
          alert("Amount must be less than Total Amount Requested");
        }
      } else {
        alert("Amount can not be 0.");
      }
    } catch (error) {
      console.log("Milestone creation failed", error);
    }
  };

  handleMilestoneApproval = async (event, inputString) => {
    event.preventDefault();
    try {
      const cindex = this.props.campaignOwner.findIndex(
        (owner) => owner === this.props.account,
      );

      if (cindex !== -1) {
        const campaignContract = new window.web3.eth.Contract(
          Campaign.abi,
          this.props.allCampaigns[cindex],
        );

        await campaignContract.methods
          .approveMilestone(inputString)
          .send({ from: this.props.account });

        alert(
          "Milestone has successfully approved! Please refresh the page to update.",
        );
      }
    } catch (error) {
      console.log("Navigation failed:", error);
    }
  };

  handleMilestoneDenial = async (event) => {
    event.preventDefault();
    try {
      alert("You must wait until your milestone goal has been met.");
    } catch (error) {
      console.log("Navigation failed:", error);
    }
  };

  showApprovalPopup = (event) => {
    const userInput = prompt("Please specify on what the milestone is spent:");
    if (userInput !== null && userInput.trim() !== "") {
      this.handleMilestoneApproval(event, userInput.trim());
    } else {
      alert("Approval canceled or input was empty.");
    }
  };

  render() {
    const { milestonesData } = this.state;
    const {
      campaignOwner,
      account,
      campaignNames,
      campaignDescription,
      campaignTotalAmountReceived,
      campaignTotalAmountNeeded,
    } = this.props;

    const cindex = campaignOwner.findIndex((owner) => owner === account);

    const checkUser =
      cindex !== -1 ? (
        <div className="mt-5">
          <table className="table text-muted text-center">
            <thead>
              <tr style={{ color: "white" }}>
                <th scope="col">Campaign Name</th>
                <th scope="col">Campaign Description</th>
                <th scope="col">Total Amount Requested</th>
                <th scope="col">Total Amount Received</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ color: "white" }}>
                <td>{campaignNames[cindex]}</td>
                <td>{campaignDescription[cindex]}</td>
                <td>
                  {window.web3.utils.fromWei(
                    campaignTotalAmountNeeded[cindex],
                    "ether",
                  )}
                </td>
                <td>
                  {window.web3.utils.fromWei(
                    campaignTotalAmountReceived[cindex],
                    "ether",
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="table text-muted text-center">
            <thead>
              <tr style={{ color: "white" }}>
                <th scope="col">Milestone Index</th>
                <th scope="col">Goal</th>
                <th scope="col">Approval</th>
                <th scope="col">Milestone transaction description</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {milestonesData.map(
                ({ index, amount, approved, transactionDescription }) => (
                  <tr key={index} style={{ color: "white" }}>
                    <td>{index + 1}</td>
                    <td>{window.web3.utils.fromWei(amount, "ether")}</td>
                    <td>{approved ? "Approved" : "Not Approved"}</td>
                    <td>{transactionDescription}</td>
                    <td>
                      {index === this.state.currentMilestoneIndex &&
                      this.state.currentMilestoneIndex !==
                        this.props.campaignMilestones[cindex] ? (
                        parseFloat(
                          window.web3.utils.fromWei(amount, "ether"),
                        ) ===
                        parseFloat(
                          window.web3.utils.fromWei(
                            this.props.campaignTotalAmountReceived[cindex],
                          ),
                        ) ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={this.showApprovalPopup}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={this.handleMilestoneDenial}
                          >
                            Approve
                          </button>
                        )
                      ) : approved ? (
                        "Approved"
                      ) : (
                        "Not yet Approved"
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
          <div className="container-flex d-flex justify-content-center align-items-center">
            <form onSubmit={this.handleCreateMilestoneSubmit}>
              <label>
                <div className="m-2">Amount:</div>
              </label>
              <input
                ref={(input) => {
                  this.amount = input;
                }}
                className="pl-*"
                type="text"
                placeholder="0"
                required
              />
              <button
                className="btn btn-primary btn-sm btn-block m-2"
                type="submit"
              >
                Create Milestone
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="pt-5">
          <div>You do not have a campaign.</div>
          <button
            className="btn btn-primary btn-sm btn-block"
            style={{ margin: "5px", marginRight: "10px" }}
            onClick={this.handleCreateCampaignSubmit}
          >
            Create Campaign
          </button>
        </div>
      );

    return <div className="mt-5">{checkUser}</div>;
  }
}

export default withNavigate(ManageCampaign);
