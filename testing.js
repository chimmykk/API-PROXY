const ethereumjsUtil = require('ethereumjs-util');
const { SignTypedDataVersion: a } = require('@metamask/eth-sig-util');
const express = require('express');
const Web3 = require('web3');
const contractAbi = require('./contractAbi.json');
const app = express();

const walletAddress = "walletaddress";
const infuraApiKey = "3376a33c419a4d249d680fa54ff8b6bf";
const contractAddress = "0x503cf3096dD8E64098c4b7d1c3963D1dCAc6B224"; // your contract address here

const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraApiKey}`);
const contract = new web3.eth.Contract(contractAbi, contractAddress);

app.use(express.json());

app.get('/wallet', (req, res) => {
  res.send(walletAddress);
});

app.post('/sign', async (req, res) => {
  const { signature, message, typedData, version, token } = req.body || {};

  if (token && token !== getToken()) {
    res.status(401).send('Unauthorized');
    return;
  }

  if (!signature || (!message && !typedData)) {
    res.status(400).send('Invalid request body');
    return;
  }

  if (message) {
    const signed = await signPersonalMessage(message);
    res.json(signed);
  } else if (typedData) {
    const signed = await signTypedData(typedData, version, signature);
    res.json(signed);
  }
});

async function signPersonalMessage(message) {
  const privateKey = Buffer.from('pvtkey', 'hex');

  const messageBuffer = ethereumjsUtil.toBuffer(message);
  const msgHash = ethereumjsUtil.hashPersonalMessage(messageBuffer);
  const { v, r, s } = ethereumjsUtil.ecsign(msgHash, privateKey);
  const signature = ethereumjsUtil.toRpcSig(v, r, s);

  return signature;
}

async function signTypedData(typedData, version, signature) {
  const privateKey = Buffer.from('pvtkey', 'hex');

  const typedDataHash = ethereumjsUtil.hashTypedDataLegacy(typedData);
  const { v, r, s } = ethereumjsUtil.ecsign(typedDataHash, privateKey);
  const rpcSig = ethereumjsUtil.toRpcSig(v, r, s, version);

  if (signature && signature !== rpcSig) {
    throw new Error('Signature mismatch');
  }

  return rpcSig;
}

function generateToken() {
  const token = ethereumjsUtil.sha3(Math.random().toString()).toString('hex');
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now
  localStorage.setItem('token', JSON.stringify({ token, expiresAt }));
  return token;
}

function getToken() {
  const tokenData = localStorage.getItem('token');

  if (!tokenData) {
    return null;
  }

  const { token, expiresAt } = JSON.parse(tokenData);

  if (Date.now() > expiresAt) {
    localStorage.removeItem('token');
    return null;
  }

  return token;
}

async function verifyNFTOwnership(address) {
  const tokenId = await contract.methods.tokenOfOwnerByIndex(address, 0).call();
  return tokenId !== "0";
}

app.post('/verify-nft', async (req, res) => {
  const { address } = req.body || {};

  if (!address) {
    res.status(400).send('Invalid request body');
    return;
  }

  const ownsNFT = await verifyNFTOwnership(address);

  res.json({ ownsNFT });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});