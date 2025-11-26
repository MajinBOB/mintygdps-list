import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Pack } from "@shared/schema";

const LIST_NAMES: Record<string, string> = {
  demonlist: "Demonlist",
  challenge: "Challenge List",
  unrated: "Unrated List",
  upcoming: "Upcoming List",
  platformer: "Platformer List",
};

interface PackWithLevels extends Pack {
  levels: Array<{
    id: string;
    name: string;
    position: number;
    difficulty: string;
  }>;
}

export default function Packs() {
  const [listType, setListType] = useState<string>("demonlist");

  const { data: packs, isLoading } = useQuery<PackWithLevels[]>({
    queryKey: ["/api/packs", listType],
    queryFn: async () => {
      const response = await fetch(`/api/packs?listType=${listType}`);
      if (!response.ok) throw new Error("Failed to fetch packs");
      return response.json();
    },
  });

  const displayName = LIST_NAMES[listType] || listType;

  const difficultyColors: Record<string, string> = {
    Easy: "bg-green-500/20 text-green-700 dark:text-green-400",
    Medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
    Hard: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
    Insane: "bg-red-500/20 text-red-700 dark:text-red-400",
    Extreme: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="space-y-4">
              <div>
                <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">
                  Challenge Packs
                </h1>
                <p className="text-muted-foreground text-lg">
                  Complete entire packs to earn bonus points on the leaderboard
                </p>
              </div>

              {/* List Type Filter */}
              <div className="max-w-xs">
                <label className="text-sm font-medium block mb-2">Select List Type</label>
                <Select value={listType} onValueChange={setListType}>
                  <SelectTrigger data-testid="select-list-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demonlist">Demonlist</SelectItem>
                    <SelectItem value="challenge">Challenge List</SelectItem>
                    <SelectItem value="unrated">Unrated List</SelectItem>
                    <SelectItem value="upcoming">Upcoming List</SelectItem>
                    <SelectItem value="platformer">Platformer List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Packs Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : !packs || packs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No packs available for {displayName} yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packs.map((pack) => (
                  <Card
                    key={pack.id}
                    className="hover-elevate"
                    data-testid={`card-pack-${pack.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="font-display text-2xl mb-1">
                            {pack.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {pack.levels?.length || 0} levels
                          </p>
                        </div>
                        <Badge className="bg-primary/20 text-primary dark:text-primary-foreground">
                          +{pack.points} pts
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Levels List */}
                      {pack.levels && pack.levels.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Levels
                          </p>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {pack.levels.map((level, idx) => (
                              <div
                                key={level.id}
                                className="flex items-center justify-between gap-3 p-2 rounded bg-card/50"
                                data-testid={`level-${pack.id}-${level.id}`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    #{level.position} - {level.name}
                                  </p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={`flex-shrink-0 ${difficultyColors[level.difficulty] || "bg-gray-500/20"}`}
                                >
                                  {level.difficulty}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No levels in this pack yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
