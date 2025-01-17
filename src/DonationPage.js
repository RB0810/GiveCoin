import React, { Component } from "react";
import { withNavigate } from "./withNavigate";
import Campaign from "./truffle_abis/Campaign.json";

class DonationPage extends Component {
  state = {
    milestonesData: [],
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
    const cindex = this.props.index;

    if (cindex !== -1) {
      const campaignContract = new window.web3.eth.Contract(
        Campaign.abi,
        this.props.allCampaigns[cindex],
      );
      const milestonesCount = campaignMilestones[cindex];
      const milestonesData = [];

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

      // Update state with all fetched milestones data
      this.setState({ milestonesData });
    }
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let amount = window.web3.utils.toWei(
        this.input.value.toString(),
        "Ether",
      );

      // Call the donateCoin function and wait for it to complete
      await this.props.donateCoin(
        amount,
        this.props.allCampaigns[this.props.index],
      );

      // Navigate to the homepage
      await this.props.navigate("/donations");

      alert(
        "Donation successful! Please refresh the page to see your donation.",
      );
    } catch (error) {
      console.log("Donation failed:", error);
    }
  };

  render() {
    const { milestonesData } = this.state;

    let donationOwnerChoice;
    {
      this.props.campaignOwner[this.props.index] !== this.props.account
        ? (donationOwnerChoice = (
            <button type="submit" className="btn btn-primary btn-lrg btn-block">
              DONATE
            </button>
          ))
        : (donationOwnerChoice = (
            <div>This is your campaign. You can not donate to yourself.</div>
          ));
    }

    return (
      <div id="donationForm" className="mt-3">
        <table className="table text-muted text-center">
          <thead>
            <tr style={{ color: "white" }}>
              <th scope="col">GiveCoin Balance</th>
              <th scope="col">Campaign Name</th>
              <th scope="col">Campaign Address</th>
              <th scope="col">Total Amount Received</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ color: "white" }}>
              <td>
                {window.web3.utils.fromWei(this.props.givecoinBalance, "Ether")}{" "}
                GC
              </td>
              <td>{this.props.campaignNames[this.props.index]}</td>
              <td>{this.props.allCampaigns[this.props.index]}</td>
              <td>
                {window.web3.utils.fromWei(
                  this.props.campaignTotalAmountReceived[
                    this.props.index
                  ].toString(),
                  "ether",
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="table text-muted text-center">
          <thead>
            <tr style={{ color: "white" }}>
              <th scope="col">Milestone</th>
              <th scope="col">Goal</th>
              <th scope="col">Approval</th>
              <th scope="col">Milestone transaction description</th>
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
                </tr>
              ),
            )}
          </tbody>
        </table>
        {/*Add in table description of transaction */}
        <div className="card mb-2" style={{ opacity: "0.9" }}>
          <form className="mb-3" onSubmit={this.handleSubmit}>
            <div style={{ borderSpacing: "0 1em" }}>
              <label className="float-start" style={{ marginLeft: "15px" }}>
                <b>Donate GiveCoin</b>
              </label>
              <span className="float-end" style={{ marginRight: "15px" }}>
                Balance:{" "}
                {window.web3.utils.fromWei(this.props.givecoinBalance, "Ether")}
              </span>

              <div style={{ margin: "10px" }}>
                <div className="input-group mb-3 pl-5">
                  <input
                    ref={(input) => {
                      this.input = input;
                    }}
                    className="pl-*"
                    type="text"
                    placeholder="0"
                    required
                  />
                  <div className="input-group-append">
                    &nbsp;&nbsp;&nbsp; GiveCoin
                  </div>
                </div>
                {donationOwnerChoice}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withNavigate(DonationPage);
