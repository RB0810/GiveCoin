import React, { Component } from "react";

class Donations extends Component {
  render() {
    function shortenString(str, startLength = 3, endLength = 4) {
      if (str.length <= startLength + endLength) {
        return str; // If the string is too short, return as is
      }
      const start = str.slice(0, startLength); // Get the first 'startLength' characters
      const end = str.slice(-endLength); // Get the last 'endLength' characters
      return `${start}...${end}`;
    }

    return (
      <div className="pt-5">
        <div>
          {this.props.donationsLeft &&
          this.props.donationsLeft.length > 0 &&
          this.props.allCampaigns &&
          this.props.allCampaigns.length > 0 ? (
            <div>
              <div className="container mt-4">
                <div className="row">
                  {/* Filter allCampaigns to only include campaigns present in donationsLeft */}

                  {this.props.allCampaigns
                    .filter((campaign) =>
                      this.props.donationsLeft.some(
                        (donation) => donation.campaign === campaign,
                      ),
                    )
                    .map((campaign) => {
                      const index = this.props.allCampaigns.findIndex(
                        (c) => c === campaign,
                      );
                      const matchingDonation = this.props.donationsLeft.find(
                        (donation) => donation.campaign === campaign,
                      );

                      return (
                        <div key={index} className="col-md-4 mb-4">
                          {/* Card */}
                          <div className="row m-2">
                            <div className="card">
                              <div className="card-body">
                                {/* Campaign Name */}
                                <h5 className="card-title">
                                  {this.props.campaignNames[index]}
                                </h5>

                                {/* Campaign Description */}
                                <p className="card-text">
                                  {this.props.campaignDescription[index]}
                                </p>

                                {/* Amount Needed and Amount Received */}
                                <p className="card-text">
                                  <strong>Amount Needed:</strong>{" "}
                                  {this.props.campaignTotalAmountNeeded[index]
                                    ? window.web3.utils.fromWei(
                                        this.props.campaignTotalAmountNeeded[
                                          index
                                        ],
                                        "ether",
                                      )
                                    : "0"}{" "}
                                  <br />
                                  <strong>Amount Received:</strong>{" "}
                                  {this.props.campaignTotalAmountReceived[index]
                                    ? window.web3.utils.fromWei(
                                        this.props.campaignTotalAmountReceived[
                                          index
                                        ],
                                        "ether",
                                      )
                                    : "0"}
                                </p>

                                {/* Amount Donated and Amount in Escrow */}
                                <p className="card-text">
                                  <strong>Total Amount Donated:</strong>{" "}
                                  {this.props.totalDonated[index]
                                    ? window.web3.utils.fromWei(
                                        this.props.totalDonated[index],
                                        "ether",
                                      )
                                    : "0"}{" "}
                                  <br />
                                  <strong>
                                    Remaining Amount in Escrow:
                                  </strong>{" "}
                                  {window.web3.utils.fromWei(
                                    matchingDonation.donation,
                                    "ether",
                                  )}
                                </p>

                                {/* Milestones */}
                                <p className="card-text">
                                  <strong>Milestones:</strong>{" "}
                                  {this.props.campaignMilestones[index]} <br />
                                </p>

                                {/* Owner Address */}
                                <p className="card-text">
                                  <strong>Owner:</strong>{" "}
                                  {shortenString(
                                    this.props.campaignOwner[index]
                                      ? shortenString(
                                          this.props.campaignOwner[
                                            index
                                          ].toString(),
                                        )
                                      : "Not available",
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <p>No donations found</p>
          )}
        </div>
      </div>
    );
  }
}

export default Donations;
