//either perform using upgrade-contract

//or use and API-end point to verify ownership of the NFT using token ID

//IF fetch-api succesfully - provide
//proxy-ownership

const express = require('express');
const Web3 = require('web3');
const nftContractAbi = require('./nftContractAbi.json'); // Replace with actual ABI of the NFT contract

const app = express();

app.post('/transfer-nft', async (req, res) => {
  try {
    const { contractAddress, tokenId, proxyAddress } = req.body;
//api -request
    const web3 = new Web3('https://mainnet.infura.io/v3/your-infura-project-id');

    // Get the NFT contract instance
    const nftContract = new web3.eth.Contract(nftContractAbi, contractAddress);

    // Get the current owner of the NFT
    const currentOwner = await nftContract.methods.ownerOf(tokenId).call();

    // Verify that the retrieved owner matches the address provided as input
    if (currentOwner !== req.body.currentOwner) {
      return res.status(400).json({ error: 'The provided address is not the current owner of the NFT' });
    }

    // Transfer ownership of the NFT to the proxy address
    await nftContract.methods.transferFrom(currentOwner, proxyAddress, tokenId).send({ from: currentOwner });

    // Return a success response
    return res.json({ message: 'NFT ownership has been transferred successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while transferring NFT ownership' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
