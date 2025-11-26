import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Skeleton } from "@/components/ui/skeleton";

const LIST_NAMES: Record<string, string> = {
  demonlist: "Demonlist",
  challenge: "Challenge List",
  unrated: "Unrated List",
  platformer: "Platformer List",
};

export default function LeaderboardList() {
  const { listType } = useParams<{ listType: string }>();
  
  const { data: leaderboard, isLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard", listType],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?listType=${listType}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
    enabled: !!listType,
  });

  const displayName = LIST_NAMES[listType || ""] || listType;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">
                {displayName} Leaderboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Top players ranked by points earned from {displayName.toLowerCase()} completions
              </p>
            </div>

            {/* Leaderboard */}
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No players yet on this leaderboard. Be the first to submit a record!
                </p>
              </div>
            ) : (
              <LeaderboardTable entries={leaderboard} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
