import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

export default function Leaderboard() {
  const { isAdmin } = useAuth();

  const { data: leaderboard, isLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="font-display font-bold text-xl">GD Demonlist</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/demonlist">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-demonlist">
                Demonlist
              </a>
            </Link>
            <Link href="/leaderboard">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-leaderboard">
                Leaderboard
              </a>
            </Link>
            <Link href="/submit">
              <a className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-submit">
                Submit Record
              </a>
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild data-testid="button-admin-panel">
                <Link href="/admin/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild data-testid="button-logout">
              <a href="/api/logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">
                Leaderboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Top players ranked by total points earned from demon completions
              </p>
            </div>

            {/* Leaderboard */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No players yet. Be the first to submit a record!
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
