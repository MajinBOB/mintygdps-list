import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/initials";
import type { Record } from "@shared/schema";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  
  const { data: records, isLoading: recordsLoading } = useQuery<any[]>({
    queryKey: ["/api/records", user?.id],
    enabled: !!user?.id,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-6">
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12 flex items-center justify-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </main>
      </div>
    );
  }

  const initials = getInitials(user);
  const approvedRecords = records?.filter(r => r.status === "approved") || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Profile Header */}
            <Card className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="font-display font-bold text-3xl mb-2" data-testid="text-profile-name">
                    {user.username}
                  </h1>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="font-display font-bold text-2xl">
                        {approvedRecords.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Completions</p>
                    </div>
                    <div className="text-center">
                      <p className="font-display font-bold text-2xl">
                        {approvedRecords.reduce((sum, r) => sum + (r.demon?.points || 0), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                    <div className="text-center">
                      <p className="font-display font-bold text-2xl">
                        {records?.filter(r => r.status === "pending").length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Completion History */}
            <Card className="p-8">
              <h2 className="font-display font-bold text-2xl mb-6">Approved Completions</h2>
              
              {recordsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : approvedRecords.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No approved completions yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {approvedRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                      data-testid={`record-item-${record.id}`}
                    >
                      <div>
                        <p className="font-medium" data-testid={`record-name-${record.id}`}>
                          {record.demon?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.demon?.difficulty || "Unknown"} • {record.demon?.points || 0} pts
                        </p>
                      </div>
                      <p className="font-display font-bold text-primary">
                        {record.demon?.points || 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
