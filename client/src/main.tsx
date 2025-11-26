import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { db } from "./firebase"; // ⭐ add this
import { ref, set, onValue } from "firebase/database"; // ⭐ add this

// Example write
const testRef = ref(db, "mydata");
set(testRef, { key1: "value1" });

// Example read
onValue(testRef, snapshot => {
  console.log("Firebase data:", snapshot.val());
});

createRoot(document.getElementById("root")!).render(<App />);
