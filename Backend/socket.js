const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Frontend URL
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Join event for updating socketId in DB
        socket.on('join', async (data) => {
            try {
                const { userId, userType } = data;
                if (!userId || !userType) {
                    return socket.emit('error', { message: 'Invalid user data' });
                }

                if (userType === 'user') {
                    await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                } else if (userType === 'captain') {
                    await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
                }

                console.log(`User ${userId} (${userType}) joined with socket ${socket.id}`);
            } catch (error) {
                console.error('Error updating socket ID:', error);
                socket.emit('error', { message: 'Failed to update socket ID' });
            }
        });

        // Event for updating location of captains
        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;

            if (!location || !location.ltd || !location.lng) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    ltd: location.ltd,
                    lng: location.lng,
                },
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

// Function to send messages to specific socketId
const sendMessageToSocketId = (socketId, messageObject) => {
    if (!socketId) {
        console.error('Invalid socket ID:', socketId);
        return;
    }

    console.log('Sending message:', messageObject);

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
};

module.exports = { initializeSocket, sendMessageToSocketId };
