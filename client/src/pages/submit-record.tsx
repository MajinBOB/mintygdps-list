import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogOut, LayoutDashboard, ArrowLeft, Send } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRecordSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Demon } from "@shared/schema";
import type { z } from "zod";

export default function SubmitRecord() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: demons } = useQuery<Demon[]>({
    queryKey: ["/api/demons"],
  });

  const form = useForm<z.infer<typeof insertRecordSchema>>({
    resolver: zodResolver(insertRecordSchema),
    defaultValues: {
      demonId: "",
      videoUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertRecordSchema>) => {
      await apiRequest("POST", "/api/records", data);
    },
    onSuccess: () => {
      toast({
        title: "Record Submitted!",
        description: "Your submission is pending review by our admin team.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
      setLocation("/demonlist");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="font-display font-bold text-xl">GD Demonlist</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/demonlist">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-demonlist">
                Demonlist
              </a>
            </Link>
            <Link href="/leaderboard">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-leaderboard">
                Leaderboard
              </a>
            </Link>
            <Link href="/submit">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-submit">
                Submit Record
              </a>
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild data-testid="button-admin-panel">
                <Link href="/admin/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild data-testid="button-logout">
              <a href="/api/logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" asChild data-testid="button-back">
              <Link href="/demonlist">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Demonlist
              </Link>
            </Button>

            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">
                Submit Record
              </h1>
              <p className="text-muted-foreground text-lg">
                Submit your demon completion with video proof for verification
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Completion Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="demonId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Demon</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-demon">
                                <SelectValue placeholder="Select a demon" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {demons?.map((demon) => (
                                <SelectItem key={demon.id} value={demon.id}>
                                  #{demon.position} - {demon.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Proof URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              {...field}
                              data-testid="input-video-url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={mutation.isPending}
                      data-testid="button-submit-record"
                    >
                      {mutation.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit for Verification
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
