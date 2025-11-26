// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCKb2MTZRtE-S0C3jlWUmx-wmNIKLZ1-nA",
  authDomain: "mintygdps.firebaseapp.com",
  databaseURL: "https://mintygdps.firebaseio.com",
  projectId: "mintygdps"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const dbRef = ref(db, 'mydata');
set(dbRef, { key1: 'value1' });

onValue(dbRef, snapshot => {
  console.log(snapshot.val());
});
