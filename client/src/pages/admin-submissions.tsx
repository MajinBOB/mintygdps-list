import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { RecordCard } from "@/components/RecordCard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Record } from "@shared/schema";

export default function AdminSubmissions() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/demonlist";
      }, 500);
    }
  }, [isAuthenticated, isLoading, isAdmin, toast]);

  const { data: records, isLoading: recordsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/records"],
  });

  const approveMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await apiRequest("POST", `/api/admin/records/${recordId}/approve`, {});
    },
    onSuccess: () => {
      toast({ title: "Record Approved", description: "The submission has been verified." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await apiRequest("POST", `/api/admin/records/${recordId}/reject`, {});
    },
    onSuccess: () => {
      toast({ title: "Record Rejected", description: "The submission has been denied." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/records"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const pendingRecords = records?.filter(r => r.status === "pending") || [];
  const approvedRecords = records?.filter(r => r.status === "approved") || [];
  const rejectedRecords = records?.filter(r => r.status === "rejected") || [];

  const style = {
    "--sidebar-width": "16rem",
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h1 className="font-display font-bold text-4xl mb-2">Verify Submissions</h1>
                <p className="text-muted-foreground text-lg">
                  Review and approve player record submissions
                </p>
              </div>

              <Tabs defaultValue="pending" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="pending" data-testid="tab-pending">
                    Pending ({pendingRecords.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved" data-testid="tab-approved">
                    Approved ({approvedRecords.length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected" data-testid="tab-rejected">
                    Rejected ({rejectedRecords.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {recordsLoading ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </>
                  ) : pendingRecords.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        No pending submissions. All caught up!
                      </p>
                    </div>
                  ) : (
                    pendingRecords.map(record => (
                      <RecordCard
                        key={record.id}
                        record={record}
                        onApprove={(r) => approveMutation.mutate(r.id)}
                        onReject={(r) => rejectMutation.mutate(r.id)}
                        showActions
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                  {recordsLoading ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </>
                  ) : approvedRecords.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        No approved records yet.
                      </p>
                    </div>
                  ) : (
                    approvedRecords.map(record => (
                      <RecordCard key={record.id} record={record} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                  {recordsLoading ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </>
                  ) : rejectedRecords.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        No rejected records.
                      </p>
                    </div>
                  ) : (
                    rejectedRecords.map(record => (
                      <RecordCard key={record.id} record={record} />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
