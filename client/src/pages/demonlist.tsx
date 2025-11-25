import { useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";

export default function Demonlist() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to list page with demonlist as default type
    setLocation("/list?type=demonlist");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <p>Redirecting...</p>
      </main>
    </div>
  );
}
