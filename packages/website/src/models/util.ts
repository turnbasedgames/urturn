import { io } from 'socket.io-client';
import logger from '../logger';

if (process.env.REACT_APP_API_URL == null) {
  throw new Error('REACT_APP_API_URL env variable not set! This must be set in order to send requests to the right backend.');
}

const API_URL = process.env.REACT_APP_API_URL;

const socket = io(API_URL, { transports: ['websocket'] });

socket.on('connect', () => {
  logger.log('socket connected: ', socket.id);
});

socket.on('disconnect', (reason) => {
  logger.log('socket disconnected with reason: ', reason);
  if (reason === 'io server disconnect') {
    logger.log('manually trying to reconnect socket');
    socket.connect();
  }
});

export { API_URL, socket };
