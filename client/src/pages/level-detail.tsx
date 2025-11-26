import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Trophy, Star } from "lucide-react";
import { Link } from "wouter";
import { extractYouTubeId } from "@/lib/pointSystem";
import type { Demon, Record } from "@shared/schema";

export default function LevelDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  
  // Get demonId from route params
  const demonId = params.id || null;

  const { data: demon, isLoading: demonLoading } = useQuery<Demon>({
    queryKey: ["/api/demons", demonId],
    queryFn: async () => {
      const response = await fetch(`/api/demons/${demonId}`);
      if (!response.ok) throw new Error("Failed to fetch demon");
      return response.json();
    },
    enabled: !!demonId,
  });

  const { data: victors = [] } = useQuery<any[]>({
    queryKey: ["/api/demons", demonId, "records"],
    queryFn: async () => {
      const response = await fetch(`/api/demons/${demonId}/records`);
      if (!response.ok) throw new Error("Failed to fetch records");
      return response.json();
    },
    enabled: !!demonId,
  });

  if (!demonId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Demon not found</p>
        </main>
      </div>
    );
  }

  if (demonLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (!demon) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Demon not found</p>
        </main>
      </div>
    );
  }

  const youtubeId = demon.videoUrl ? extractYouTubeId(demon.videoUrl) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Button */}
            <Button variant="ghost" asChild data-testid="button-back">
              <a onClick={() => window.history.back()} className="cursor-pointer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </a>
            </Button>

            {/* Header */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent text-white font-display font-bold text-2xl">
                  #{demon.position}
                </div>
                <div>
                  <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">
                    {demon.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">by {demon.creator}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Video and Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Video */}
                {youtubeId && (
                  <Card data-testid="card-verification-video">
                    <CardContent className="p-0">
                      <div className="aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="Verification Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Difficulty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DifficultyBadge difficulty={demon.difficulty} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-display font-bold text-lg">{demon.points}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Completions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span className="font-bold">{demon.completionCount}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Creator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{demon.creator}</p>
                    </CardContent>
                  </Card>
                </div>

                {demon.verifier && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Verifier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{demon.verifier}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Victors List */}
              <div className="lg:col-span-1">
                <Card data-testid="card-victors-list">
                  <CardHeader>
                    <CardTitle>Victors ({victors.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {victors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No verified completions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {victors.map((record, index) => (
                          <div
                            key={record.id}
                            className="text-sm p-2 rounded bg-secondary/50"
                            data-testid={`victor-${index}`}
                          >
                            <p className="font-medium">{record.user?.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(record.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
