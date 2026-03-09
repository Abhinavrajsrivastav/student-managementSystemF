import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOr8ZG5Dml9jBAVadkbd5Ig2f-aEJfX9M",
  authDomain: "app-c56a4.firebaseapp.com",
  databaseURL: "https://app-c56a4-default-rtdb.firebaseio.com",
  projectId: "app-c56a4",
  storageBucket: "app-c56a4.firebasestorage.app",
  messagingSenderId: "1053399727579",
  appId: "1:1053399727579:web:3958168cabb47b3923bbfe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { signInWithPopup, signOut };