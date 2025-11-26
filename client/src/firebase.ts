// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCKb2MTZRtE-S0C3jlWUmx-wmNIKLZ1-nA",
  authDomain: "mintygdps.firebaseapp.com",
  databaseURL: "https://mintygdps.firebaseio.com",
  projectId: "mintygdps"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
