import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function Logout() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await apiRequest("GET", "/api/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Always redirect to home, whether logout succeeded or not
        setLocation("/");
      }
    };

    performLogout();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Logging out...</p>
    </div>
  );
}
