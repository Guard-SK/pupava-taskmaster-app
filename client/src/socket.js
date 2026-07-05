import { io } from 'socket.io-client';

// Connect dynamically to the same hostname on port 3000 in development, 
// or use window.location.origin in production.
const serverUrl = import.meta.env.DEV 
  ? `http://${window.location.hostname}:3000` 
  : window.location.origin;

export const socket = io(serverUrl);
