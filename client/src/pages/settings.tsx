import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { COUNTRIES, getCountryFlag, getCountryName } from "@/lib/countries";
import { getInitials } from "@/lib/initials";

const usernameSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
});

const settingsSchema = z.object({
  profileImageUrl: z.string().optional(),
  country: z.string().optional(),
});

type UsernameFormData = z.infer<typeof usernameSchema>;
type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { user, isLoading } = useAuth();
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: user?.username || "",
    },
  });

  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      profileImageUrl: user?.profileImageUrl || "",
      country: user?.country || "none",
    },
  });

  const onSubmit = async (data: UsernameFormData) => {
    setIsUpdatingUsername(true);
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
      setIsUpdatingUsername(false);
    }
  };

  const onSettingsSubmit = async (data: SettingsFormData) => {
    setIsUpdatingSettings(true);
    try {
      const submitData = {
        profileImageUrl: data.profileImageUrl,
        country: data.country === "none" ? null : data.country,
      };
      await apiRequest("PATCH", "/api/auth/settings", submitData);
      toast({
        title: "Success",
        description: "Profile settings updated successfully!",
      });
      setPreviewImage(null);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        settingsForm.setValue("profileImageUrl", result);
      };
      reader.readAsDataURL(file);
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
                    <Button type="submit" disabled={isUpdatingUsername} data-testid="button-update-username">
                      {isUpdatingUsername ? "Updating..." : "Update Username"}
                    </Button>
                  </form>
                </Form>

              </div>
            </Card>

            {/* Profile Settings */}
            <Card className="p-8">
              <h2 className="font-display font-bold text-2xl mb-6">Profile Settings</h2>
              
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="space-y-4">
                    <FormLabel>Profile Picture</FormLabel>
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={previewImage || user?.profileImageUrl || undefined} className="object-cover" />
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          data-testid="input-profile-image"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                          data-testid="button-upload-image"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Picture
                        </Button>
                        {previewImage && (
                          <p className="text-xs text-muted-foreground">
                            New image selected - save to apply
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Country Selection */}
                  <FormField
                    control={settingsForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country (Optional)</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-country">
                              <SelectValue placeholder="Select a country..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.code} data-testid={`option-country-${country.code}`}>
                                <span>{getCountryFlag(country.code)}</span>
                                <span className="ml-2">{country.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                          Your country will be displayed on your leaderboard profile
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isUpdatingSettings} data-testid="button-update-settings">
                    {isUpdatingSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </Card>

            {/* Danger Zone */}
            <Card className="p-8 border-destructive/50">
              <h2 className="font-display font-bold text-2xl mb-6">Danger Zone</h2>
              <Button variant="destructive" asChild data-testid="button-logout">
                <a href="/logout" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
