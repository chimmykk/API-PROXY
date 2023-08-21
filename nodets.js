const express = require('express');
const Fingerprint = require('express-fingerprint');
const axios = require('axios');
const ethereumjsUtil = require('ethereumjs-util');
const { SignTypedDataVersion: a } = require('@metamask/eth-sig-util');
const fingerprintParams = [
  Fingerprint.useragent,
  Fingerprint.geoip,
];
const app = express();
app.use(Fingerprint({
  parameters: fingerprintParams
}));
app.get('/', (req, res) => {
  res.send('check check!');
});
app.get('/verify-fingerprint', (req, res) => {
  axios.get('http://localhost:5000/credent/fingerprint.txt')
    .then(response => {
      const serverFingerprint = response.data.trim();
      const clientFingerprint = req.fingerprint.hash;
      console.log('Server fingerprint:', serverFingerprint);
      console.log('Client fingerprint:', clientFingerprint);
      if (clientFingerprint === serverFingerprint) {
        res.send('Fingerprint matched. You can now sign/verify.');
      } else {
        res.status(403).send('Fingerprint mismatch.');
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
});
const walletAddress = '"048343950616f89B36d1759bD79108E397F8bD09"';
app.use(express.json());
app.get('/wallet', (req, res) => {
  res.send(walletAddress);
});
app.post('/sign', async (req, res) => {
  const { signature, message, typedData, version } = req.body || {};
  if (!signature || (!message && !typedData)) {
    res.status(400).send('Invalid request body');
    return;
  }
axios.get('http://localhost:5000/credent/fingerprint.txt')
    .then(async response => {
      const serverFingerprint = response.data.trim();
      const clientFingerprint = req.fingerprint.hash;
      console.log('Server fingerprint:', serverFingerprint);
      console.log('Client fingerprint:', clientFingerprint);
      if (clientFingerprint !== serverFingerprint) {
        res.status(403).send('Fingerprint mismatch.');
        return;
      }
   if (message) {
        const signed = await signPersonalMessage(message);
        res.json(signed);
      } else if (typedData) {
        const signed = await signTypedData(typedData, version, signature);
        res.json(signed);
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
})
async function signPersonalMessage(message) {
  const e = walletAddress;
  const privateKey = Buffer.from('6bd74be8f3a50b3228dd0d6ca350c86a0917fec781485a1f9cd86e7f9d974077', 'hex');
  const messageBuffer = ethereumjsUtil.toBuffer(message);
  const msgHash = ethereumjsUtil.hashPersonalMessage(messageBuffer);
  const { v, r, s } = ethereumjsUtil.ecsign(msgHash, privateKey);
  const signature = ethereumjsUtil.toRpcSig(v, r, s);
  return signature;
}
async function signTypedData(typedData, version, signature) {
  const privateKey = Buffer.from('6bd74be8f3a50b3228dd0d6ca350c86a0917fec781485a1f9cd86e7f9d974077', 'hex');
  const typedDataHash = ethereumjsUtil.hashTypedDataLegacy(typedData);
  const { v, r, s } = ethereumjsUtil.ecsign(typedDataHash, privateKey);
  const rpcSig = ethereumjsUtil.toRpcSig(v, r, s, version);
  if (signature && signature !== rpcSig) {
    throw new Error('Signature mismatch');
  }
  return rpcSig;
}
const port = 8000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
