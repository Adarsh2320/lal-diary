import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";

import { auth } from "../firebase/firebase.auth";

const googleProvider = new GoogleAuthProvider();

/* Email / Password */
export const signupWithEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

/* Google Login */
export const loginWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

/* Logout */
export const logout = () => signOut(auth);
