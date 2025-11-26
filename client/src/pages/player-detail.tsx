import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import type { Demon } from "@shared/schema";

type PlayerDetail = {
  user: {
    id: string;
    username: string;
    profileImageUrl?: string;
  };
  completedLevels: Demon[];
  verifiedLevels: Demon[];
  completionPoints: number;
  verifierPoints: number;
  totalPoints: number;
};

export default function PlayerDetail() {
  const { userId } = useParams<{ userId: string }>();
  const [, setLocation] = useLocation();

  const { data: player, isLoading } = useQuery<PlayerDetail>({
    queryKey: [`/api/players/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/players/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch player details");
      return response.json();
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-6">
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Player not found</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/leaderboard")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leaderboard
              </Button>
            </div>

            {/* Player Info */}
            <div>
              <h1 className="font-display font-bold text-4xl mb-2">
                {player.user.username}
              </h1>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {player.totalPoints}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-3xl font-bold text-accent">
                    {player.completionPoints}
                  </p>
                  <p className="text-sm text-muted-foreground">Completion Points</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {player.verifierPoints}
                  </p>
                  <p className="text-sm text-muted-foreground">Verifier Points</p>
                </Card>
              </div>
            </div>

            {/* Completed Levels */}
            <div>
              <h2 className="font-display font-bold text-2xl mb-6">
                Completed Levels ({player.completedLevels.length})
              </h2>
              {player.completedLevels.length === 0 ? (
                <p className="text-muted-foreground">No completed levels yet</p>
              ) : (
                <div className="space-y-4">
                  {player.completedLevels.map((level) => (
                    <Card
                      key={level.id}
                      className="p-4"
                      data-testid={`card-completed-${level.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{level.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            By {level.creator}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">#{level.position}</p>
                          <p className="text-sm text-primary font-semibold">
                            {level.points} pts
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Verified Levels */}
            <div>
              <h2 className="font-display font-bold text-2xl mb-6">
                Verified Levels ({player.verifiedLevels.length})
              </h2>
              {player.verifiedLevels.length === 0 ? (
                <p className="text-muted-foreground">No verified levels yet</p>
              ) : (
                <div className="space-y-4">
                  {player.verifiedLevels.map((level) => (
                    <Card
                      key={level.id}
                      className="p-4"
                      data-testid={`card-verified-${level.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{level.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            By {level.creator}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">#{level.position}</p>
                          <p className="text-sm text-accent font-semibold">
                            {level.points} pts
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
