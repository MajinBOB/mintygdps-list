import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Settings() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="font-display font-bold text-4xl mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            {/* Account Settings */}
            <Card className="p-8">
              <h2 className="font-display font-bold text-2xl mb-6">Account</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground mt-1" data-testid="text-settings-email">
                    {user.email}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-muted-foreground mt-1" data-testid="text-settings-name">
                    {user.firstName} {user.lastName}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-4">Danger Zone</p>
                  <Button variant="destructive" asChild data-testid="button-logout">
                    <a href="/api/logout" className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
