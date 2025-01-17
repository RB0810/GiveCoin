import React, { Component } from "react";
import { useParams } from "react-router-dom";
import DonationPage from "./DonationPage";

function DonateWrapper(props) {
  const { index } = useParams();
  return <Donate {...props} index={index} />;
}

class Donate extends Component {
  render() {
    let donationForm;
    {
      this.props.loading
        ? (donationForm = (
            <p
              id="loader"
              className="text-center"
              style={{ margin: "30px", color: "black" }}
            >
              LOADING PLEASE...
            </p>
          ))
        : (donationForm = (
            <DonationPage
              givecoinBalance={this.props.givecoinBalance}
              donateCoin={this.props.donateCoin}
              index={this.props.index}
              allCampaigns={this.props.allCampaigns}
              campaignOwner={this.props.campaignOwner}
              campaignNames={this.props.campaignNames}
              // campaignDescription={this.props.campaignDescription}
              campaignTotalAmountNeeded={this.props.campaignTotalAmountNeeded}
              campaignTotalAmountReceived={
                this.props.campaignTotalAmountReceived
              }
              campaignMilestones={this.props.campaignMilestones}
              account={this.props.account}
              // givecoin={this.props.givecoin}
              // escrow={this.props.escrow}
              // givecoinBalance={this.props.givecoinBalance}
            />
          ));
    }

    return (
      <div>
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "90vm", minHeight: "100vm" }}
            >
              <div>{donationForm}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default DonateWrapper;
