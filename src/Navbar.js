import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withNavigate } from "./withNavigate";
import logo from "./givecoin logo.jpg";

class Navbar extends Component {
  handleCreateCampaignSubmit = async (event) => {
    event.preventDefault();
    try {
      // Navigate to the homepage
      await this.props.navigate("/create-campaign");
    } catch (error) {
      console.log("nav failed:", error);
    }
  };

  handleCManageCampaignSubmit = async (event) => {
    event.preventDefault();
    try {
      // Navigate to the homepage
      await this.props.navigate("/manage-campaign");
    } catch (error) {
      console.log("nav failed:", error);
    }
  };

  render() {
    function shortenString(str, startLength = 3, endLength = 4) {
      if (str.length <= startLength + endLength) {
        return str; // If the string is too short, return as is
      }
      const start = str.slice(0, startLength); // Get the first 'startLength' characters
      const end = str.slice(-endLength); // Get the last 'endLength' characters
      return `${start}...${end}`;
    }

    let campaignManagement;
    {
      this.props.campaignOwner.some((account) => account === this.props.account)
        ? (campaignManagement = (
            <button
              className="btn btn-primary btn-sm btn-block"
              style={{
                margin: "5px",
                marginRight: "10px",
                background: "gray",
                borderColor: "gray",
              }}
              onClick={this.handleCManageCampaignSubmit}
            >
              Manage Campaign
            </button>
          ))
        : (campaignManagement = (
            <button
              className="btn btn-primary btn-sm btn-block"
              style={{
                margin: "5px",
                marginRight: "10px",
                background: "gray",
                borderColor: "gray",
              }}
              onClick={this.handleCreateCampaignSubmit}
            >
              Create Campaign
            </button>
          ));
    }

    return (
      <nav
        className="navbar navbar-dark fixed-top shadow p-0"
        style={{ backgroundColor: "black", height: "50px" }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Left side: GiveCoin for Charity and Campaigns */}
          <div className="d-flex align-items-center">
            <img
              src={logo}
              alt="GiveCoin logo"
              style={{ width: "30px", height: "auto" }}
            />
            <Link className="navbar-brand" to="/" style={{ color: "white" }}>
              &nbsp; GiveCoin for Charity
            </Link>

            {/* Campaigns link */}
            <div style={{ margin: "5px" }}>
              <Link
                className="nav-link"
                to="/campaigns"
                style={{ color: "white" }}
              >
                Campaigns
              </Link>
            </div>
            <div style={{ margin: "5px" }}>
              <Link
                className="nav-link"
                to="/donations"
                style={{ color: "white" }}
              >
                Donations
              </Link>
            </div>
          </div>

          {/* Right side: Account Number */}
          <div>
            {campaignManagement}
            <button
              className="btn btn-primary btn-sm btn-block"
              style={{ margin: "5px", marginRight: "10px" }}
              onClick={() => {
                window.location.reload();
              }}
            >
              Refresh
            </button>
            <small style={{ color: "white" }}>
              ACCOUNT NUMBER: {shortenString(this.props.account)}
            </small>
          </div>
        </div>
      </nav>
    );
  }
}

export default withNavigate(Navbar);
