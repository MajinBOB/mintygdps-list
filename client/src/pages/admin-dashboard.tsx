import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/StatsCard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, FileCheck, Users, TrendingUp } from "lucide-react";
import type { Demon, Record } from "@shared/schema";

export default function AdminDashboard() {
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

  const { data: demons, isLoading: demonsLoading } = useQuery<Demon[]>({
    queryKey: ["/api/demons"],
  });

  const { data: records, isLoading: recordsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/records"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const isLoading = demonsLoading || recordsLoading || usersLoading;

  const pendingRecords = records?.filter((r: any) => r.status === "pending").length || 0;
  const totalDemons = demons?.length || 0;
  const totalUsers = users?.length || 0;
  const approvedRecords = records?.filter((r: any) => r.status === "approved").length || 0;
  const approvedThisWeek = records?.filter((r: any) => {
    if (r.status !== "approved" || !r.reviewedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(r.reviewedAt) > weekAgo;
  }).length || 0;

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
            <div className="max-w-7xl mx-auto space-y-8">
              <div>
                <h1 className="font-display font-bold text-4xl mb-2">Dashboard</h1>
                <p className="text-muted-foreground text-lg">
                  Manage your demonlist, verify submissions, and monitor activity
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Total Demons"
                    value={totalDemons}
                    icon={Trophy}
                  />
                  <StatsCard
                    title="Pending Submissions"
                    value={pendingRecords}
                    icon={FileCheck}
                    trend={pendingRecords > 0 ? "Needs attention" : "All caught up!"}
                  />
                  <StatsCard
                    title="Active Users"
                    value={totalUsers}
                    icon={Users}
                  />
                  <StatsCard
                    title="Approved This Week"
                    value={approvedThisWeek}
                    icon={TrendingUp}
                  />
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="p-6 rounded-lg border bg-card">
                  <h2 className="font-display font-semibold text-xl mb-4">Quick Actions</h2>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      • {pendingRecords} submission{pendingRecords !== 1 ? 's' : ''} waiting for review
                    </p>
                    <p className="text-muted-foreground">
                      • {totalDemons} demon{totalDemons !== 1 ? 's' : ''} in the list
                    </p>
                    <p className="text-muted-foreground">
                      • {totalUsers} registered user{totalUsers !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-lg border bg-card">
                  <h2 className="font-display font-semibold text-xl mb-4">Recent Activity</h2>
                  <p className="text-sm text-muted-foreground">
                    {approvedThisWeek} record{approvedThisWeek !== 1 ? 's' : ''} approved in the last 7 days
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
