const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify( '0d657f444BF2AA726a085067C4E26e782d837452' ));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  const Web3 = require('web3');
const { ec } = require('elliptic');
const contractABI = require('./NFTContractABI.json');

// Initialize Web3 with your Ethereum network's endpoint URL
const web3 = new Web3('https://goerli.infura.io/v3/3376a33c419a4d249d680fa54ff8b6bf');

// Initialize the contract instance using its ABI and address
const contractAddress = '0xF4ee95274741437636e748DdAc70818B4ED7d043'; // Replace with your contract's address
const nftContract = new web3.eth.Contract(contractABI, contractAddress);

// Initialize the elliptic curve cryptography library for signing and verifying messages
const secp256k1 = new ec('secp256k1');
const express = require('express');
const app = express();
// Endpoint to check if user holds the NFT and grant access to proxy wallet for verifying ownership of any message
app.get('/verify-proxy-ownership', async (req, res) => {
  const userWalletAddress = req.query.userWalletAddress;
  const nftTokenId = req.query.nftTokenId;

  // Check if user's wallet holds the NFT
  const ownerOfToken = await nftContract.methods.ownerOf(nftTokenId).call();
  if (ownerOfToken.toLowerCase() !== userWalletAddress.toLowerCase()) {
    res.status(401).send('User does not hold the specified NFT');
    return;
  }

  // Grant access to proxy wallet for verifying ownership of any message
  // Replace the following code with your own implementation
  const proxyWalletPrivateKey = ''; // Replace with the private key of your proxy wallet
  const messageToVerify = req.query.messageToVerify; // Replace with the message to verify
  const signature = signMessageWithProxyWallet(proxyWalletPrivateKey, messageToVerify);
  const proxyWalletPublicKey = secp256k1.keyFromPrivate(proxyWalletPrivateKey).getPublic('hex');
  const isVerified = verifySignatureWithProxyWallet(proxyWalletPublicKey, messageToVerify, signature);
  
  if (isVerified) {
    res.status(200).send('Proxy wallet ownership is verified');
  } else {
    res.status(401).send('Proxy wallet ownership is not verified');
  }
});

// Function to sign a message with a proxy wallet
function signMessageWithProxyWallet(proxyWalletPrivateKey, messageToSign) {
  const messageHash = web3.utils.sha3(messageToSign);
  const signatureObject = secp256k1.sign(messageHash, proxyWalletPrivateKey, { canonical: true });
  const signature = '0x' + signatureObject.r.toString('hex') + signatureObject.s.toString('hex') + (signatureObject.recoveryParam + 27).toString(16);
  return signature;
}

function verifySignatureWithProxyWallet(proxyWalletPublicKey, messageToVerify, signature) {
  const messageHash = web3.utils.sha3(messageToVerify);
  const signatureBytes = web3.utils.hexToBytes(signature);
  const signatureObject = {
    r: signatureBytes.slice(0, 32),
    s: signatureBytes.slice(32, 64),
    recoveryParam: Number('0x' + signatureBytes.slice(64, 66)) - 27
  };
  const publicKeyObject = secp256k1.keyFromPublic(proxyWalletPublicKey, 'hex');
  const isVerified = publicKeyObject.verify(messageHash, signatureObject); // Returns true if the signature is valid, false otherwise
  return isVerified;
}


}); 
async function verifySignature() {
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];
    const signature = await ethereum.request({ method: 'eth_sign', params: [address, 'Access Request'] });
    const response = await fetch('http://localhost:3000/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature })
    });
    if (response.ok) {
      // Perform the action that required the signature here
    } else {
      throw new Error('Access Denied');
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
