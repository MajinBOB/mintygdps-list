import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  
  // Redirect to demonlist page as the main home
  useEffect(() => {
    setLocation("/demonlist");
  }, [setLocation]);
  
  return null;
}
