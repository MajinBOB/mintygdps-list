import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Users, Zap } from "lucide-react";

type Stats = {
  totalDemons: number;
  verifiedRecords: number;
  activePlayers: number;
};

export default function Home() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });
  const lists = [
    { 
      value: "demonlist", 
      label: "Demonlist",
      description: "The official ranking of hardest demons"
    },
    { 
      value: "challenge", 
      label: "Challenge List",
      description: "Community-created challenge levels"
    },
    { 
      value: "unrated", 
      label: "Unrated List",
      description: "Unrated demon levels"
    },
    { 
      value: "upcoming", 
      label: "Upcoming List",
      description: "Upcoming demons to be rated"
    },
    { 
      value: "platformer", 
      label: "Platformer List",
      description: "Platformer-style demon levels"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6">
              <div>
                <h1 className="font-display font-bold text-5xl md:text-6xl mb-4">
                  Welcome Back
                </h1>
                <p className="text-xl text-muted-foreground">
                  Select a list to view demons and submit your completions
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <Card className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{stats?.totalDemons || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Demons</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-3">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-3xl font-bold text-accent">{stats?.verifiedRecords || 0}</p>
                  <p className="text-sm text-muted-foreground">Verified Records</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-primary">{stats?.activePlayers || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Players</p>
                </Card>
              </div>
            </section>

            {/* List Cards */}
            <section>
              <h2 className="font-display font-bold text-3xl mb-8 text-center">
                MintyGDPS Lists
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {lists.map((list) => (
                  <Card
                    key={list.value}
                    className="p-6 cursor-pointer hover-elevate transition-all"
                    data-testid={`card-list-${list.value}`}
                  >
                    <h3 className="font-display font-bold text-xl mb-2">
                      {list.label}
                    </h3>
                    <p className="text-muted-foreground mb-4">{list.description}</p>
                    <Button 
                      variant="ghost" 
                      asChild 
                      size="sm"
                      data-testid={`button-view-${list.value}`}
                    >
                      <Link href={`/list?type=${list.value}`}>
                        View List →
                      </Link>
                    </Button>
                  </Card>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="font-display font-bold text-3xl mb-8 text-center">
                Quick Actions
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 text-center hover-elevate">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2">Leaderboard</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    See how you rank against other players
                  </p>
                  <Button variant="outline" asChild size="sm" data-testid="button-view-leaderboard">
                    <Link href="/leaderboard">View Leaderboard</Link>
                  </Button>
                </Card>

                <Card className="p-6 text-center hover-elevate">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10 mb-4">
                    <Target className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2">Submit Record</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Submit your demon completions
                  </p>
                  <Button variant="outline" asChild size="sm" data-testid="button-submit-record">
                    <Link href="/submit">Submit Record</Link>
                  </Button>
                </Card>

                <Card className="p-6 text-center hover-elevate">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-2">My Profile</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    View your stats and history
                  </p>
                  <Button variant="outline" asChild size="sm" data-testid="button-view-profile">
                    <Link href="/profile">View Profile</Link>
                  </Button>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
