import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { DemonCard } from "@/components/DemonCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import type { Demon } from "@shared/schema";

export default function ListPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [listType, setListType] = useState<string>("demonlist");
  
  // Get listType from query params on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") || "demonlist";
    setListType(type);
  }, []);

  const { data: demons, isLoading } = useQuery<Demon[]>({
    queryKey: ["/api/demons", listType],
    queryFn: async () => {
      const response = await fetch(`/api/demons?listType=${listType}`);
      if (!response.ok) throw new Error("Failed to fetch demons");
      return response.json();
    },
  });

  const filteredDemons = demons?.filter(
    (demon) => {
      const matchesDifficulty = difficultyFilter === "all" || demon.difficulty === difficultyFilter;
      const matchesSearch = searchQuery === "" || 
        demon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        demon.creator.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDifficulty && matchesSearch;
    }
  ).sort((a, b) => a.position - b.position) || [];

  const listLabels: Record<string, string> = {
    demonlist: "Demonlist",
    challenge: "Challenge List",
    unrated: "Unrated List",
    upcoming: "Upcoming List",
    platformer: "Platformer List",
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

              {listType !== "upcoming" && (
                <Button asChild data-testid="button-submit-new">
                  <Link href="/submit">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Submit Record
                  </Link>
                </Button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-secondary/50">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 placeholder-muted-foreground"
                  data-testid="input-search-demons"
                />
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
              <div className="space-y-6">
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
