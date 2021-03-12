const socketio = require('socket.io');

module.exports = (httpServer) => {
  const io = socketio(httpServer);

  io.on('connection', (socket) => {
    console.log('a user conneccted');
  });
};
