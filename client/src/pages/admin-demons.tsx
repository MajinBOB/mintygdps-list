import { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { DemonCard } from "@/components/DemonCard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, GripVertical } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDemonSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Demon } from "@shared/schema";
import type { z } from "zod";

// Draggable demon card wrapper
function DraggableDemonCard({ demon, onEdit, onDelete }: {
  demon: Demon;
  onEdit: (demon: Demon) => void;
  onDelete: (demon: Demon) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: demon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-secondary rounded"
        data-testid={`drag-handle-${demon.id}`}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <DemonCard
          demon={demon}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions
        />
      </div>
    </div>
  );
}

export default function AdminDemons() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDemon, setEditingDemon] = useState<Demon | null>(null);
  const [deletingDemon, setDeletingDemon] = useState<Demon | null>(null);
  const [selectedListType, setSelectedListType] = useState<string>("demonlist");
  const [isReordering, setIsReordering] = useState(false);

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

  const { data: allDemons, isLoading: demonsLoading } = useQuery<Demon[]>({
    queryKey: ["/api/demons"],
  });

  // Filter demons by selected list type
  const demons = useMemo(() => {
    if (!allDemons) return [];
    return allDemons
      .filter((d) => d.listType === selectedListType)
      .sort((a, b) => a.position - b.position);
  }, [allDemons, selectedListType]);

  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 8 }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<z.infer<typeof insertDemonSchema>>({
    resolver: zodResolver(insertDemonSchema),
    defaultValues: {
      name: "",
      creator: "",
      verifier: "",
      difficulty: "Medium",
      position: 1,
      points: 100,
      videoUrl: "",
      listType: "demonlist",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertDemonSchema>) => {
      await apiRequest("POST", "/api/admin/demons", data);
    },
    onSuccess: () => {
      toast({ title: "Demon Created", description: "The demon has been added to the list." });
      queryClient.invalidateQueries({ queryKey: ["/api/demons"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof insertDemonSchema> }) => {
      await apiRequest("PUT", `/api/admin/demons/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Demon Updated", description: "Changes have been saved." });
      queryClient.invalidateQueries({ queryKey: ["/api/demons"] });
      setIsDialogOpen(false);
      setEditingDemon(null);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/demons/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: "Demon Deleted", description: "The demon has been removed." });
      queryClient.invalidateQueries({ queryKey: ["/api/demons"] });
      setDeletingDemon(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (order: Array<{ id: string; position: number }>) => {
      await apiRequest("POST", "/api/admin/demons/reorder", { demons: order, listType: selectedListType });
    },
    onSuccess: () => {
      toast({ title: "Order Updated", description: "Demon positions and points have been recalculated." });
      queryClient.invalidateQueries({ queryKey: ["/api/demons"] });
      setIsReordering(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (demon: Demon) => {
    setEditingDemon(demon);
    form.reset({
      name: demon.name,
      creator: demon.creator,
      verifier: demon.verifier || "",
      difficulty: demon.difficulty as any,
      position: demon.position,
      points: demon.points,
      videoUrl: demon.videoUrl || "",
      listType: demon.listType as any,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: z.infer<typeof insertDemonSchema>) => {
    if (editingDemon) {
      updateMutation.mutate({ id: editingDemon.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = demons.findIndex((d) => d.id === active.id);
      const newIndex = demons.findIndex((d) => d.id === over.id);

      const newOrder = arrayMove(demons, oldIndex, newIndex);
      const reorderData = newOrder.map((demon, index) => ({
        id: demon.id,
        position: index + 1,
      }));

      reorderMutation.mutate(reorderData);
    }
  };

  const style = {
    "--sidebar-width": "16rem",
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const listLabels: Record<string, string> = {
    demonlist: "Demonlist",
    challenge: "Challenge List",
    unrated: "Unrated List",
    upcoming: "Upcoming List",
  };

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
              {/* List Type Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Manage List:</span>
                <div className="flex gap-2">
                  {Object.entries(listLabels).map(([type, label]) => (
                    <Button
                      key={type}
                      variant={selectedListType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedListType(type)}
                      data-testid={`button-select-list-${type}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1 className="font-display font-bold text-4xl mb-2">Manage {listLabels[selectedListType]}</h1>
                  <p className="text-muted-foreground text-lg">
                    Add, edit, remove, or reorder demons from the {listLabels[selectedListType]}. Drag to reorder and automatically update rankings and points.
                  </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) {
                    setEditingDemon(null);
                    form.reset();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-demon">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Demon
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingDemon ? "Edit Demon" : "Add New Demon"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="listType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>List Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-list-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="demonlist">Demonlist</SelectItem>
                                  <SelectItem value="challenge">Challenge List</SelectItem>
                                  <SelectItem value="unrated">Unrated List</SelectItem>
                                  <SelectItem value="upcoming">Upcoming List</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Demon Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Bloodbath" {...field} data-testid="input-demon-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="creator"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Creator</FormLabel>
                                <FormControl>
                                  <Input placeholder="Riot" {...field} data-testid="input-demon-creator" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="verifier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verifier (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Verifier name" {...field} data-testid="input-demon-verifier" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="difficulty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Difficulty</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-demon-difficulty">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                    <SelectItem value="Insane">Insane</SelectItem>
                                    <SelectItem value="Extreme">Extreme</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                    data-testid="input-demon-position"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="points"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Points</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                    data-testid="input-demon-points"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="videoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video URL (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://youtube.com/..." {...field} data-testid="input-demon-video-url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={createMutation.isPending || updateMutation.isPending}
                          data-testid="button-save-demon"
                        >
                          {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editingDemon ? "Update Demon" : "Create Demon"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {demonsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : !demons || demons.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No demons in this list yet. Add your first demon!</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={demons.map((d) => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {demons.map((demon) => (
                        <DraggableDemonCard
                          key={demon.id}
                          demon={demon}
                          onEdit={handleEdit}
                          onDelete={setDeletingDemon}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </main>
        </div>
      </div>

      <AlertDialog open={!!deletingDemon} onOpenChange={() => setDeletingDemon(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Demon?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDemon?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDemon && deleteMutation.mutate(deletingDemon.id)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
