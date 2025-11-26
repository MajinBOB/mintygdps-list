import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, X } from "lucide-react";
import type { Pack, Demon } from "@shared/schema";

export default function AdminPacks() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [listType, setListType] = useState<string>("demonlist");
  const [newPackName, setNewPackName] = useState("");
  const [newPackPoints, setNewPackPoints] = useState("0");
  const [selectedLevelIds, setSelectedLevelIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/demonlist";
      }, 500);
    }
  }, [isAuthenticated, isLoading, isAdmin, toast]);

  const { data: packs, isLoading: packsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/packs", listType],
    queryFn: async () => {
      const response = await fetch(`/api/admin/packs?listType=${listType}`);
      if (!response.ok) throw new Error("Failed to fetch packs");
      return response.json();
    },
  });

  const { data: demons } = useQuery<Demon[]>({
    queryKey: ["/api/demons", listType],
    queryFn: async () => {
      const response = await fetch(`/api/demons?listType=${listType}`);
      if (!response.ok) throw new Error("Failed to fetch demons");
      return response.json();
    },
  });

  const createPackMutation = useMutation({
    mutationFn: async () => {
      const packData = {
        name: newPackName,
        points: parseInt(newPackPoints),
        listType,
      };
      const response = await apiRequest("POST", "/api/admin/packs", packData);
      
      // Add selected levels to the pack
      if (selectedLevelIds.size > 0) {
        for (const demonId of selectedLevelIds) {
          await apiRequest("POST", `/api/admin/packs/${response.id}/levels`, { demonId });
        }
      }
      
      return response;
    },
    onSuccess: () => {
      toast({ title: "Pack Created", description: "New pack has been created successfully." });
      setNewPackName("");
      setNewPackPoints("0");
      setSelectedLevelIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packs"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePackMutation = useMutation({
    mutationFn: async (packId: string) => {
      await apiRequest("DELETE", `/api/admin/packs/${packId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Pack Deleted", description: "Pack has been removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const removeLevelMutation = useMutation({
    mutationFn: async ({ packId, demonId }: { packId: string; demonId: string }) => {
      await apiRequest("DELETE", `/api/admin/packs/${packId}/levels/${demonId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const style = {
    "--sidebar-width": "16rem",
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const filteredDemonsInPack = (pack: Pack & { levels: Demon[] }) => {
    return pack.levels || [];
  };

  const availableDemonsNotInPack = demons?.filter(
    d => !packs?.some(p => p.levels?.some((l: any) => l.id === d.id))
  ) || [];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h1 className="font-display font-bold text-4xl mb-2">Manage Packs</h1>
                <p className="text-muted-foreground text-lg">
                  Create and manage challenge packs for list types
                </p>
              </div>

              {/* List Type Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium">List Type:</span>
                <Select value={listType} onValueChange={setListType}>
                  <SelectTrigger className="w-48">
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

              {/* Create New Pack */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Pack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pack Name</label>
                    <Input
                      placeholder="e.g., Speed Run Pack"
                      value={newPackName}
                      onChange={(e) => setNewPackName(e.target.value)}
                      data-testid="input-pack-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bonus Points</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={newPackPoints}
                      onChange={(e) => setNewPackPoints(e.target.value)}
                      data-testid="input-pack-points"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Add Levels</label>
                    <Select
                      onValueChange={(demonId) => {
                        const newSet = new Set(selectedLevelIds);
                        if (newSet.has(demonId)) {
                          newSet.delete(demonId);
                        } else {
                          newSet.add(demonId);
                        }
                        setSelectedLevelIds(newSet);
                      }}
                    >
                      <SelectTrigger data-testid="select-add-level">
                        <SelectValue placeholder="Select levels to add..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDemonsNotInPack.map((demon) => (
                          <SelectItem key={demon.id} value={demon.id}>
                            #{demon.position} - {demon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedLevelIds.size > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedLevelIds).map((demonId) => {
                        const demon = demons?.find(d => d.id === demonId);
                        return (
                          <div key={demonId} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm">
                            {demon?.name}
                            <button
                              onClick={() => {
                                const newSet = new Set(selectedLevelIds);
                                newSet.delete(demonId);
                                setSelectedLevelIds(newSet);
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    onClick={() => createPackMutation.mutate()}
                    disabled={!newPackName.trim() || createPackMutation.isPending}
                    data-testid="button-create-pack"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Pack
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Packs */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Packs</h2>
                {packsLoading ? (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full" />
                    ))}
                  </>
                ) : packs?.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No packs yet. Create one to get started!
                    </p>
                  </div>
                ) : (
                  packs?.map((pack) => (
                    <Card key={pack.id} data-testid={`card-pack-${pack.id}`}>
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                          <CardTitle>{pack.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {pack.points} bonus points • {pack.levels?.length || 0} levels
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePackMutation.mutate(pack.id)}
                          data-testid={`button-delete-pack-${pack.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Levels in Pack:</label>
                          <div className="space-y-2">
                            {pack.levels && pack.levels.length > 0 ? (
                              pack.levels.map((level) => (
                                <div
                                  key={level.id}
                                  className="flex items-center justify-between p-2 bg-secondary rounded"
                                >
                                  <span className="text-sm">
                                    #{level.position} - {level.name}
                                  </span>
                                  <button
                                    onClick={() =>
                                      removeLevelMutation.mutate({
                                        packId: pack.id,
                                        demonId: level.id,
                                      })
                                    }
                                    className="text-destructive hover:text-destructive/80"
                                    data-testid={`button-remove-level-${level.id}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No levels in this pack yet.</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
