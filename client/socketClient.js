const io  =require('socket.io-client');

const socket = io('http://localhost:3000'); // Use the correct server URL

socket.on('connect', () => {
  console.log('Connected to WebSocket client:', socket.id);

  socket.emit('joinRoom', 'posts-room');

  socket.on('postCreated', (post) => {
    console.log('New post received:', post);
  });
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});
