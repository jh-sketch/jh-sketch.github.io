const mongoose = require('mongoose');
const host = process.env.DB_HOST || '127.0.0.1';
const dbURI = `mongodb://${host}/travlr`;

const readLine = require('readline');

// Build the connection string and set the connection timeout.
// timeout is in milliseconds.
const connect = () => {
  setTimeout(() => mongoose.connect(dbURI), 1000);
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error: ', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Windows specific listener
if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

// Configure for graceful shutdown
const gracefulShutdown = (msg) => {
  mongoose.connection.close(() => {
    console.log(`Mongoose disconnected through ${msg}`);
  });
};

// Event listeners for shutdowns

// Called when nodemon restarts
process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart');
  process.kill(process.pid, 'SIGUSR2');
});

// Called on app termination
process.on('SIGINT', () => {
  gracefulShutdown('app termination');
  process.exit(0);
});

// Called on Heroku app termination
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown');
  process.exit(0);
});

// Make initial connection
connect();

// Import the mongoose schema
require('./travlr');
module.exports = mongoose;