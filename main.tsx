import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { db } from "./firebase";
import { ref, set, onValue } from "firebase/database";

// Example write
const dbRef = ref(db, 'mydata');
set(dbRef, { key1: 'value1' });

// Example read
onValue(dbRef, snapshot => {
  console.log(snapshot.val());
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
