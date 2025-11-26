import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRecordSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Demon } from "@shared/schema";
import type { z } from "zod";

export default function SubmitRecord() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedListType, setSelectedListType] = useState<string>("demonlist");

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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/records"] });
      setLocation("/list?type=demonlist");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="font-display font-bold text-xl">Login Required</h2>
                <p className="text-muted-foreground">
                  You must be logged in to submit a record.
                </p>
                <Button className="w-full" asChild data-testid="button-login-redirect">
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" asChild data-testid="button-back">
              <Link href="/list?type=demonlist">
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
                    <FormItem>
                      <FormLabel>List Type</FormLabel>
                      <Select value={selectedListType} onValueChange={(value) => {
                        setSelectedListType(value);
                        form.setValue("demonId", "");
                      }}>
                        <FormControl>
                          <SelectTrigger data-testid="select-list-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="demonlist">Demonlist</SelectItem>
                          <SelectItem value="challenge">Challenge List</SelectItem>
                          <SelectItem value="unrated">Unrated List</SelectItem>
                          <SelectItem value="platformer">Platformer List</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name="demonId"
                      render={({ field }) => {
                        const filteredDemons = demons?.filter((d) => d.listType === selectedListType).sort((a, b) => a.position - b.position) || [];
                        return (
                          <FormItem>
                            <FormLabel>Demon</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-demon">
                                  <SelectValue placeholder="Select a demon" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredDemons.map((demon) => (
                                  <SelectItem key={demon.id} value={demon.id}>
                                    #{demon.position} - {demon.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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
