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
const contractAddress = '0xF4ee95274741437636e748DdAc70818B4ED7d043'; // Replace with your contract's address
const nftContract = new web3.eth.Contract(contractABI, contractAddress);

// Initialize the elliptic curve cryptography library for signing and verifying messages
const secp256k1 = new ec('secp256k1');

const server = http.createServer(app);
app.get('/verify-proxy-ownership', async (req, res) => {
  const userWalletAddress = req.query.userWalletAddress;
  const nftTokenId = req.query.nftTokenId;
  
  // Check if user's wallet holds at least one NFT
  const hasNFT = await nftContract.methods.balanceOf(userWalletAddress).call();
  if (hasNFT <= 0) {
    res.status(401).send('User does not hold any NFTs');
    return;
  } 

  // Verify ownership using the user's private key and the NFT's token ID
  const privateKey = 'xxxx'; // Replace with user's private key
  const msgHash = web3.utils.keccak256(`You are verifying ownership of NFT with ID ${nftTokenId}`);
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
  const address = await web3.eth.personal.ecRecover(msgHashHex, signedMessage);
  if (address.toLowerCase() !== userWalletAddress.toLowerCase()) {
    res.status(401).send('Invalid signature');
    return;
  }

  res.status(200).json({ message: 'Ownership verified successfully' });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
This code will check if a user owns an NFT from the contract address  assume if yes then provide proxy access.


 
