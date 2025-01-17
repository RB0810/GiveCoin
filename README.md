# givecoin-dapp

### How to Run

1. Download the project
2. In your terminal type `npm install -g truffle` (assuming you have node.js installed).
3. In `givecoin-dapp` folder run `npm install` to install node_modules.
3. Download Ganache application (`https://archive.trufflesuite.com/ganache/` or `brew install ganache` [ONLY if you have homebrew installed])
5. When launched, you should click "quick workspace". The server should be http://127.0.0.1 where your port is 7545 (this is quite typical).
6. Your network id might be unique, so you might need to modify the `truffle-config.js` file
   `development: {
      host: "127.0.0.1", // server here
      port: "7545", // port here
      network_id: "XXXX" // your id here (mine was 5777)
    }`
7. [DO THIS STEP IF YOU ARE ON WINDOWS] Go to `package.json` and in the npm `start` section, change it to: `"start": "set NODE_OPTIONS=--openssl-legacy-provider && react-scripts start"`.
8. Go to terminal and in `givecoin-app` run `truffle compile` in `givecoin-dapp` this will compile everything and change the files in `src/truffle-abis`.
9. Go to terminal and in `givecoin-app` run `truffle test` this should pass all the tests.
10. Install MetaMask on browser...you need to create a personal account.
11. Once logged in, there should be an option to add an network -> settings -> network -> add test network -> input values from Ganache (you may have to toggle 'view test networks' in order to switch to Ganache network).
12. Add accounts -> add account -> import account -> go to ganache & copy private key of **Account 2** -> go back to MetaMask and paste.
13. Go to terminal and in `givecoin-app` type `truffle migrate --reset` -> this should deploy all the contracts from `2_deploy_contracts.js`.
14. Go to terminal and in `givecoin-app` run `npm start` -> this should launch your local host -> a pop up from MetaMask will occur saying "Connect to localhost" and click it.
15. Now everything should work.