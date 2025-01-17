import React, { Component } from "react";
import { Link } from "react-router-dom";

class Campaigns extends Component {
  render() {
    function shortenString(str, startLength = 3, endLength = 4) {
      if (str === undefined) {
        return "";
      }
      if (str.length <= startLength + endLength) {
        return str; // If the string is too short, return as is
      }
      const start = str.slice(0, startLength); // Get the first 'startLength' characters
      const end = str.slice(-endLength); // Get the last 'endLength' characters
      return `${start}...${end}`;
    }

    return (
      <div className="pt-5">
        {this.props.allCampaigns && this.props.allCampaigns.length > 0 ? (
          <div className="container mt-4">
            <div className="row">
              {this.props.allCampaigns.map((campaign, index) => (
                <div key={index} className="col-md-4 mb-4">
                  {/* Card */}
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
                              this.props.campaignTotalAmountNeeded[index],
                              "ether",
                            )
                          : "0"}{" "}
                        <br />
                        <strong>Amount Received:</strong>{" "}
                        {this.props.campaignTotalAmountReceived[index]
                          ? window.web3.utils.fromWei(
                              this.props.campaignTotalAmountReceived[index],
                              "ether",
                            )
                          : "0"}
                      </p>

                      {/* Milestones */}
                      <p className="card-text">
                        <strong>Milestones:</strong>{" "}
                        {this.props.campaignMilestones[index]} <br />
                      </p>

                      {/* Owner Address */}
                      <p className="card-text">
                        <strong>Owner:</strong>{" "}
                        {this.props.campaignOwner[index]
                          ? shortenString(
                              this.props.campaignOwner[index].toString(),
                            )
                          : "Not available"}
                      </p>
                      {/* Donate Button */}
                      <Link
                        to={`/donate/${index !== undefined ? index : "Not available"}`}
                        className="btn btn-primary"
                      >
                        Donate
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>No campaigns found</p>
        )}
      </div>
    );
  }
}

export default Campaigns;
