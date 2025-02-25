const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket');
const port = process.env.PORT || 4000;

const server = http.createServer(app);

// Initialize socket.io
initializeSocket(server);

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
