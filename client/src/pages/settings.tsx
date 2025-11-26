import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

const usernameSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
});

type UsernameFormData = z.infer<typeof usernameSchema>;

export default function Settings() {
  const { user, isLoading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const form = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: user?.username || "",
    },
  });

  const onSubmit = async (data: UsernameFormData) => {
    setIsUpdating(true);
    try {
      await apiRequest("PATCH", "/api/auth/profile", data);
      toast({
        title: "Success",
        description: "Username updated successfully!",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <p className="text-muted-foreground mt-1" data-testid="text-settings-username">
                    {user.username}
                  </p>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your unique username"
                              {...field}
                              value={field.value || ""}
                              data-testid="input-username"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-2">
                            This will be displayed on the leaderboard
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isUpdating} data-testid="button-update-username">
                      {isUpdating ? "Updating..." : "Update Username"}
                    </Button>
                  </form>
                </Form>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-4">Danger Zone</p>
                  <Button variant="destructive" asChild data-testid="button-logout">
                    <a href="/logout" className="flex items-center gap-2">
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
