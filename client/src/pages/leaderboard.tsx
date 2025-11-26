import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Trophy, Search } from "lucide-react";

const LISTS = [
  { id: "demonlist", name: "Demonlist", description: "Main ranked list" },
  { id: "challenge", name: "Challenge List", description: "Challenge demons" },
  { id: "unrated", name: "Unrated List", description: "Unrated levels" },
  { id: "platformer", name: "Platformer List", description: "Platformer levels" },
];

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: overall, isLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard"],
  });

  const filteredLeaderboard = overall?.filter(entry =>
    entry.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Page Header */}
            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">
                Leaderboards
              </h1>
              <p className="text-muted-foreground text-lg">
                View rankings for each list type
              </p>
            </div>

            {/* List Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LISTS.map((list) => (
                <Card
                  key={list.id}
                  className="p-6 hover-elevate cursor-pointer transition-all"
                  onClick={() => navigate(`/leaderboard/${list.id}`)}
                  data-testid={`card-leaderboard-${list.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-display font-bold text-xl mb-1">
                        {list.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {list.description}
                      </p>
                    </div>
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    data-testid={`button-view-${list.id}`}
                  >
                    View Rankings
                  </Button>
                </Card>
              ))}
            </div>

            {/* Overall Leaderboard Preview */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl mb-2">
                  Overall Rankings
                </h2>
                <p className="text-muted-foreground">
                  Combined points across all lists
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-overall"
                />
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !overall || overall.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg">
                  <p className="text-muted-foreground">
                    No players yet. Be the first to submit a record!
                  </p>
                </div>
              ) : filteredLeaderboard.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg">
                  <p className="text-muted-foreground">
                    No players found matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLeaderboard.map((entry, index) => (
                    <div
                      key={entry.user.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-card hover-elevate cursor-pointer"
                      onClick={() => navigate(`/player/${entry.user.id}`)}
                      data-testid={`row-overall-${index}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-display font-bold text-primary">
                        #{entry.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{entry.user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.completions} completions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-display text-primary">
                          {entry.points}
                        </p>
                        <p className="text-xs text-muted-foreground">pts</p>
                      </div>
                    </div>
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
