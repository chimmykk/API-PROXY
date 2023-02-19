const http = require('http');

const hostname = '127.0.0.1';

const server = http.createServer((req, res) => {
  if (req.url === '/wallet') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify('0x0d657f444BF2AA726a085067C4E26e782d837452'));
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.statusCode = 200;
    res.end('OK');
  }
});

server.listen(() => {
  console.log(`Server running at http://${hostname}/`);
});
