const http = require('http');
const express = require('express');
const { ec } = require('elliptic');
const Web3 = require('web3');
const contractABI = require('./NFTContractABI.json');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();
app.use(express.json());

// Initialize Web3 with your Ethereum network's endpoint URL
const web3 = new Web3('https://goerli.infura.io/v3/3376a33c419a4d249d680fa54ff8b6bf');

// Initialize the contract instance using its ABI and address
const contractAddress = '0xF4ee95274741437636e748DdAc70818B4ED7d043'; 
const nftContract = new web3.eth.Contract(contractABI, contractAddress);
const secp256k1 = new ec('secp256k1');

const server = http.createServer(app);

// Verify ownership of an NFT by a user wallet
app.get('/verify-ownership', async (req, res) => {
  const userWalletAddress = req.query.userWalletAddress;
  const nftTokenId = req.query.nftTokenId;

          // Check if user's wallet holds at least one NFT
  const hasNFT = await nftContract.methods.balanceOf(userWalletAddress).call();
  if (hasNFT <= 0) {
    res.status(401).send('User does not hold any NFTs');
    return;
  }
  res.json(signedMessage);
return;

  // Get the owner of the NFT
  const owner = await nftContract.methods.ownerOf(nftTokenId).call();
  if (owner.toLowerCase() !== userWalletAddress.toLowerCase()) {
    res.status(401).send('User does not own the specified NFT');
    return;
  }

  res.status(200).json({ message: 'Ownership verified successfully' });
});

// Grant access or sign a gated page using a proxy wallet
app.get('/grant-access', async (req, res) => {
  const proxyWalletAddress = req.query.proxyWalletAddress;
  const gatedPageId = req.query.gatedPageId;

  // Check if proxy wallet is authorized to grant access
  const isAuthorized = await nftContract.methods.isAuthorized(proxyWalletAddress).call();
  if (!isAuthorized) {
    res.status(401).send('Proxy wallet is not authorized to grant access');
    return;
  }

  // Grant access or sign gated page using the proxy wallet's private key
  const privateKey = 'xxxx'; // Replace with proxy wallet's private key
  const msgHash = web3.utils.keccak256(`You are granting access to gated page with ID ${gatedPageId}`);
  const msgHashHex = `0x${msgHash}`;
  const msgHashBytes = Buffer.from(msgHashHex.slice(2), 'hex');
  const signature = secp256k1.keyFromPrivate(privateKey).sign(msgHashBytes);
  const r = signature.r.toString(16);
  const s = signature.s.toString(16);
  const v = signature.recoveryParam + 27;
  const signedMessage = {
    messageHash: msgHashHex,
    v: `0x${v.toString(16)}`,
    r: `0x${r.padStart(64, '0')}`,
    s: `0x${s.padStart(64, '0')}`,
  };

  res.json(signedMessage);
return;
