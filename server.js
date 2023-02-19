const http = require('http');
const Web3 = require('web3');

const hostname = '127.0.0.1';
const port = 3000;
const infuraProjectId = '3376a33c419a4d249d680fa54ff8b6bf';
const nftContractAddress = '0xbB255DDcbc0e938B6927D21E54e807fF65deB3e4';
const proxyWalletAddress = '0x0d657f444BF2AA726a085067C4E26e782d837452';

const web3 = new Web3(`https://goerli.infura.io/v3/${infuraProjectId}`);

const server = http.createServer(async (req, res) => {
  if (req.url === '/wallet') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify('0x0d657f444BF2AA726a085067C4E26e782d837452'));
  } else if (req.url === '/verify-nft') {
    const userAddress = req.headers.useraddress;

    // Check if the user's wallet holds any NFT from the contract
    const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);
    const balance = await nftContract.methods.balanceOf(userAddress).call();
    if (balance <= 0) {
      res.statusCode = 400;
      res.end('User does not own any NFT from the contract');
      return;
    }

    // Provide access to sign a message using the proxy wallet
    const proxyWallet = new web3.eth.Contract(proxyWalletABI, proxyWalletAddress);
    const message = 'Hello, world!';
    const messageHash = web3.utils.sha3(message);
    const signature = await web3.eth.personal.sign(messageHash, proxyWalletAddress, '', { from: userAddress });
  
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ signature }));
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    res.end('OK');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
