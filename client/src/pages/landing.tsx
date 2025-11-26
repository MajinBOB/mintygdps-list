import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Trophy, Target, Users, ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/geometric_dash_hero_background.png";

type Stats = {
  totalDemons: number;
  verifiedRecords: number;
  activePlayers: number;
};

export default function Landing() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="font-display font-bold text-xl">MintyGDPS List</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/login">Login</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background" />
        
        <div className="relative container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-tight">
              MintyGDPS List
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
              Explore the hardest demons, track verified records, and compete with the best players worldwide
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild className="text-lg px-8" data-testid="button-view-demonlist">
                <a href="/demonlist">
                  View Demonlist
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-lg px-8 bg-background/10 backdrop-blur border-white/20 text-white hover:bg-background/20"
                data-testid="button-submit-record"
              >
                <a href="/submit">Submit Record</a>
              </Button>
            </div>
            
            {/* Live Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-white/90">
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-white">{stats?.totalDemons || 0}</p>
                <p className="text-sm uppercase tracking-wide">Total Demons</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-white">{stats?.verifiedRecords || 0}</p>
                <p className="text-sm uppercase tracking-wide">Verified Records</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-white">{stats?.activePlayers || 0}</p>
                <p className="text-sm uppercase tracking-wide">Active Players</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-center mb-12">
            Why Join Our Community?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl">Ranked Demonlist</h3>
              <p className="text-muted-foreground">
                Browse the most challenging demons ranked by difficulty and community consensus
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-xl">Submit & Verify</h3>
              <p className="text-muted-foreground">
                Submit your completions with video proof and get verified by our admin team
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl">Compete & Rank</h3>
              <p className="text-muted-foreground">
                Climb the leaderboard and earn points based on your demon completions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
            Ready to Join the Rankings?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign in to submit your records, track your progress, and compete with the best
          </p>
          <Button size="lg" asChild className="text-lg px-8" data-testid="button-get-started">
            <a href="/login">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 GD Demonlist. Community-driven Geometry Dash rankings.</p>
        </div>
      </footer>
    </div>
  );
}
