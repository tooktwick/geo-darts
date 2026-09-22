const http = require('http');

http.get('http://localhost:5173', (res) => {
  console.log('Status code:', res.statusCode);
  process.exit(0);
}).on('error', (err) => {
  console.log('Error connecting to server:', err.message);
  process.exit(1);
});
