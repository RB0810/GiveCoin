import "./App.css";
import { Buffer } from "buffer";
import React, { Component } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Campaigns from "./Campaigns";
import Donations from "./Donations";
import DonateWrapper from "./Donate";
import ManageCampaign from "./ManageCampaign";
import CreateCampaign from "./CreateCampaign";
import Web3 from "web3";
import GiveCoin from "./truffle_abis/GiveCoin.json";
import Campaign from "./truffle_abis/Campaign.json";
import Escrow from "./truffle_abis/Escrow.json";

window.Buffer = Buffer;

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("No Ethereum browser detected! Check MetaMask");
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const account = await web3.eth.getAccounts();

    this.setState({ account: account[0] });
    const networkId = await web3.eth.net.getId();

    // GIVECOIN
    const givecoinData = GiveCoin.networks[networkId];

    if (givecoinData) {
      const givecoin = new web3.eth.Contract(
        GiveCoin.abi,
        givecoinData.address,
      );
      this.setState({ givecoin });

      let givecoinBalance = await givecoin.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ givecoinBalance: givecoinBalance.toString() });
    } else {
      window.alert("GiveCoin contract not deployed");
    }

    // ESCROW
    const escrowData = Escrow.networks[networkId];

    if (escrowData) {
      const escrow = new web3.eth.Contract(Escrow.abi, escrowData.address);
      this.setState({ escrow });

      // Call the updated getAllDonationsForAccount function
      let donationsInfo = await escrow.methods
        .getAllDonationsForAccount(this.state.account)
        .call();

      if (donationsInfo && donationsInfo[0] && donationsInfo[1]) {
        const donationsArray = donationsInfo[0]; // Array of donations
        const campaignsArray = donationsInfo[1]; // Array of campaigns

        // Now you can map over the arrays to create the donations object
        let donations = donationsArray.map((donation, index) => ({
          donation: donation,
          campaign: campaignsArray[index],
        }));

        this.setState({ donationsLeft: donations });

        let campaignAddresses = await escrow.methods.getCampaigns().call();

        this.setState({ allCampaigns: campaignAddresses });

        const campaignData = await Promise.all(
          campaignAddresses.map(async (address) => {
            const campaignContract = new web3.eth.Contract(
              Campaign.abi,
              address,
            );

            // Fetch the values from the Campaign contract
            const owner = await campaignContract.methods.owner().call(); // campaign owner
            const name = await campaignContract.methods.name().call(); // campaign name
            const description = await campaignContract.methods
              .description()
              .call(); // campaign description
            const totalAmountNeeded = await campaignContract.methods
              .totalAmountNeeded()
              .call(); // total amount needed
            const totalAmountReceived = await campaignContract.methods
              .totalAmountReceived()
              .call(); // total amount received
            const totalDonated = await campaignContract.methods
              .getDonatedAmount()
              .call({ from: this.state.account });
            const milestoneCount = await campaignContract.methods
              .Milestones()
              .call(); // total number of milestones

            return {
              owner,
              name,
              description,
              totalAmountNeeded,
              totalAmountReceived,
              milestoneCount,
              totalDonated,
            };
          }),
        );

        this.setState({
          campaignOwner: campaignData.map((data) => data.owner),
          campaignNames: campaignData.map((data) => data.name),
          campaignDescription: campaignData.map((data) => data.description),
          campaignTotalAmountNeeded: campaignData.map(
            (data) => data.totalAmountNeeded,
          ),
          campaignTotalAmountReceived: campaignData.map(
            (data) => data.totalAmountReceived,
          ),
          campaignMilestones: campaignData.map((data) => data.milestoneCount),
          totalDonated: campaignData.map((data) => data.totalDonated),
          loading: false,
        });
      } else {
        console.error(
          "donationsInfo is not in the expected format or is empty",
        );
      }
    } else {
      window.alert("Escrow contract not deployed");
    }

    this.setState({ loading: false });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      givecoin: {},
      escrow: {},
      givecoinBalance: "0",
      allCampaigns: [],
      campaignOwner: [],
      campaignNames: [],
      campaignDescription: [],
      campaignTotalAmountNeeded: [],
      campaignTotalAmountReceived: [],
      campaignMilestones: [],
      totalDonated: [],
      donationsLeft: [],
      loading: true,
    };
  }

  donateCoin = (amount, _to) => {
    return new Promise((resolve, reject) => {
      if (!_to || _to === "0x0000000000000000000000000000000000000000") {
        alert("Invalid recipient address.");
        reject("Invalid recipient address.");
        return;
      }
      if (amount <= 0) {
        alert("Amount must be greater than 0.");
        reject("Amount must be greater than 0.");
        return;
      }

      this.setState({ loading: true });

      this.state.givecoin.methods
        .approve(this.state.escrow._address, amount)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.state.escrow.methods
            .donateCoin(amount, _to)
            .send({ from: this.state.account })
            .on("transactionHash", (hash) => {
              this.setState({ loading: false });
              resolve(); // Resolve the promise after the entire process is complete
            })
            .on("error", (error) => {
              this.setState({ loading: false });
              reject(error); // Reject if there's an error in the inner transaction
              alert("Error when processing transaction");
            });
        })
        .on("error", (error) => {
          this.setState({ loading: false });
          reject(error); // Reject if there's an error in the approval transaction
          alert("Approval Rejected");
        });
    });
  };

  render() {
    return (
      <div
        className="App"
        style={{ position: "relative", background: "gray", height: "100vh" }}
      >
        <Navbar
          account={this.state.account}
          campaignOwner={this.state.campaignOwner}
        />
        <Routes>
          <Route
            path="/"
            element={
              <div className="m-5">
                <br />
                <h1>Welcome to GiveCoin!</h1>
                <br />
                <p>
                  This is your gateway to help the world via charities in a fair
                  and transparent way. You are able to create your own
                  fundraising campaigns stored in the blockchain or pick your
                  favorite fund to donate to using your GiveCoins. Your donation
                  will be held in escrow until the fund reaches a certain goal
                  which will trigger our smart contracts. This ensures that a
                  donation is only accessible to the fund when a requirement is
                  met. In your own campaign, you can set your own goals. This
                  way we ensure trust and transparency between the funds and
                  you. It's immutable and the system makes sure your coins are
                  only transferred when they should. Start donating or raising
                  today!
                </p>
              </div>
            }
          />
          <Route
            path="/donations"
            element={
              <Donations
                key={window.location.pathname}
                allCampaigns={this.state.allCampaigns}
                campaignOwner={this.state.campaignOwner}
                campaignNames={this.state.campaignNames}
                campaignDescription={this.state.campaignDescription}
                campaignTotalAmountNeeded={this.state.campaignTotalAmountNeeded}
                campaignTotalAmountReceived={
                  this.state.campaignTotalAmountReceived
                }
                campaignMilestones={this.state.campaignMilestones}
                totalDonated={this.state.totalDonated}
                donationsLeft={this.state.donationsLeft}
              />
            }
          />
          <Route
            path="/campaigns"
            element={
              <Campaigns
                key={window.location.pathname}
                allCampaigns={this.state.allCampaigns}
                campaignOwner={this.state.campaignOwner}
                campaignNames={this.state.campaignNames}
                campaignDescription={this.state.campaignDescription}
                campaignTotalAmountNeeded={this.state.campaignTotalAmountNeeded}
                campaignTotalAmountReceived={
                  this.state.campaignTotalAmountReceived
                }
                campaignMilestones={this.state.campaignMilestones}
              />
            }
          />
          <Route
            path="/donate/:index"
            element={
              <DonateWrapper
                key={window.location.pathname}
                allCampaigns={this.state.allCampaigns}
                campaignOwner={this.state.campaignOwner}
                campaignNames={this.state.campaignNames}
                campaignDescription={this.state.campaignDescription}
                campaignTotalAmountNeeded={this.state.campaignTotalAmountNeeded}
                campaignTotalAmountReceived={
                  this.state.campaignTotalAmountReceived
                }
                campaignMilestones={this.state.campaignMilestones}
                account={this.state.account}
                givecoin={this.state.givecoin}
                escrow={this.state.escrow}
                givecoinBalance={this.state.givecoinBalance}
                donateCoin={this.donateCoin}
              />
            }
          />
          <Route
            path="/create-campaign"
            element={
              <CreateCampaign
                key={window.location.pathname}
                allCampaigns={this.state.allCampaigns}
                campaignOwner={this.state.campaignOwner}
                campaignNames={this.state.campaignNames}
                campaignDescription={this.state.campaignDescription}
                campaignTotalAmountNeeded={this.state.campaignTotalAmountNeeded}
                campaignTotalAmountReceived={
                  this.state.campaignTotalAmountReceived
                }
                campaignMilestones={this.state.campaignMilestones}
                account={this.state.account}
                givecoin={this.state.givecoin}
                escrow={this.state.escrow}
                givecoinBalance={this.state.givecoinBalance}
                donateCoin={this.donateCoin}
              />
            }
          />
          <Route
            path="/manage-campaign"
            element={
              <ManageCampaign
                key={window.location.pathname}
                allCampaigns={this.state.allCampaigns}
                campaignOwner={this.state.campaignOwner}
                campaignNames={this.state.campaignNames}
                campaignDescription={this.state.campaignDescription}
                campaignTotalAmountNeeded={this.state.campaignTotalAmountNeeded}
                campaignTotalAmountReceived={
                  this.state.campaignTotalAmountReceived
                }
                campaignMilestones={this.state.campaignMilestones}
                account={this.state.account}
                givecoin={this.state.givecoin}
                escrow={this.state.escrow}
                givecoinBalance={this.state.givecoinBalance}
                donateCoin={this.donateCoin}
              />
            }
          />
        </Routes>
      </div>
    );
  }
}

export default App;
