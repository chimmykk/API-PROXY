const http = require('http');

const hostname = 'https://testapi-x3is.onrender.com/';
const port = 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify( '0d657f444BF2AA726a085067C4E26e782d837452' ));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
}); 
