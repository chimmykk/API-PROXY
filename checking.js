const express = require('express');
const Fingerprint = require('express-fingerprint');
const fingerprintParams = [
  Fingerprint.useragent,
  Fingerprint.geoip,
];

const app = express();

// Set up fingerprint middleware
app.use(Fingerprint({
  parameters: fingerprintParams
}));

// Define a route to handle fingerprint checks
app.get('/fingerprint', (req, res) => {
  // Get the browser fingerprint from the request object
  const browserFingerprint = req.fingerprint.hash;
  
  // Send the browser fingerprint back in the response
  res.send(`Browser fingerprint: ${browserFingerprint}`);
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
