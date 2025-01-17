import React, { Component } from "react";
import { withNavigate } from "./withNavigate";

class CreateCampaign extends Component {
  handleCreateCampaignSubmit = async (event) => {
    event.preventDefault();

    try {
      let name = this.name.value.toString();
      let description = this.description.value.toString();
      let amountNeeded = window.web3.utils.toWei(
        this.amountNeeded.value.toString(),
        "Ether",
      );
      // Call the donateCoin function and wait for it to complete
      await this.props.escrow.methods
        .createCampaign(name, description, amountNeeded)
        .send({ from: this.props.account })
        .on("transactionHash", (hash) => {
          console.log("Transaction Hash:", hash);
        })
        .on("receipt", (receipt) => {
          console.log("Transaction receipt:", receipt);
        })
        .on("error", (error) => {
          console.error("Error:", error);
        });

      console.log(this.props.escrow.methods.getCampaigns().call());

      // Navigate to the homepage
      await this.props.navigate("/campaigns");

      alert("Campaign Created! Please refresh the page to see your Campaign.");
    } catch (error) {
      console.log("Campaign Creation failed:", error);
    }
  };

  handleManageCampaignSubmit = async (event) => {
    event.preventDefault();
    try {
      // Navigate to the homepage
      await this.props.navigate("/manage-campaign");
    } catch (error) {
      console.log("nav failed:", error);
    }
  };

  render() {
    let checkUser;
    {
      this.props.campaignOwner.some((account) => account === this.props.account)
        ? (checkUser = (
            <div className="pt-5">
              <div>You already have a campaign.</div>
              <div>
                <button
                  className="btn btn-primary btn-sm btn-block"
                  style={{ margin: "5px", marginRight: "10px" }}
                  onClick={this.handleManageCampaignSubmit}
                >
                  Manage Campaign
                </button>
              </div>
            </div>
          ))
        : (checkUser = (
            <div className="card mb-2" style={{ opacity: "0.9" }}>
              <form className="mb-3" onSubmit={this.handleCreateCampaignSubmit}>
                <div style={{ borderSpacing: "0 1em" }}>
                  <div className="container-fluid d-flex justify-content-between align-items-center">
                    <div className="container-fluid d-flex">
                      <div className="d-flex flex-column align-items-start">
                        <div className="container-fluid d-flex">
                          <label
                            className="m-3"
                            style={{ width: "150px", marginLeft: "15px" }}
                          >
                            <b>Name:</b>
                          </label>
                          <div className="m-3">
                            <input
                              ref={(input) => {
                                this.name = input;
                              }}
                              type="text"
                              placeholder="Name"
                              required
                            />
                          </div>
                        </div>
                        <div className="container-fluid d-flex">
                          <label
                            className="m-3"
                            style={{ width: "150px", marginLeft: "15px" }}
                          >
                            <b>Description:</b>
                          </label>
                          <div className="m-3">
                            <input
                              ref={(input) => {
                                this.description = input;
                              }}
                              type="text"
                              placeholder="Description"
                              required
                            />
                          </div>
                        </div>
                        <div className="container-fluid d-flex">
                          <label
                            className="m-3"
                            style={{ width: "150px", marginLeft: "15px" }}
                          >
                            <b>Amount Needed:</b>
                          </label>
                          <div className="m-3">
                            <input
                              ref={(input) => {
                                this.amountNeeded = input;
                              }}
                              type="text"
                              placeholder="0"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ margin: "10px" }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lrg btn-block"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ));
    }

    return <div className="pt-5">{checkUser}</div>;
  }
}

export default withNavigate(CreateCampaign);
