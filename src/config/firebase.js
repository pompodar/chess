// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqOIb7FALG1oE22BFbIu6mUUNYAn8kggs",
  authDomain: "chess-bdb1e.firebaseapp.com",
  projectId: "chess-bdb1e",
  storageBucket: "chess-bdb1e.appspot.com",
  messagingSenderId: "561813920161",
  appId: "1:561813920161:web:2d245824a9fc8a522213e0",
  measurementId: "G-QBHQC11CNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const name = result.user.displayName;
      const email = result.user.email;
      const profilePic = result.user.photoURL;

      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      localStorage.setItem("profilePic", profilePic);
    })
    .catch((error) => {
      console.error("Error loggin in with Google", error);
    });
};

export const db = getFirestore(app);