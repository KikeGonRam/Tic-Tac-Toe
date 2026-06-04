import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDS0ksvON0PnHZWkVntmXwF-vHhhiEPfWA",
  authDomain: "tictactoe-multiplayer-8dcb3.firebaseapp.com",
  databaseURL: "https://tictactoe-multiplayer-8dcb3-default-rtdb.firebaseio.com",
  projectId: "tictactoe-multiplayer-8dcb3",
  storageBucket: "tictactoe-multiplayer-8dcb3.firebasestorage.app",
  messagingSenderId: "93443450346",
  appId: "1:93443450346:web:a6105d1c514d322b223e93"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);
