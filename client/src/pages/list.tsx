import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { DemonCard } from "@/components/DemonCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";
import type { Demon } from "@shared/schema";

export default function ListPage() {
  const [location] = useLocation();
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  
  // Get listType from query params
  const queryParams = new URLSearchParams(location.split("?")[1]);
  const listType = queryParams.get("type") || "demonlist";

  const { data: demons, isLoading } = useQuery<Demon[]>({
    queryKey: ["/api/demons", listType],
    queryFn: async () => {
      const response = await fetch(`/api/demons?listType=${listType}`);
      if (!response.ok) throw new Error("Failed to fetch demons");
      return response.json();
    },
  });

  const filteredDemons = demons?.filter(
    (demon) => difficultyFilter === "all" || demon.difficulty === difficultyFilter
  ).sort((a, b) => a.position - b.position) || [];

  const listLabels: Record<string, string> = {
    demonlist: "Demonlist",
    challenge: "Challenge List",
    unrated: "Unrated List",
    upcoming: "Upcoming List",
  };

  const currentListLabel = listLabels[listType] || "Demonlist";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">
                  {currentListLabel}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Browse and filter demons from the {currentListLabel}
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
                Showing {filteredDemons.length} demon{filteredDemons.length !== 1 ? "s" : ""}
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
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No demons found in the {currentListLabel}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDemons.map((demon) => (
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
