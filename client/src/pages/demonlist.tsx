import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemonCard } from "@/components/DemonCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, PlusCircle, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import type { Demon } from "@shared/schema";

export default function Demonlist() {
  const { user, isAdmin } = useAuth();
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const { data: demons, isLoading } = useQuery<Demon[]>({
    queryKey: ["/api/demons"],
  });

  const filteredDemons = demons?.filter(
    demon => difficultyFilter === "all" || demon.difficulty === difficultyFilter
  ).sort((a, b) => a.position - b.position) || [];

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
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">
                  Demonlist
                </h1>
                <p className="text-muted-foreground text-lg">
                  The definitive ranking of Geometry Dash's hardest demons
                </p>
              </div>
              
              <Button asChild data-testid="button-submit-new">
                <Link href="/submit">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Submit Record
                </Link>
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Filter by difficulty:</span>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-40" data-testid="select-difficulty-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Insane">Insane</SelectItem>
                    <SelectItem value="Extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <span className="text-sm text-muted-foreground">
                Showing {filteredDemons.length} demon{filteredDemons.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Demons List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : filteredDemons.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No demons found. Check back later!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDemons.map(demon => (
                  <DemonCard key={demon.id} demon={demon} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
