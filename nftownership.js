//either perform using upgrade-contract

//or use and API-end point to verify ownership of the NFT using token ID

//IF fetch-api succesfully - provide
//proxy-ownership

const http = require('http');
const express = require('express');
const { ec } = require('elliptic');
const Web3 = require('web3');
const contractABI = require('./NFTContractABI.json');

const hostname = '127.0.0.1';
const port = 3000;
//infura
const web3 = new Web3('https://goerli.infura.io/v3/3376a33c419a4d249d680fa54ff8b6bf');

// Initialize the contract instance using its ABI and address
const contractAddress = '0xF4ee95274741437636e748DdAc70818B4ED7d043'; // Replace with your contract's address
const nftContract = new web3.eth.Contract(contractABI, contractAddress);

// Initialize the elliptic curve cryptography library for signing and verifying messages
//for the user's wallet -> proxy wallet 
const secp256k1 = new ec('secp256k1');

const app = express();

app.use(express.json());

// Endpoint to verify ownership of an NFT and grant proxy access
app.post('/verify', async (req, res) => {
  try {
    const userWalletAddress = req.body.address;
    const signature = req.body.signature;
    // the signature here is being /verify using the api-endpoint

    // Check if the NFT is still owned by the user
    const tokenId = 1; // Replace with the ID of your NFT
    // here tokenId= is specified we can change to balanceOf 
    // allow any users holding NFTs to verify the process
    const currentOwner = await nftContract.methods.ownerOf(tokenId).call();
    if (currentOwner !== userWalletAddress) {
      return res.status(400).json({ error: 'The NFT is not owned by the user' });
    }

    // Verify the signature with the user's wallet address
    const messageToVerify = 'Access Request';
    const messageHash = web3.utils.sha3(messageToVerify);
    const signatureBytes = web3.utils.hexToBytes(signature);
    const signatureObject = {
      r: signatureBytes.slice(0, 32),
      s: signatureBytes.slice(32, 64),
      recoveryParam: Number('0x' + signatureBytes.slice(64, 66)) - 27
    };
    const publicKeyObject = secp256k1.recoverPubKey(messageHash, signatureObject, signatureObject.recoveryParam, true);
    const publicKey = publicKeyObject.encode('hex');
    if (publicKey.toLowerCase() !== userWalletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Grant proxy ownership of the NFT
    const proxyAddress = '0x94ee95274741437636e748DdAc70818B4ED7d043'; 
    //Replace Proxy address.
    await nftContract.methods.approve(proxyAddress, tokenId).send({ from: userWalletAddress });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});
//localhost deployment
const server = http.createServer(app);
//Install npm -i express,web3,http
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
